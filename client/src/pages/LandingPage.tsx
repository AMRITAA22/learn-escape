import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, BookOpen, Users, CheckSquare, BrainCircuit, Timer } from 'lucide-react';

// Helper component for Feature Cards
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

export const LandingPage = () => {
    return (
        <div className="bg-gray-50 text-gray-800">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-indigo-600">Learn Escape</h1>
                    <div>
                        <Link to="/login" className="text-indigo-600 font-semibold hover:underline mr-4">Login</Link>
                        <Link to="/register" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700 transition-colors">
                            Sign Up Free
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="pt-32 pb-20 text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
                        Your All-in-One <span className="text-indigo-600">Study Platform</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                        Collaborate in virtual study rooms, manage your tasks, and supercharge your learning with AI-powered tools.
                    </p>
                    <Link to="/register" className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-indigo-700 transition-colors">
                        Get Started
                    </Link>
                </div>
            </main>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <h3 className="text-3xl font-bold text-center mb-12">Features Designed for Success</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={<Users />}
                            title="Virtual Study Rooms"
                            description="Join public or private video/audio rooms to collaborate and stay motivated with friends."
                        />
                        <FeatureCard 
                            icon={<BrainCircuit />}
                            title="AI Study Assistant"
                            description="Upload your notes and get instant answers, summaries, and insights from your personal AI tutor."
                        />
                        <FeatureCard 
                            icon={<BookOpen />}
                            title="Smart Flashcards"
                            description="Create and study flashcard decks. Let the AI generate answers for you to learn faster."
                        />
                        <FeatureCard 
                            icon={<CheckSquare />}
                            title="Task Management"
                            description="Organize your academic life with personal and group to-do lists, complete with progress tracking."
                        />
                         <FeatureCard 
                            icon={<Timer />}
                            title="Pomodoro Timer"
                            description="Boost your focus with customizable work and break intervals. Track your study streaks and total time."
                        />
                        <FeatureCard 
                            icon={<Zap />}
                            title="Achievement System"
                            description="Stay motivated by unlocking badges and climbing the ranks as you complete tasks and study sessions."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8">
                <div className="container mx-auto px-6 text-center">
                    <p>&copy; {new Date().getFullYear()} Learn Escape. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};