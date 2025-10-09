import React, { useState, useEffect } from 'react';
import tasksService from '../services/tasksService';
import { Trash2, Plus } from 'lucide-react';

export const TasksPage = () => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        tasksService.getTasks()
            .then(setTasks)
            .finally(() => setIsLoading(false));
    }, []);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        try {
            const newTask = await tasksService.createTask({ title: newTaskTitle });
            setTasks(prevTasks => [newTask, ...prevTasks]);
            setNewTaskTitle('');
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

    if (isLoading) {
        return <div>Loading tasks...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">My To-Do List</h1>

            <form onSubmit={handleCreateTask} className="flex mb-8">
                <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-r-md hover:bg-indigo-700 flex items-center">
                    <Plus size={20} className="mr-2"/> Add
                </button>
            </form>

            <div className="space-y-4">
                {tasks.map(task => (
                    <div key={task._id} className={`flex items-center p-4 rounded-lg transition-colors ${task.completed ? 'bg-gray-100 text-gray-400' : 'bg-white shadow'}`}>
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleComplete(task._id, task.completed)}
                            className="h-6 w-6 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className={`flex-grow mx-4 ${task.completed ? 'line-through' : ''}`}>{task.title}</span>
                        <button onClick={() => handleDeleteTask(task._id)} className="text-gray-400 hover:text-red-500">
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};