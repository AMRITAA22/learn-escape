import React, { useState, useEffect } from 'react';
import tasksService from '../services/tasksService';
import { Trash2, Plus, Calendar, AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import achievementsService from '../services/achievementsService';

interface Task {
    _id: string;
    title: string;
    completed: boolean;
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
}

export const TasksPage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [editingTask, setEditingTask] = useState<string | null>(null);

    useEffect(() => {
        tasksService.getTasks()
            .then(setTasks)
            .finally(() => setIsLoading(false));
    }, []);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        try {
            const newTask = await tasksService.createTask({ 
                title: newTaskTitle,
                dueDate: newTaskDueDate || null
            });
            setTasks(prevTasks => [newTask, ...prevTasks]);
            setNewTaskTitle('');
            setNewTaskDueDate('');
        } catch (error) {
            console.error("Failed to create task", error);
        }
    };

    const handleToggleComplete = async (taskId: string, completed: boolean) => {
        try {
            const updatedTask = await tasksService.updateTask(taskId, { completed: !completed });
            setTasks(prevTasks => prevTasks.map(task => 
                task._id === taskId ? updatedTask : task
            ));
            
            if (!completed) {
                achievementsService.checkAchievements()
                    .catch(err => console.error("Failed to check achievements", err));
            }
        } catch (error) {
            console.error("Failed to update task", error);
        }
    };

    const handleUpdateDueDate = async (taskId: string, dueDate: string) => {
        try {
            const updatedTask = await tasksService.updateTask(taskId, { dueDate: dueDate || null });
            setTasks(prevTasks => prevTasks.map(task => 
                task._id === taskId ? updatedTask : task
            ));
            setEditingTask(null);
        } catch (error) {
            console.error("Failed to update task", error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await tasksService.deleteTask(taskId);
                setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
            } catch (error) {
                console.error("Failed to delete task", error);
            }
        }
    };

    const isOverdue = (dueDate: string | null) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
    };

    const isDueToday = (dueDate: string | null) => {
        if (!dueDate) return false;
        return new Date(dueDate).toDateString() === new Date().toDateString();
    };

    const formatDueDate = (dueDate: string | null) => {
        if (!dueDate) return null;
        const date = new Date(dueDate);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const incompleteTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Tasks</h1>
                    <p className="text-gray-600">
                        {incompleteTasks.length} task{incompleteTasks.length !== 1 ? 's' : ''} remaining
                    </p>
                </div>

                {/* Add Task Form */}
                <form onSubmit={handleCreateTask} className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Add a new task..."
                            className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="relative">
                            <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                value={newTaskDueDate}
                                onChange={(e) => setNewTaskDueDate(e.target.value)}
                                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 font-semibold transition-colors"
                        >
                            <Plus size={20} /> Add Task
                        </button>
                    </div>
                </form>

                {/* Active Tasks */}
                {incompleteTasks.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">To Do</h2>
                        <div className="space-y-3">
                            {incompleteTasks.map(task => (
                                <div
                                    key={task._id}
                                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-start gap-4">
                                        <button
                                            onClick={() => handleToggleComplete(task._id, task.completed)}
                                            className="mt-1 text-gray-400 hover:text-indigo-600 transition-colors"
                                        >
                                            <Circle size={24} />
                                        </button>
                                        
                                        <div className="flex-grow">
                                            <p className="text-gray-900 font-medium">{task.title}</p>
                                            
                                            {editingTask === task._id ? (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <Calendar size={16} className="text-gray-400" />
                                                    <input
                                                        type="date"
                                                        defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                                                        onChange={(e) => handleUpdateDueDate(task._id, e.target.value)}
                                                        onBlur={() => setEditingTask(null)}
                                                        className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        autoFocus
                                                    />
                                                </div>
                                            ) : task.dueDate ? (
                                                <div 
                                                    onClick={() => setEditingTask(task._id)}
                                                    className={`mt-2 flex items-center gap-2 text-sm cursor-pointer ${
                                                        isOverdue(task.dueDate) 
                                                            ? 'text-red-600' 
                                                            : isDueToday(task.dueDate)
                                                            ? 'text-orange-600'
                                                            : 'text-gray-500'
                                                    }`}
                                                >
                                                    {isOverdue(task.dueDate) && <AlertCircle size={16} />}
                                                    <Calendar size={16} />
                                                    <span className="font-medium">{formatDueDate(task.dueDate)}</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setEditingTask(task._id)}
                                                    className="mt-2 flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600"
                                                >
                                                    <Calendar size={16} />
                                                    <span>Add due date</span>
                                                </button>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleDeleteTask(task._id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Completed Tasks */}
                {completedTasks.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Completed ({completedTasks.length})
                        </h2>
                        <div className="space-y-3">
                            {completedTasks.map(task => (
                                <div
                                    key={task._id}
                                    className="bg-white rounded-lg shadow-md p-4 opacity-60 hover:opacity-100 transition-opacity"
                                >
                                    <div className="flex items-start gap-4">
                                        <button
                                            onClick={() => handleToggleComplete(task._id, task.completed)}
                                            className="mt-1 text-green-600 hover:text-green-700"
                                        >
                                            <CheckCircle2 size={24} />
                                        </button>
                                        
                                        <div className="flex-grow">
                                            <p className="text-gray-500 line-through">{task.title}</p>
                                            {task.dueDate && (
                                                <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                                                    <Calendar size={16} />
                                                    <span>{formatDueDate(task.dueDate)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleDeleteTask(task._id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tasks.length === 0 && (
                    <div className="text-center py-12">
                        <Circle size={64} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks yet</h3>
                        <p className="text-gray-500">Add your first task to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
};