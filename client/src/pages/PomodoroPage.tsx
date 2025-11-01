import React, { useState } from 'react';
import { usePomodoro } from '../hooks/usePomodoro';
import { Play, Pause, RotateCcw, Settings, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const userMood = localStorage.getItem("userMood");

// 💡 Adjust default timer settings and theme based on mood
let defaultWork = 25;
let defaultBreak = 5;
let themeColor = "#6366f1"; // Indigo default

switch (userMood) {
  case "focused":
    defaultWork = 25;
    defaultBreak = 5;
    themeColor = "#3b82f6"; // Blue
    break;
  case "tired":
    defaultWork = 15;
    defaultBreak = 10;
    themeColor = "#9ca3af"; // Gray
    break;
  case "stressed":
    defaultWork = 20;
    defaultBreak = 8;
    themeColor = "#f59e0b"; // Amber
    break;
  case "relaxed":
    defaultWork = 30;
    defaultBreak = 5;
    themeColor = "#10b981"; // Green
    break;
  default:
    break;
}

export const PomodoroPage = () => {
    const {
        timeLeft,
        isActive,
        mode,
        sessionsCompleted,
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
    } = usePomodoro(defaultWork, defaultBreak);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 transition-colors duration-500"
             style={{ backgroundColor: mode === 'focus' ? '#ffffff' : '#f0fff4' }}
        >
            {/* Main Timer Display */}
            <div className="w-80 h-80 rounded-full flex flex-col items-center justify-center shadow-lg mb-8 transition-all duration-500"
                 style={{
                     backgroundColor: isActive ? themeColor : 'white',
                     color: isActive ? 'white' : 'black'
                 }}
            >
                <p className="text-sm font-semibold uppercase tracking-wider opacity-80">
                    {mode === 'focus' ? 'Focus Session' : 'Time for a Break'}
                </p>
                <p className="text-7xl font-bold my-2">{formatTime(timeLeft)}</p>
                <div className="flex space-x-4">
                    <button onClick={() => switchMode('focus')}
                            className={`px-4 py-1 text-sm rounded-full ${
                                mode === 'focus'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300'
                            }`}>
                        Focus
                    </button>
                    <button onClick={() => switchMode('break')}
                            className={`px-4 py-1 text-sm rounded-full ${
                                mode === 'break'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300'
                            }`}>
                        Break
                    </button>
                </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center space-x-6">
                <button onClick={reset} className="p-4 rounded-full bg-gray-200 hover:bg-gray-300 transition" aria-label="Reset Timer">
                    <RotateCcw size={24} />
                </button>
                <button onClick={playPause}
                        className="w-20 h-20 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-105 transition"
                        style={{ backgroundColor: themeColor }}
                        aria-label={isActive ? 'Pause Timer' : 'Play Timer'}>
                    {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                </button>
                <button
                    onClick={() => setIsSettingsOpen(prev => !prev)}
                    className="p-4 rounded-full bg-gray-200 hover:bg-gray-300 transition"
                    aria-label="Settings"
                >
                    <Settings size={24} />
                </button>
            </div>

            {/* Statistics Display */}
            {isLoadingStats ? (
                <div className="mt-12 text-gray-500">Loading stats...</div>
            ) : (
                <div className="mt-12 flex space-x-8 text-center">
                    <div>
                        <p className="text-3xl font-bold">{sessionsCompleted}</p>
                        <p className="text-sm text-gray-500">Sessions Completed</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">
                            {studyHoursDisplay.hours}h {studyHoursDisplay.minutes}m
                        </p>
                        <p className="text-sm text-gray-500">Hours Studied</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold flex items-center justify-center">
                            <Zap size={28} className="text-yellow-500 mr-1" /> {dailyStreak}
                        </p>
                        <p className="text-sm text-gray-500">Daily Streak</p>
                    </div>
                </div>
            )}

            {/* Settings Inputs (Animated) */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="mt-8 p-6 bg-white rounded-lg shadow-md w-full max-w-md"
                    >
                        <h3 className="font-semibold text-lg mb-4">Settings</h3>
                        <div className="flex justify-between items-center">
                            <label htmlFor="focus-time">Focus Time (minutes):</label>
                            <input
                                id="focus-time"
                                type="number"
                                value={focusMinutes}
                                onChange={(e) => setFocusMinutes(Number(e.target.value))}
                                className="w-20 p-2 border rounded"
                                disabled={isActive}
                            />
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <label htmlFor="break-time">Break Time (minutes):</label>
                            <input
                                id="break-time"
                                type="number"
                                value={breakMinutes}
                                onChange={(e) => setBreakMinutes(Number(e.target.value))}
                                className="w-20 p-2 border rounded"
                                disabled={isActive}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
