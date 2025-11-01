import React, { useState, useEffect } from "react";
import tasksService from "../services/tasksService";

interface Task {
  _id?: string;
  title: string;
  dueDate?: string | null;
  completed?: boolean;
}

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await tasksService.getTasks();
        setTasks(data);
      } catch (err) {
        console.error("Failed to load tasks:", err);
      }
    };
    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      const newTask = await tasksService.createTask({
        title: newTaskTitle,
        dueDate: newTaskDueDate || null,
      });
      setTasks([newTask, ...tasks]);
      setNewTaskTitle("");
      setNewTaskDueDate("");
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  const handleDelete = async (id: string) => {
    await tasksService.deleteTask(id);
    setTasks(tasks.filter((t) => t._id !== id));
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Tasks</h1>

      <div className="mb-6 flex gap-3">
        <input
          type="text"
          placeholder="Task title"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="border rounded p-2 flex-1"
        />
        <input
          type="date"
          value={newTaskDueDate}
          onChange={(e) => setNewTaskDueDate(e.target.value)}
          className="border rounded p-2"
        />
        <button
          onClick={handleAddTask}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Add Task
        </button>
      </div>

      <ul>
        {tasks.map((task) => (
          <li
            key={task._id}
            className="bg-white p-3 rounded shadow flex justify-between items-center mb-2"
          >
            <div>
              <p className="font-medium">{task.title}</p>
              {task.dueDate && (
                <p className="text-sm text-gray-500">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <button
              onClick={() => handleDelete(task._id!)}
              className="text-red-500 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TasksPage;
