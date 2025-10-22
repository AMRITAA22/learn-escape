import React, { useState, useEffect } from 'react';
import achievementsService from '../services/achievementsService';
import { Award, Star, Flame, BookOpen, Zap, Trophy, Target, Clock, Moon, Sun } from 'lucide-react';

interface Achievement {
    id: string;
    title: string;
    description: string;
    isUnlocked: boolean;
    progress?: number;
    target?: number;
    unlockedAt?: string;
    requirement: {
        type: string;
        value: number;
    };
}

export const AchievementsPage = () => {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

    useEffect(() => {
        loadAchievements();
        loadStats();
    }, []);

    const loadAchievements = async () => {
        try {
            setIsLoading(true);
            const data = await achievementsService.getAchievements();
            setAchievements(data);
        } catch (error) {
            console.error('Failed to load achievements:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const data = await achievementsService.getAchievementStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const getAchievementIcon = (achievementId: string) => {
        const icons: { [key: string]: React.ReactNode } = {
            first_session: <Zap size={32} />,
            week_streak: <Flame size={32} />,
            hour_master: <Clock size={32} />,
            task_warrior: <Target size={32} />,
            note_taker: <BookOpen size={32} />,
            century_club: <Trophy size={32} />,
            early_bird: <Sun size={32} />,
            night_owl: <Moon size={32} />,
        };
        return icons[achievementId] || <Award size={32} />;
    };

    const getAchievementColor = (achievementId: string) => {
        const colors: { [key: string]: string } = {
            first_session: 'bg-blue-100 text-blue-600',
            week_streak: 'bg-orange-100 text-orange-600',
            hour_master: 'bg-yellow-100 text-yellow-600',
            task_warrior: 'bg-green-100 text-green-600',
            note_taker: 'bg-purple-100 text-purple-600',
            century_club: 'bg-indigo-100 text-indigo-600',
            early_bird: 'bg-amber-100 text-amber-600',
            night_owl: 'bg-slate-100 text-slate-600',
        };
        return colors[achievementId] || 'bg-gray-100 text-gray-600';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading achievements...</p>
                </div>
            </div>
        );
    }

    const unlockedAchievements = achievements.filter(a => a.isUnlocked);
    const lockedAchievements = achievements.filter(a => !a.isUnlocked);
    const progressPercent = stats ? stats.completionPercentage : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
            {/* Header */}
            <div className="mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Achievements</h1>
                <p className="text-gray-600">Unlock badges as you progress on your learning journey</p>
            </div>

            {/* Progress Overview */}
            {stats && (
                <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-gray-600 mb-2">Overall Progress</p>
                            <p className="text-4xl font-bold text-gray-900">
                                {stats.unlockedCount} / {stats.totalAchievements} <span className="text-lg text-gray-600">Badges</span>
                            </p>
                        </div>
                        <div className="text-center">
                            <Trophy className="text-yellow-500 mb-2 mx-auto" size={48} />
                            <p className="text-2xl font-bold text-gray-900">{progressPercent}%</p>
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Keep learning to unlock more achievements!</p>
                </div>
            )}

            {/* Unlocked Achievements */}
            {unlockedAchievements.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Unlocked ({unlockedAchievements.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {unlockedAchievements.map((achievement) => (
                            <AchievementCard
                                key={achievement.id}
                                achievement={achievement}
                                icon={getAchievementIcon(achievement.id)}
                                color={getAchievementColor(achievement.id)}
                                onClick={() => setSelectedAchievement(achievement)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Locked Achievements */}
            {lockedAchievements.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Locked ({lockedAchievements.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {lockedAchievements.map((achievement) => (
                            <AchievementCard
                                key={achievement.id}
                                achievement={achievement}
                                icon={getAchievementIcon(achievement.id)}
                                color={getAchievementColor(achievement.id)}
                                onClick={() => setSelectedAchievement(achievement)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Achievement Detail Modal */}
            {selectedAchievement && (
                <AchievementModal
                    achievement={selectedAchievement}
                    icon={getAchievementIcon(selectedAchievement.id)}
                    color={getAchievementColor(selectedAchievement.id)}
                    onClose={() => setSelectedAchievement(null)}
                />
            )}
        </div>
    );
};

// Achievement Card Component
const AchievementCard = ({ achievement, icon, color, onClick }: any) => {
    const isUnlocked = achievement.isUnlocked;
    const progressPercent = achievement.progress && achievement.target 
        ? (achievement.progress / achievement.target) * 100 
        : 0;

    return (
        <div
            onClick={onClick}
            className={`p-6 rounded-lg cursor-pointer transition-all transform hover:scale-105 ${
                isUnlocked
                    ? `${color} shadow-lg border-2 border-current`
                    : 'bg-gray-100 text-gray-400 shadow opacity-60'
            }`}
        >
            <div className="flex justify-center mb-4">
                {icon}
            </div>
            <h3 className="font-bold text-center text-lg mb-1">{achievement.title}</h3>
            <p className="text-sm text-center opacity-75 mb-4">{achievement.description}</p>

            {/* Progress Bar for Locked Achievements */}
            {!isUnlocked && achievement.progress !== undefined && achievement.target !== undefined && (
                <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1 opacity-75">
                        <span>{achievement.progress}</span>
                        <span>{achievement.target}</span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-2">
                        <div
                            className="bg-current h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {isUnlocked && (
                <div className="mt-4 text-center">
                    <p className="text-xs font-bold uppercase opacity-75">Unlocked</p>
                    {achievement.unlockedAt && (
                        <p className="text-xs opacity-60 mt-1">
                            {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

// Achievement Detail Modal
const AchievementModal = ({ achievement, icon, color, onClose }: any) => {
    const progressPercent = achievement.progress && achievement.target 
        ? (achievement.progress / achievement.target) * 100 
        : 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full transform transition-all">
                <div className="text-center">
                    <div className={`inline-flex p-6 rounded-full mb-6 ${color}`}>
                        {icon}
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{achievement.title}</h2>
                    <p className="text-gray-600 mb-6">{achievement.description}</p>

                    {achievement.isUnlocked ? (
                        <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 mb-6">
                            <p className="text-green-700 font-bold">Achievement Unlocked!</p>
                            {achievement.unlockedAt && (
                                <p className="text-sm text-green-600">
                                    {new Date(achievement.unlockedAt).toLocaleString()}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="bg-gray-100 rounded-lg p-4 mb-6">
                            <p className="text-gray-700 font-semibold mb-2">Progress</p>
                            {achievement.progress !== undefined && achievement.target !== undefined ? (
                                <>
                                    <p className="text-2xl font-bold text-gray-900 mb-2">
                                        {achievement.progress} / {achievement.target}
                                    </p>
                                    <div className="w-full bg-gray-300 rounded-full h-3">
                                        <div
                                            className="bg-indigo-500 h-3 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {achievement.target - achievement.progress} more to go!
                                    </p>
                                </>
                            ) : (
                                <p className="text-gray-600">Complete the requirements to unlock this achievement.</p>
                            )}
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};