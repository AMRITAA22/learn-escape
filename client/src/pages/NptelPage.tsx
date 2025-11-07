import React, { useState, useEffect, useCallback } from 'react';
import nptelService from '../services/nptelService';
import { BookMarked, Brain, Plus, Trash2, Search, Loader2, X, ExternalLink } from 'lucide-react';

// Define types for our data
interface ITrackedCourse {
    _id: string;
    courseId: string;
    courseName: string;
    progress: number;
}

interface INptelData {
    subjects: string[];
    trackedCourses: ITrackedCourse[];
}

interface ISuggestion {
    course_name: string; 
    course_code: string; 
    discipline: string;
    course_url: string; // <-- 1. ADD URL TO INTERFACE
}

export const NptelPage = () => {
    const [data, setData] = useState<INptelData>({ subjects: [], trackedCourses: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [newSubject, setNewSubject] = useState('');
    
    const [suggestions, setSuggestions] = useState<ISuggestion[]>([]);
    const [isSuggestLoading, setIsSuggestLoading] = useState(false);
    const [currentSearch, setCurrentSearch] = useState('');

    const loadData = useCallback(async () => {
        try {
            const nptelData = await nptelService.getNptelData();
            setData(nptelData);
        } catch (error) {
            console.error('Failed to load NPTEL data', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAddSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubject.trim()) return;
        try {
            const updatedData = await nptelService.addSubject(newSubject);
            setData(updatedData);
            setNewSubject('');
        } catch (error) {
            console.error('Failed to add subject', error);
        }
    };

    const handleRemoveSubject = async (subject: string) => {
        try {
            const updatedData = await nptelService.removeSubject(subject);
            setData(updatedData);
        } catch (error) {
            console.error('Failed to remove subject', error);
        }
    };

    const handleGetSuggestions = async (subject: string) => {
        setIsSuggestLoading(true);
        setCurrentSearch(subject);
        setSuggestions([]);
        try {
            const suggestionsData = await nptelService.getSuggestions(subject);
            setSuggestions(suggestionsData);
        } catch (error) {
            console.error('Failed to get suggestions', error);
        } finally {
            setIsSuggestLoading(false);
        }
    };

    const handleTrackCourse = async (course: ISuggestion) => {
        try {
            const updatedData = await nptelService.trackCourse({
                courseId: course.course_code,
                courseName: course.course_name, // <-- WAS course.name
            });
            setData(updatedData);
        } catch (error) {
            console.error('Failed to track course', error);
        }
    };

    const handleUpdateProgress = async (courseId: string, progress: number) => {
        if (progress < 0 || progress > 100) return;
        
        // Optimistic UI update
        setData(prev => ({
            ...prev,
            trackedCourses: prev.trackedCourses.map(c => 
                c.courseId === courseId ? { ...c, progress } : c
            )
        }));

        try {
            // Debounced save
            await nptelService.updateProgress(courseId, progress);
        } catch (error) {
            console.error('Failed to update progress', error);
            // Rollback on error
            loadData();
        }
    };
    
    const isTracking = (courseId: string) => {
        return data.trackedCourses.some(c => c.courseId === courseId);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                    <BookMarked className="w-10 h-10 text-indigo-600" /> NPTEL Tracker
                </h1>
                <p className="text-gray-600">Add your subjects to find and track NPTEL courses.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* --- LEFT COLUMN: Subjects & Suggestions --- */}
                <div className="space-y-6">
                    {/* My Subjects */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Brain className="w-6 h-6 text-purple-600" /> My Subjects
                        </h2>
                        <form onSubmit={handleAddSubject} className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newSubject}
                                onChange={(e) => setNewSubject(e.target.value)}
                                placeholder="e.g., Data Structures"
                                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button type="submit" className="bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-700 transition">
                                <Plus size={20} />
                            </button>
                        </form>
                        <div className="space-y-2">
                            {data.subjects.length === 0 && <p className="text-gray-500 text-sm">Add your first subject to get recommendations.</p>}
                            {data.subjects.map((subject) => (
                                <div key={subject} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                    <span className="font-medium text-gray-800">{subject}</span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleGetSuggestions(subject)}
                                            className="text-indigo-600 hover:text-indigo-800 p-1.5 rounded-md hover:bg-indigo-50" title="Find Courses">
                                            <Search size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleRemoveSubject(subject)}
                                            className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50" title="Remove Subject">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Course Suggestions */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Suggestions</h2>
                        {isSuggestLoading && (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                                <p className="ml-2 text-gray-600">Finding courses for "{currentSearch}"...</p>
                            </div>
                        )}
                        {!isSuggestLoading && suggestions.length === 0 && (
                            <p className="text-gray-500 text-sm text-center py-8">
                                {currentSearch ? `No suggestions found for "${currentSearch}".` : 'Click "Search" on a subject to see recommendations.'}
                            </p>
                        )}
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {suggestions.map((course) => (
                                <div key={course.course_code} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                    
                                    {/* --- 2. THIS IS THE UPDATED SECTION --- */}
                                    <div className="flex-1 overflow-hidden"> {/* Prevents long text from breaking layout */}
                                        <div className="flex items-center gap-2">
                                            <a 
                                                href={course.course_url} // Use the URL from our data
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="font-medium text-gray-800 truncate hover:text-indigo-600 hover:underline"
                                                title={course.course_name}
                                            >
                                                {course.course_name}
                                            </a>
                                            <a 
                                                href={course.course_url}
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-indigo-500 hover:text-indigo-700 flex-shrink-0"
                                                title="Open course in NPTEL"
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                        </div>
                                        <p className="text-sm text-gray-500">{course.discipline} ({course.course_code})</p>
                                    </div>
                                    {/* --- END OF UPDATE --- */}

                                    <button 
                                        onClick={() => handleTrackCourse(course)}
                                        disabled={isTracking(course.course_code)}
                                        className="ml-2 bg-green-600 text-white px-3 py-1 text-sm rounded-md hover:bg-green-700 transition disabled:bg-gray-400 flex-shrink-0"
                                    >
                                        {isTracking(course.course_code) ? 'Tracking' : 'Track'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: My Tracked Courses --- */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">My Tracked Courses</h2>
                    <div className="space-y-4">
                        {data.trackedCourses.length === 0 && <p className="text-gray-500 text-sm">Courses you "Track" will appear here.</p>}
                        {data.trackedCourses.map((course) => (
                            <div key={course.courseId} className="border border-gray-200 p-4 rounded-lg">
                                <p className="font-semibold text-gray-900">{course.courseName}</p>
                                <p className="text-sm text-gray-500 mb-3">{course.courseId}</p>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={course.progress}
                                        onChange={(e) => handleUpdateProgress(course.courseId, Number(e.target.value))}
                                        className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        style={{ accentColor: '#4f46e5' }}
                                    />
                                    <span className="font-semibold text-indigo-600 w-12 text-right">{course.progress}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};