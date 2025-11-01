import React, { useEffect, useState } from "react";
import tasksService from "../services/tasksService";
import { Calendar, Brain } from "lucide-react";

interface Task {
  _id: string;
  title: string;
  subject?: string;
  dueDate?: string;
  priority?: string;
  estimatedMinutes?: number;
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

  // --- Fetch tasks from backend (MongoDB) ---
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await tasksService.getTasks();
        console.log("✅ Fetched tasks from MongoDB:", data);
        if (Array.isArray(data) && data.length > 0) {
          setTasks(data);
          autoGeneratePlan(data);
        } else {
          console.warn("⚠️ No tasks found, skipping plan generation");
        }
      } catch (err) {
        console.error("❌ Failed to fetch tasks:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadTasks();
  }, []);

  // --- Helpers ---
  const parseDeadline = (raw?: string): Date | null => {
    if (!raw) return null;
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
    while (cur <= last) {
      arr.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return arr;
  };

  // --- Core: Generate plan based on task deadlines ---
  const autoGeneratePlan = (taskList: Task[]) => {
    if (!taskList || taskList.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sort by earliest deadline
    const sorted = [...taskList].sort((a, b) => {
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
      const due = parseDeadline(task.dueDate) || today;
      const minutes = task.estimatedMinutes ?? 60;
      const hoursNeeded = Math.ceil(minutes / 60);

      // Distribute evenly between today and due date (max 7 days)
      const maxWindow = 7;
      const start = new Date(today);
      const end = new Date(Math.min(due.getTime(), start.getTime() + (maxWindow - 1) * 86400000));
      const availableDays = dateRange(start, end);
      if (availableDays.length === 0) availableDays.push(today);

      for (let j = 0; j < hoursNeeded; j++) {
        const day = availableDays[j % availableDays.length];
        const { dateISO, dayLabel } = formatDate(day);
        const time = `${9 + (j % 6)}:00`;
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

    console.log("✅ Generated plan (with deadlines):", slots);
    setPlan(slots);
  };

  // --- UI ---
  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
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
          onClick={() => autoGeneratePlan(tasks)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Calendar size={18} /> Regenerate Plan
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        Automatically generates a personalized study plan based on your real task deadlines and estimated times.
      </p>

      <div className="grid grid-cols-7 gap-4">
        {uiDays.map((day) => (
          <div key={day.dateISO} className="bg-white rounded-lg shadow-md p-3 min-h-[220px]">
            <h3 className="font-semibold text-center text-indigo-600 mb-3">{day.dayLabel}</h3>
            <div className="space-y-2">
              {plan
                .filter((slot) => slot.dateISO === day.dateISO)
                .map((slot, i) => (
                  <div
                    key={i}
                    className="p-2 rounded text-white text-sm font-medium flex items-center justify-between"
                    style={{ backgroundColor: slot.color }}
                  >
                    <span>{slot.time}</span>
                    <span>{slot.taskTitle}</span>
                  </div>
                ))}
              {plan.filter((s) => s.dateISO === day.dateISO).length === 0 && (
                <p className="text-xs text-gray-400 text-center">No sessions</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
