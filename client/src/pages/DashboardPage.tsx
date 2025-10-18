import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, Zap, Award, BookOpen, Plus, Timer, Users } from 'lucide-react';
import { MotivationalQuote } from '../components/dashboard/MotivationalQuote';

export const DashboardPage = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [taskStats, setTaskStats] = useState({ completed: 0, total: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            Promise.all([
                dashboardService.getDashboardData(),
                dashboardService.getTaskStats()
            ])
            .then(([data, stats]) => {
                setDashboardData(data);
                setTaskStats(stats);
            })
            .catch(err => console.error("Failed to load dashboard data", err))
            .finally(() => setIsLoading(false));
        }
    }, [user]);

    if (isLoading) {
        return <div>Loading dashboard...</div>;
    }

    const tasksValue = `${taskStats.completed} / ${taskStats.total}`;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-gray-500 mb-8">Here's a snapshot of your progress today.</p>
            <MotivationalQuote />
            <br></br>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Clock size={20} />} title="Study Hours Today" value={dashboardData?.studyHoursToday || 0} unit="hrs" color="blue" />
                <StatCard icon={<CheckCircle size={20} />} title="Tasks Completed" value={tasksValue} isText={true} color="green" />
                <StatCard icon={<Zap size={20} />} title="Study Streak" value={dashboardData?.studyStreak || 0} unit="days" color="yellow" />
                <StatCard icon={<Award size={20} />} title="Your Rank" value={`#${dashboardData?.rank || 'N/A'}`} isText={true} color="red" />
            </div>

            {/* Quick Actions */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
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

const StatCard = ({ icon, title, value, unit, color, isText = false }: any) => {
    const colors: { [key: string]: string } = {
        blue: 'bg-blue-100 text-blue-800',
        green: 'bg-green-100 text-green-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        red: 'bg-red-100 text-red-800',
    };
    return (
        <div className={`p-6 rounded-lg ${colors[color]}`}>
            <div className="flex items-center">
                {icon}
                <span className="text-sm font-semibold ml-2">{title}</span>
            </div>
            {isText ? (
                <p className="text-3xl font-bold mt-2 truncate">{value}</p>
            ) : (
                <p className="text-3xl font-bold mt-2">{value} <span className="text-lg font-medium">{unit}</span></p>
            )}
        </div>
    );
};

const ActionCard = ({ icon, title, to }: any) => (
    <Link to={to} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow flex flex-col items-center justify-center text-center">
        <div className="bg-gray-100 p-3 rounded-full mb-3">
            {React.cloneElement(icon, { size: 24, className: "text-gray-700" })}
        </div>
        <p className="font-semibold text-gray-700">{title}</p>
    </Link>
);