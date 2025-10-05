// client/src/pages/TasksPage.tsx
import React, { useEffect, useState } from 'react';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: input, completed: false }]);
    setInput('');
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-4">Your To-Do List</h1>
      <form onSubmit={addTask} className="flex mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new task"
          className="flex-grow px-3 py-2 border rounded-l-md"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 rounded-r-md hover:bg-indigo-700"
        >
          Add
        </button>
      </form>
      <ul>
        {tasks.map(task => (
          <li
            key={task.id}
            className={`flex justify-between items-center p-2 border-b ${
              task.completed ? 'line-through text-gray-400' : ''
            }`}
          >
            <span onClick={() => toggleTask(task.id)} className="cursor-pointer">
              {task.text}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
