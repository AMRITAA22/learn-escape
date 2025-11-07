import React, { useEffect, useState, useCallback } from "react";
import tasksService from '../services/tasksService';
import { Calendar, Brain, Loader2 } from "lucide-react";

interface Task {
  _id: string;
  title: string;
  subject?: string;
  dueDate?: string;
  priority?: string;
  estimatedMinutes?: number;
  completed?: boolean; // <-- Added this
}

interface StudySlot {
  dateISO: string;  // YYYY-MM-DD key
  dayLabel: string; // "Mon, Nov 3"
  time: string;     // "9:00"
  taskTitle: string;
  color: string;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export const PlannerPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [plan, setPlan] = useState<StudySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Core: Generate plan based on task deadlines ---
  const autoGeneratePlan = useCallback((taskList: Task[]) => {
    if (!taskList || taskList.length === 0) {
      setPlan([]); // Clear plan if no tasks
      return;
    }
    console.log("Generating plan with tasks:", taskList);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // FIX 2: Filter for incomplete tasks first
    const incompleteTasks = taskList.filter(task => !task.completed);
    console.log("Incomplete tasks:", incompleteTasks);

    // Sort by earliest deadline
    const sorted = [...incompleteTasks].sort((a, b) => {
      const da = parseDeadline(a.dueDate);
      const db = parseDeadline(b.dueDate);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da.getTime() - db.getTime();
    });

    const slots: StudySlot[] = [];

    sorted.forEach((task, i) => {
      const color = COLORS[i % COLORS.length];
      const due = parseDeadline(task.dueDate);
      
      // Skip tasks with no due date for now (or assign to today)
      if (!due) {
        console.warn(`Task "${task.title}" has no due date, skipping.`);
        return; 
      }
      
      // Make sure due date is not in the past
      if (due.getTime() < today.getTime()) {
         console.warn(`Task "${task.title}" is overdue, skipping.`);
         return; // Skip overdue tasks
      }

      const minutes = task.estimatedMinutes ?? 60; // Default to 60 min
      const hoursNeeded = Math.ceil(minutes / 60);

      // Distribute evenly between today and due date (max 7 days)
      const maxWindow = 7;
      const start = new Date(today);
      const end = new Date(Math.min(due.getTime(), start.getTime() + (maxWindow - 1) * 86400000));
      
      const availableDays = dateRange(start, end);
      if (availableDays.length === 0) {
        availableDays.push(today);
      }
      
      console.log(`Task: ${task.title}, Hours: ${hoursNeeded}, Days: ${availableDays.map(d => d.getDate())}`);

      for (let j = 0; j < hoursNeeded; j++) {
        // Distribute hours across available days
        const day = availableDays[j % availableDays.length];
        const { dateISO, dayLabel } = formatDate(day);
        
        // Simple time logic: 9am, 10am, 11am, etc.
        const time = `${9 + (j % 6)}:00 AM`; 
        
        slots.push({
          dateISO,
          dayLabel,
          time,
          taskTitle: task.title,
          color,
        });
      }
    });

    slots.sort((a, b) => {
      if (a.dateISO !== b.dateISO) return a.dateISO < b.dateISO ? -1 : 1;
      const ha = parseInt(a.time);
      const hb = parseInt(b.time);
      return ha - hb;
    });

    console.log("✅ Generated plan:", slots);
    setPlan(slots);
  }, []);


  // --- Fetch tasks from backend (MongoDB) ---
  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await tasksService.getTasks();
      console.log("✅ Fetched tasks from MongoDB:", data);
      if (Array.isArray(data)) {
        setTasks(data);
        if (data.length > 0) {
            autoGeneratePlan(data);
        } else {
            console.warn("⚠️ No tasks found, skipping plan generation");
            setPlan([]); // Ensure plan is empty
        }
      }
    } catch (err) {
      console.error("❌ Failed to fetch tasks:", err);
    } finally {
      setIsLoading(false);
    }
  }, [autoGeneratePlan]);
  
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // --- Helpers ---
  const parseDeadline = (raw?: string): Date | null => {
    if (!raw) return null;

    // FIX 3: Timezone Bug Fix
    // DB stores "2025-11-10T00:00:00.000Z" (UTC midnight)
    // We must parse the date part as LOCAL time.
    const datePart = raw.split('T')[0];
    const parts = datePart.split('-').map(Number);
    if (parts.length === 3) {
        // new Date(year, monthIndex, day) creates a local date.
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        d.setHours(0, 0, 0, 0); // Ensure it's local midnight
        return isNaN(d.getTime()) ? null : d;
    }
    
    // Fallback for other formats (less reliable)
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  };


  const formatDate = (d: Date) => {
    const dateISO = d.toISOString().split("T")[0];
    const dayLabel = d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    return { dateISO, dayLabel };
  };

  const dateRange = (start: Date, end: Date): Date[] => {
    const arr: Date[] = [];
    const cur = new Date(start);
    cur.setHours(0, 0, 0, 0);
    const last = new Date(end);
    last.setHours(0, 0, 0, 0);

    if (cur > last) {
        console.warn("Date range start is after end");
        return [];
    }
    
    while (cur <= last) {
      arr.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return arr;
  };

  // --- UI ---
  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mr-4" />
        Loading your Smart Study Plan...
      </div>
    );
  }

  const today = new Date();
  const uiDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const { dateISO, dayLabel } = formatDate(d);
    return { dateISO, dayLabel };
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Brain size={28} /> Smart Study Planner
        </h1>
        <button
          onClick={loadTasks}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Calendar size={18} /> Regenerate Plan
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        Automatically generates a personalized study plan based on your real task deadlines and estimated times.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {uiDays.map((day) => (
          <div key={day.dateISO} className="bg-white rounded-lg shadow-md p-3 min-h-[220px]">
            <h3 className="font-semibold text-center text-indigo-600 mb-3">{day.dayLabel}</h3>
            <div className="space-y-2">
              {plan
                .filter((slot) => slot.dateISO === day.dateISO)
                .map((slot, i) => (
                  <div
                    key={i}
                    className="p-2 rounded text-white text-xs font-medium"
                    style={{ backgroundColor: slot.color }}
                  >
                    <div className="font-bold">{slot.taskTitle}</div>
                    <div className="opacity-80">{slot.time}</div>
                  </div>
                ))}
              {plan.filter((s) => s.dateISO === day.dateISO).length === 0 && (
                <p className="text-xs text-gray-400 text-center pt-4">No sessions</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};