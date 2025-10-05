import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Task {
  _id: string;
  text: string;
  completed: boolean;
}

export const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');

  const fetchTasks = async () => {
    const res = await axios.get('/api/tasks', { withCredentials: true });
    setTasks(res.data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const res = await axios.post(
      '/api/tasks',
      { text: input },
      { withCredentials: true }
    );
    setTasks([...tasks, res.data]);
    setInput('');
  };

  const toggleTask = async (id: string) => {
    const res = await axios.patch(`/api/tasks/${id}`, {}, { withCredentials: true });
    setTasks(tasks.map(t => (t._id === id ? res.data : t)));
  };

  const deleteTask = async (id: string) => {
    await axios.delete(`/api/tasks/${id}`, { withCredentials: true });
    setTasks(tasks.filter(t => t._id !== id));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-4">Your To-Do List</h1>
      <form onSubmit={addTask} className="flex mb-4">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
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
            key={task._id}
            className={`flex justify-between items-center p-2 border-b ${
              task.completed ? 'line-through text-gray-400' : ''
            }`}
          >
            <span
              onClick={() => toggleTask(task._id)}
              className="cursor-pointer"
            >
              {task.text}
            </span>
            <button
              onClick={() => deleteTask(task._id)}
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
