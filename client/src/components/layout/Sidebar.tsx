// client/src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
// THE FIX IS HERE: NotebookText is changed to BookText
import { LayoutDashboard, MessageSquare, BookText, CheckSquare, Target, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
{ name: 'Flashcards', path: '/flashcards', icon: BookOpen },


const Sidebar = () => {
    const { logout } = useAuth();

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Study Rooms', path: '/study-rooms', icon: MessageSquare },
        { name: 'Notes', path: '/notes', icon: BookText }, // AND HERE
        { name: 'Tasks', path: '/tasks', icon: CheckSquare },
        { name: 'Goals', path: '/goals', icon: Target },
        { name: 'AI Assistant', path: '/ai-assistant', icon: Sparkles },
    ];

    return (
        <div className="w-64 h-screen bg-gray-800 text-white flex flex-col">
            <div className="p-5 border-b border-gray-700">
                <h1 className="text-2xl font-bold">Learn Escape</h1>
            </div>
            <nav className="flex-grow p-3">
                {navLinks.map((link) => (
                    <NavLink
                        key={link.name}
                        to={link.path}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-2.5 my-1 rounded-md transition-colors duration-200 ${
                            isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
                            }`
                        }
                    >
                        <link.icon className="w-5 h-5 mr-3" />
                        {link.name}
                    </NavLink>
                ))}
            </nav>
            <div className="p-5 border-t border-gray-700">
                <button 
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2.5 rounded-md text-left hover:bg-red-600 transition-colors duration-200"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                </button>
            </div>
        </div>
    );
};


export default Sidebar;
