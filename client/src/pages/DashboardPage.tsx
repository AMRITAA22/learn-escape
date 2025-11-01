import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';
import pomodoroService from '../services/pomodoroService';
import achievementsService from '../services/achievementsService';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, Zap, Award, BookOpen, Plus, Timer, Users, Target, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MoodSelector } from "../components/dashboard/MoodSelector";

// Helper function to convert minutes to hours and minutes format
const formatMinutesToHours = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
};

// Mock data - Replace with actual API calls
const generateWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
        day,
        hours: Math.floor(Math.random() * 5) + 1,
        tasks: Math.floor(Math.random() * 8) + 2
    }));
};

export const DashboardPage = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [taskStats, setTaskStats] = useState({ completed: 0, total: 0 });
    const [pomodoroStats, setPomodoroStats] = useState({ sessionsCompleted: 0, totalMinutesStudied: 0 });
    const [achievementStats, setAchievementStats] = useState<any>(null);
    const [recentAchievements, setRecentAchievements] = useState<any[]>([]);
    const [weeklyData] = useState(generateWeeklyData());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            Promise.all([
                dashboardService.getDashboardData(),
                dashboardService.getTaskStats(),
                pomodoroService.getStats(),
                achievementsService.getAchievementStats(),
                achievementsService.getAchievements(),
            ])
                .then(([data, stats, pomodoroData, achStats, allAchievements]) => {
                    setDashboardData(data);
                    setTaskStats(stats);
                    setPomodoroStats(pomodoroData);
                    setAchievementStats(achStats);

                    // Get recently unlocked achievements (last 3)
                    const unlocked = allAchievements
                        .filter((a: any) => a.isUnlocked)
                        .sort((a: any, b: any) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
                        .slice(0, 3);
                    setRecentAchievements(unlocked);
                })
                .catch(err => console.error("Failed to load dashboard data", err))
                .finally(() => setIsLoading(false));
        }
    }, [user]);

    if (isLoading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading dashboard...</p>
            </div>
        );
    }

    const tasksValue = `${taskStats.completed} / ${taskStats.total}`;
    const studyHoursDisplay = formatMinutesToHours(pomodoroStats.totalMinutesStudied);
    const studyHoursValue = `${studyHoursDisplay.hours}h ${studyHoursDisplay.minutes}m`;
    const tasksCompletionPercent = taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Welcome back, {user?.name}! 👋
                </h1>
                <p className="text-gray-600">
                    Here's your learning progress at a glance
                </p>
            </div>

            {/* 🌈 Mood-Based Learning Feature */}
            <MoodSelector />

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={<Clock size={24} />}
                    title="Study Hours"
                    value={studyHoursValue}
                    isText={true}
                    color="blue"
                    trend="+12% this week"
                />
                <StatCard
                    icon={<CheckCircle size={24} />}
                    title="Tasks Completed"
                    value={tasksValue}
                    isText={true}
                    color="green"
                    trend={`${Math.round(tasksCompletionPercent)}% done`}
                />
                <StatCard
                    icon={<Zap size={24} />}
                    title="Sessions Done"
                    value={pomodoroStats.sessionsCompleted}
                    unit="sessions"
                    color="yellow"
                    trend="+5 this week"
                />
                <StatCard
                    icon={<Award size={24} />}
                    title="Achievements"
                    value={achievementStats ? `${achievementStats.unlockedCount}/${achievementStats.totalAchievements}` : '0/8'}
                    isText={true}
                    color="red"
                    trend={achievementStats ? `${achievementStats.completionPercentage}%` : '0%'}
                />
            </div>

            {/* Recent Achievements Section */}
            {recentAchievements.length > 0 && (
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-6 mb-8 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Star size={28} />
                            Recent Achievements
                        </h2>
                        <Link to="/achievements" className="text-sm bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold transition-colors">
                            View All
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {recentAchievements.map((achievement, index) => (
                            <div key={index} className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-lg">
                                <h3 className="font-bold text-lg mb-1">{achievement.title}</h3>
                                <p className="text-sm opacity-90">{achievement.description}</p>
                                <p className="text-xs opacity-75 mt-2">
                                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Daily Tasks Breakdown */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Tasks This Week</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="tasks" fill="#10b981" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Achievement Progress */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Achievement Progress</h2>
                        <Target size={20} className="text-purple-600" />
                    </div>
                    {achievementStats ? (
                        <div className="space-y-6 text-center">
                            <div className="relative w-40 h-40 mx-auto mb-4">
                                <svg className="w-full h-full" viewBox="0 0 100 100">
                                    <circle
                                        className="text-gray-200 stroke-current"
                                        strokeWidth="10"
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="transparent"
                                    ></circle>
                                    <circle
                                        className="text-purple-600 progress-ring stroke-current"
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="transparent"
                                        strokeDasharray={`${achievementStats.completionPercentage * 2.51} 251`}
                                        transform="rotate(-90 50 50)"
                                    ></circle>
                                    <text x="50" y="50" className="text-2xl font-bold" textAnchor="middle" dy=".3em" fill="currentColor">
                                        {achievementStats.completionPercentage}%
                                    </text>
                                </svg>
                            </div>
                            <p className="text-lg font-bold text-gray-900 mb-2">
                                {achievementStats.unlockedCount} of {achievementStats.totalAchievements} Unlocked
                            </p>
                            <p className="text-sm text-gray-600 mb-4">
                                {achievementStats.lockedCount} more to go!
                            </p>
                            <Link
                                to="/achievements"
                                className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                            >
                                View Achievements
                            </Link>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center">Loading achievement data...</p>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ActionCard icon={<Users />} title="Join Study Room" to="/study-rooms" />
                    <ActionCard icon={<Timer />} title="Start Timer" to="/pomodoro" />
                    <ActionCard icon={<Plus />} title="Add Note" to="/notes" />
                    <ActionCard icon={<BookOpen />} title="Review Cards" to="/flashcards" />
                </div>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard = ({ icon, title, value, unit, color, isText = false, trend }: any) => {
    const colors: { [key: string]: string } = {
        blue: 'bg-blue-50 border-blue-200',
        green: 'bg-green-50 border-green-200',
        yellow: 'bg-yellow-50 border-yellow-200',
        red: 'bg-red-50 border-red-200',
    };

    const iconColors: { [key: string]: string } = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        yellow: 'text-yellow-600',
        red: 'text-red-600',
    };

    return (
        <div className={`p-6 rounded-lg border-2 ${colors[color]} bg-white shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colors[color]}`}>
                    {React.cloneElement(icon, { className: `${iconColors[color]}` })}
                </div>
                {trend && <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">{trend}</span>}
            </div>
            <p className="text-sm text-gray-600 mb-2">{title}</p>
            {isText ? (
                <p className="text-3xl font-bold text-gray-900">{value}</p>
            ) : (
                <p className="text-3xl font-bold text-gray-900">
                    {value} <span className="text-sm font-medium text-gray-600">{unit}</span>
                </p>
            )}
        </div>
    );
};

// Action Card Component
const ActionCard = ({ icon, title, to }: any) => (
    <Link
        to={to}
        className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all hover:scale-105 flex flex-col items-center justify-center text-center border border-gray-100"
    >
        <div className="bg-gray-100 p-4 rounded-full mb-3">
            {React.cloneElement(icon, { size: 28, className: "text-gray-700" })}
        </div>
        <p className="font-semibold text-gray-800">{title}</p>
    </Link>
);

