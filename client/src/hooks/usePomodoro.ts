import { useState, useEffect, useRef } from 'react';

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

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Load stats and streak from localStorage on initial load
    useEffect(() => {
        const savedStreak = parseInt(localStorage.getItem('pomodoroStreak') || '0', 10);
        const lastSessionDate = localStorage.getItem('lastPomodoroSession');
        const today = new Date();

        if (lastSessionDate) {
            const lastDate = new Date(lastSessionDate);
            if (!areOnSameDay(today, lastDate) && !areOnConsecutiveDays(today, lastDate)) {
                // If the last session was not today or yesterday, reset the streak
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

    // FIX: This effect updates the timer when the user changes the minutes
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

    return {
        timeLeft,
        isActive,
        mode,
        sessionsCompleted,
        totalMinutesStudied,
        dailyStreak,
        focusMinutes,
        setFocusMinutes,
        breakMinutes,
        setBreakMinutes,
        playPause,
        reset,
        switchMode,
    };
};