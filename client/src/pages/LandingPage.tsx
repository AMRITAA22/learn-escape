import React, { useState, useEffect, useRef } from 'react';
import { Zap, BookOpen, Users, CheckSquare, BrainCircuit, Timer, ChevronDown, Sparkles } from 'lucide-react';

// Floating particles background
const FloatingParticles = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-2 h-2 bg-indigo-400 rounded-full opacity-20 animate-float"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${5 + Math.random() * 10}s`
                    }}
                />
            ))}
        </div>
    );
};

// Interactive Feature Card with 3D effect
const FeatureCard = ({ icon, title, description, delay, gradient }: { 
    icon: React.ReactNode, 
    title: string, 
    description: string, 
    delay: number,
    gradient: string 
}) => {
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        setRotation({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setRotation({ x: 0, y: 0 });
    };

    return (
        <div 
            ref={cardRef}
            className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 animate-fadeInUp cursor-pointer group overflow-hidden"
            style={{ 
                animationDelay: `${delay}ms`,
                transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(1.02)`
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Animated gradient background on hover */}
            <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
            
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500" />
            
            <div className="relative z-10">
                <div className={`flex items-center justify-center w-16 h-16 ${gradient} text-white rounded-xl mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg`}>
                    {icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>
            
            {/* Shine effect on hover */}
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
        </div>
    );
};

export default function LandingPage() {
    const [scrollY, setScrollY] = useState(0);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('mousemove', handleMouseMove);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const scrollToFeatures = () => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="bg-gray-50 text-gray-800 overflow-hidden">
            {/* Animated gradient cursor follower */}
            <div 
                className="fixed w-96 h-96 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-300 z-0"
                style={{
                    left: mousePosition.x - 192,
                    top: mousePosition.y - 192,
                }}
            />

            {/* Header with glassmorphism */}
            <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg shadow-lg z-50 animate-slideDown border-b border-indigo-100">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:rotate-180 transition-transform duration-500">
                            <Sparkles className="text-white w-5 h-5" />
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Learn Escape
                        </h1>
                    </div>
                    <div className="flex gap-4">
                        <a href="/login" className="text-indigo-600 font-semibold hover:text-indigo-800 transition-all duration-300 hover:scale-110 relative group">
                            Login
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300" />
                        </a>
                        <a href="/register" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-110 transform hover:-translate-y-1 relative overflow-hidden group">
                            <span className="relative z-10">Sign Up Free</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </a>
                    </div>
                </div>
            </header>

            {/* Hero Section with parallax */}
            <main className="relative pt-32 pb-24 min-h-screen flex items-center justify-center">
                <FloatingParticles />
                
                {/* Animated background blobs */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                    <div className="absolute top-1/3 -right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
                    <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
                </div>

                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="animate-fadeIn">
                        <h2 className="text-6xl md:text-7xl font-extrabold leading-tight mb-6 animate-slideUp">
                            Your All-in-One{' '}
                            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                                Study Platform
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 animate-fadeIn animation-delay-500 leading-relaxed">
                            Collaborate in virtual study rooms, manage your tasks, and supercharge your learning with AI-powered tools.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn animation-delay-1000">
                            <a 
                                href="/register" 
                                className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-10 rounded-xl text-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 transform overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Get Started <Sparkles className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </a>
                            <a 
                                href="#features" 
                                onClick={(e) => { e.preventDefault(); scrollToFeatures(); }}
                                className="bg-white text-indigo-600 font-bold py-4 px-10 rounded-xl text-lg border-2 border-indigo-600 hover:bg-indigo-50 hover:shadow-xl transition-all duration-300 hover:scale-110 transform"
                            >
                                Explore Features
                            </a>
                        </div>
                    </div>
                    
                    {/* Animated scroll indicator */}
                    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer" onClick={scrollToFeatures}>
                        <ChevronDown className="w-8 h-8 text-indigo-600" />
                    </div>
                </div>
            </main>

            {/* Features Section */}
            <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50 relative">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h3 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Features Designed for Success
                        </h3>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Everything you need to excel in your studies, all in one place
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={<Users className="w-8 h-8" />}
                            title="Virtual Study Rooms"
                            description="Join public or private video/audio rooms to collaborate and stay motivated with friends."
                            delay={100}
                            gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                        />
                        <FeatureCard 
                            icon={<BrainCircuit className="w-8 h-8" />}
                            title="AI Study Assistant"
                            description="Upload your notes and get instant answers, summaries, and insights from your personal AI tutor."
                            delay={200}
                            gradient="bg-gradient-to-br from-purple-500 to-pink-600"
                        />
                        <FeatureCard 
                            icon={<BookOpen className="w-8 h-8" />}
                            title="Smart Flashcards"
                            description="Create and study flashcard decks. Let the AI generate answers for you to learn faster."
                            delay={300}
                            gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
                        />
                        <FeatureCard 
                            icon={<CheckSquare className="w-8 h-8" />}
                            title="Task Management"
                            description="Organize your academic life with personal and group to-do lists, complete with progress tracking."
                            delay={400}
                            gradient="bg-gradient-to-br from-green-500 to-teal-600"
                        />
                        <FeatureCard 
                            icon={<Timer className="w-8 h-8" />}
                            title="Pomodoro Timer"
                            description="Boost your focus with customizable work and break intervals. Track your study streaks and total time."
                            delay={500}
                            gradient="bg-gradient-to-br from-orange-500 to-red-600"
                        />
                        <FeatureCard 
                            icon={<Zap className="w-8 h-8" />}
                            title="Achievement System"
                            description="Stay motivated by unlocking badges and climbing the ranks as you complete tasks and study sessions."
                            delay={600}
                            gradient="bg-gradient-to-br from-yellow-500 to-orange-600"
                        />
                    </div>
                </div>
            </section>
            <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-100 text-center rounded-3xl mt-16">
                <h2 className="text-4xl font-bold text-indigo-700 mb-4">
                    🌈 Mood-Based Learning
                </h2>
                <p className="max-w-2xl mx-auto text-lg text-gray-700">
                    LearnEscape adapts to how you feel — whether you are tired, relaxed, or focused, 
                    your study plan and environment adjust to keep you productive and balanced.
                </p>
            </section>


            {/* Footer */}
            <footer className="bg-gradient-to-r from-gray-900 to-indigo-900 text-white py-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 animate-gradient" />
                <div className="container mx-auto px-6 text-center relative z-10">
                    <p className="text-lg">&copy; {new Date().getFullYear()} Learn Escape. All rights reserved.</p>
                </div>
            </footer>

            <style>{`
                @keyframes slideDown {
                    from { transform: translateY(-100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    25% { transform: translateY(-20px) translateX(10px); }
                    50% { transform: translateY(-10px) translateX(-10px); }
                    75% { transform: translateY(-30px) translateX(5px); }
                }
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(20px, -50px) scale(1.1); }
                    50% { transform: translate(-20px, 20px) scale(0.9); }
                    75% { transform: translate(50px, 50px) scale(1.05); }
                }
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-slideDown { animation: slideDown 0.6s ease-out; }
                .animate-fadeIn { animation: fadeIn 1s ease-out; }
                .animate-slideUp { animation: slideUp 1s ease-out; }
                .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; }
                .animate-float { animation: float linear infinite; }
                .animate-blob { animation: blob 7s infinite; }
                .animate-gradient { 
                    background-size: 200% 200%; 
                    animation: gradient 8s ease infinite; 
                }
                .animation-delay-500 { animation-delay: 0.5s; }
                .animation-delay-1000 { animation-delay: 1s; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
            `}</style>
        </div>
    );
}