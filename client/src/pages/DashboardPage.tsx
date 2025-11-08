import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';
import pomodoroService from '../services/pomodoroService';
import achievementsService from '../services/achievementsService';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, Zap, Award, BookOpen, Plus, Timer, Users, Target, Star, TrendingUp, Sparkles } from 'lucide-react';
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
            <div className="p-8 min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    const tasksValue = `${taskStats.completed} / ${taskStats.total}`;
    const studyHoursDisplay = formatMinutesToHours(pomodoroStats.totalMinutesStudied);
    const studyHoursValue = `${studyHoursDisplay.hours}h ${studyHoursDisplay.minutes}m`;
    const tasksCompletionPercent = taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 -left-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                <div className="absolute top-40 -right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
                <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
            </div>

            <div className="relative z-10 p-4 sm:p-8">
                {/* Welcome Section */}
                <div className="mb-8 animate-fadeIn">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-3 shadow-lg">
                            <Sparkles className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                Welcome back, {user?.name}! 👋
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Here's your learning progress at a glance
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mood-Based Learning Feature */}
                <div className="mb-8 animate-fadeIn animation-delay-200">
                    <MoodSelector />
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 animate-fadeIn animation-delay-400">
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
                        color="purple"
                        trend={achievementStats ? `${achievementStats.completionPercentage}%` : '0%'}
                    />
                </div>

                {/* Recent Achievements Section */}
                {recentAchievements.length > 0 && (
                    <div className="mb-8 animate-fadeIn animation-delay-600">
                        <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 rounded-2xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24" />
                            
                            <div className="relative z-10">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                                    <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                                        <div className="bg-white bg-opacity-20 p-2 rounded-xl">
                                            <Star size={28} className="text-yellow-300" />
                                        </div>
                                        Recent Achievements
                                    </h2>
                                    <Link 
                                        to="/achievements" 
                                        className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl hover:bg-opacity-90 font-semibold transition-all hover:scale-105 shadow-lg"
                                    >
                                        View All
                                        <TrendingUp size={18} />
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {recentAchievements.map((achievement, index) => (
                                        <div 
                                            key={index} 
                                            className="bg-white bg-opacity-15 backdrop-blur-lg p-5 rounded-xl border border-white border-opacity-20 hover:bg-opacity-25 transition-all hover:scale-105"
                                        >
                                            <h3 className="font-bold text-lg mb-2">{achievement.title}</h3>
                                            <p className="text-sm opacity-90 mb-3">{achievement.description}</p>
                                            <p className="text-xs opacity-75 flex items-center gap-1">
                                                <Star size={12} />
                                                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 animate-fadeIn animation-delay-800">
                    {/* Daily Tasks Breakdown */}
                    <div className="bg-white bg-opacity-80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white hover:shadow-2xl transition-shadow">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <CheckCircle size={20} className="text-green-600" />
                            </div>
                            Tasks This Week
                        </h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="day" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'white', 
                                        border: 'none', 
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Bar dataKey="tasks" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                                        <stop offset="100%" stopColor="#34d399" stopOpacity={0.8}/>
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Achievement Progress */}
                    <div className="bg-white bg-opacity-80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white hover:shadow-2xl transition-shadow">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <div className="bg-purple-100 p-2 rounded-lg">
                                    <Target size={20} className="text-purple-600" />
                                </div>
                                Achievement Progress
                            </h2>
                        </div>
                        {achievementStats ? (
                            <div className="space-y-6 text-center">
                                <div className="relative w-40 h-40 mx-auto mb-4">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                        <circle
                                            className="text-gray-200 stroke-current"
                                            strokeWidth="8"
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="transparent"
                                        ></circle>
                                        <circle
                                            className="text-purple-600 progress-ring stroke-current transition-all duration-1000"
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="transparent"
                                            strokeDasharray={`${achievementStats.completionPercentage * 2.51} 251`}
                                            style={{
                                                filter: 'drop-shadow(0 0 8px rgba(147, 51, 234, 0.5))'
                                            }}
                                        ></circle>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-3xl font-bold text-gray-900">
                                            {achievementStats.completionPercentage}%
                                        </span>
                                    </div>
                                </div>
                                <p className="text-lg font-bold text-gray-900 mb-2">
                                    {achievementStats.unlockedCount} of {achievementStats.totalAchievements} Unlocked
                                </p>
                                <p className="text-sm text-gray-600 mb-4">
                                    {achievementStats.lockedCount} more to go! Keep pushing! 🚀
                                </p>
                                <Link
                                    to="/achievements"
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all hover:scale-105 font-semibold"
                                >
                                    <Award size={18} />
                                    View Achievements
                                </Link>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">Loading achievement data...</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="animate-fadeIn animation-delay-1000">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                        <Zap size={28} className="text-indigo-600" />
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <ActionCard icon={<Users />} title="Join Study Room" to="/study-rooms" color="blue" />
                        <ActionCard icon={<Timer />} title="Start Timer" to="/pomodoro" color="orange" />
                        <ActionCard icon={<Plus />} title="Add Note" to="/notes" color="green" />
                        <ActionCard icon={<BookOpen />} title="Review Cards" to="/flashcards" color="purple" />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(20px, -50px) scale(1.1); }
                    50% { transform: translate(-20px, 20px) scale(0.9); }
                    75% { transform: translate(50px, 50px) scale(1.05); }
                }
                .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
                .animate-blob { animation: blob 7s infinite; }
                .animation-delay-200 { animation-delay: 0.2s; }
                .animation-delay-400 { animation-delay: 0.4s; }
                .animation-delay-600 { animation-delay: 0.6s; }
                .animation-delay-800 { animation-delay: 0.8s; }
                .animation-delay-1000 { animation-delay: 1s; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
            `}</style>
        </div>
    );
};

// Enhanced Stat Card Component
const StatCard = ({ icon, title, value, unit, color, isText = false, trend }: any) => {
    const colors: { [key: string]: { bg: string, icon: string, border: string } } = {
        blue: { 
            bg: 'from-blue-500 to-indigo-600', 
            icon: 'text-white', 
            border: 'border-blue-200' 
        },
        green: { 
            bg: 'from-green-500 to-emerald-600', 
            icon: 'text-white', 
            border: 'border-green-200' 
        },
        yellow: { 
            bg: 'from-yellow-500 to-orange-600', 
            icon: 'text-white', 
            border: 'border-yellow-200' 
        },
        purple: { 
            bg: 'from-purple-500 to-pink-600', 
            icon: 'text-white', 
            border: 'border-purple-200' 
        },
    };

    return (
        <div className="group bg-white bg-opacity-80 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 border border-white relative overflow-hidden">
            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colors[color].bg} opacity-0 group-hover:opacity-5 transition-opacity`} />
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color].bg} shadow-lg group-hover:scale-110 transition-transform`}>
                        {React.cloneElement(icon, { className: colors[color].icon })}
                    </div>
                    {trend && (
                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-full flex items-center gap-1">
                            <TrendingUp size={12} />
                            {trend}
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-600 mb-2 font-medium">{title}</p>
                {isText ? (
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                ) : (
                    <p className="text-3xl font-bold text-gray-900">
                        {value} <span className="text-sm font-medium text-gray-600">{unit}</span>
                    </p>
                )}
            </div>
        </div>
    );
};

// Enhanced Action Card Component
const ActionCard = ({ icon, title, to, color }: any) => {
    const colors: { [key: string]: string } = {
        blue: 'from-blue-500 to-indigo-600',
        orange: 'from-orange-500 to-red-600',
        green: 'from-green-500 to-emerald-600',
        purple: 'from-purple-500 to-pink-600',
    };

    return (
        <Link
            to={to}
            className="group bg-white bg-opacity-80 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-110 flex flex-col items-center justify-center text-center border border-white relative overflow-hidden"
        >
            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colors[color]} opacity-0 group-hover:opacity-10 transition-opacity`} />
            
            <div className="relative z-10">
                <div className={`bg-gradient-to-br ${colors[color]} p-4 rounded-2xl mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg`}>
                    {React.cloneElement(icon, { size: 28, className: "text-white" })}
                </div>
                <p className="font-semibold text-gray-800 group-hover:text-gray-900">{title}</p>
            </div>
        </Link>
    );
};