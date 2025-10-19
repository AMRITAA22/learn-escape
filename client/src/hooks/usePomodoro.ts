import { useState, useEffect, useRef } from 'react';
import pomodoroService from '../services/pomodoroService';

type TimerMode = 'focus' | 'break';

// Helper function to check if two dates are on consecutive days
const areOnConsecutiveDays = (date1: Date, date2: Date) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
    return diffDays === 1;
};

// Helper function to check if two dates are on the same day
const areOnSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};

// Helper function to convert minutes to hours and minutes format
const formatMinutesToHours = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
};

export const usePomodoro = (initialFocusTime = 25, initialBreakTime = 5) => {
    const [focusMinutes, setFocusMinutes] = useState(initialFocusTime);
    const [breakMinutes, setBreakMinutes] = useState(initialBreakTime);

    const [mode, setMode] = useState<TimerMode>('focus');
    const [timeLeft, setTimeLeft] = useState(focusMinutes * 60);
    const [isActive, setIsActive] = useState(false);

    // Stats
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [totalMinutesStudied, setTotalMinutesStudied] = useState(0);
    const [dailyStreak, setDailyStreak] = useState(0);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // FETCH STATS FROM BACKEND ON COMPONENT MOUNT
    useEffect(() => {
        const loadStats = async () => {
            try {
                const stats = await pomodoroService.getStats();
                setSessionsCompleted(stats.sessionsCompleted || 0);
                setTotalMinutesStudied(stats.totalMinutesStudied || 0);
            } catch (error) {
                console.error("Failed to load stats", error);
            } finally {
                setIsLoadingStats(false);
            }
        };

        loadStats();

        // Load streak from localStorage
        const savedStreak = parseInt(localStorage.getItem('pomodoroStreak') || '0', 10);
        const lastSessionDate = localStorage.getItem('lastPomodoroSession');
        const today = new Date();

        if (lastSessionDate) {
            const lastDate = new Date(lastSessionDate);
            if (!areOnSameDay(today, lastDate) && !areOnConsecutiveDays(today, lastDate)) {
                setDailyStreak(0);
                localStorage.setItem('pomodoroStreak', '0');
            } else {
                setDailyStreak(savedStreak);
            }
        }
    }, []);

    // This effect handles the countdown timer
    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            // Timer finished
            const alarm = new Audio('/alarm.mp3');
            alarm.play();
            setIsActive(false);

            if (mode === 'focus') {
                setSessionsCompleted(prev => prev + 1);
                setTotalMinutesStudied(prev => prev + focusMinutes);
                updateStreak();

                // Log the session to the backend
                pomodoroService.logSession(focusMinutes)
                    .then(() => console.log("Session logged successfully"))
                    .catch(err => console.error("Failed to log session", err));

                setMode('break');
                setTimeLeft(breakMinutes * 60);
            } else {
                setMode('focus');
                setTimeLeft(focusMinutes * 60);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive, timeLeft, mode, focusMinutes, breakMinutes]);

    // This effect updates the timer when the user changes the minutes
    useEffect(() => {
        if (!isActive) {
            if (mode === 'focus') {
                setTimeLeft(focusMinutes * 60);
            } else {
                setTimeLeft(breakMinutes * 60);
            }
        }
    }, [focusMinutes, breakMinutes, mode, isActive]);

    const updateStreak = () => {
        const today = new Date();
        const lastSessionDateStr = localStorage.getItem('lastPomodoroSession');
        let currentStreak = parseInt(localStorage.getItem('pomodoroStreak') || '0', 10);

        if (lastSessionDateStr) {
            const lastDate = new Date(lastSessionDateStr);
            if (!areOnSameDay(today, lastDate)) {
                if (areOnConsecutiveDays(today, lastDate)) {
                    currentStreak++; // It was yesterday, so increment streak
                } else {
                    currentStreak = 1; // It was before yesterday, so reset streak to 1
                }
            }
            // If it's the same day, do nothing to the streak
        } else {
            currentStreak = 1; // First session ever
        }

        localStorage.setItem('pomodoroStreak', currentStreak.toString());
        localStorage.setItem('lastPomodoroSession', today.toISOString());
        setDailyStreak(currentStreak);
    };

    const playPause = () => setIsActive(!isActive);

    const reset = () => {
        setIsActive(false);
        if (mode === 'focus') {
            setTimeLeft(focusMinutes * 60);
        } else {
            setTimeLeft(breakMinutes * 60);
        }
    };

    const switchMode = (newMode: TimerMode) => {
        if (isActive) return; // Prevent switching while timer is active
        setMode(newMode);
    };

    // Get display format for hours and minutes
    const studyHoursDisplay = formatMinutesToHours(totalMinutesStudied);

    return {
        timeLeft,
        isActive,
        mode,
        sessionsCompleted,
        totalMinutesStudied,
        studyHoursDisplay,
        dailyStreak,
        focusMinutes,
        setFocusMinutes,
        breakMinutes,
        setBreakMinutes,
        playPause,
        reset,
        switchMode,
        isLoadingStats,
    };
};