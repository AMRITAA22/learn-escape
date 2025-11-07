import React, { useEffect, useState, useCallback } from "react";
import tasksService from "../services/tasksService";
import { Calendar, Brain, Loader2 } from "lucide-react";

interface Task {
  _id: string;
  title: string;
  subject?: string;
  dueDate?: string;
  priority?: string;
  estimatedMinutes?: number;
  completed?: boolean;
}

interface StudySlot {
  dateISO: string;
  dayLabel: string;
  time: string;
  taskTitle: string;
  color: string;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export const PlannerPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [plan, setPlan] = useState<StudySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Core logic ---
  const autoGeneratePlan = useCallback((taskList: Task[]) => {
    if (!taskList?.length) {
      setPlan([]);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const incomplete = taskList.filter((t) => !t.completed);
    const sorted = [...incomplete].sort((a, b) => {
      const da = parseDeadline(a.dueDate);
      const db = parseDeadline(b.dueDate);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da.getTime() - db.getTime();
    });

    const slots: StudySlot[] = [];
    const usedPerDay: Record<string, Set<string>> = {};

    sorted.forEach((task, i) => {
      const color = COLORS[i % COLORS.length];
      let due = parseDeadline(task.dueDate);
      if (!due) return;

      // --- Shift weekend due date to previous Friday ---
      const dayOfDue = due.getDay();
      if (dayOfDue === 0) due.setDate(due.getDate() - 2); // Sunday → Friday
      if (dayOfDue === 6) due.setDate(due.getDate() - 1); // Saturday → Friday

      if (due.getTime() <= today.getTime()) return;

      const minutes = task.estimatedMinutes ?? 60;
      const hoursNeeded = Math.max(Math.ceil(minutes / 60), 1);

      // --- Build available weekdays only (Mon–Fri) ---
      const availableDays: Date[] = [];
      const start = new Date(today);
      start.setDate(today.getDate() + 1);

      for (let d = new Date(start); d <= due; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        // skip weekends
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          availableDays.push(new Date(d));
        }
      }

      if (availableDays.length === 0) return;

      console.log(
        `📘 Task: ${task.title}, ${availableDays.length} available weekdays before ${due.toDateString()}`
      );

      const sessionsToDistribute = Math.min(hoursNeeded, availableDays.length);
      const step =
        sessionsToDistribute > 1
          ? Math.floor((availableDays.length - 1) / (sessionsToDistribute - 1))
          : 1;

      for (let s = 0; s < sessionsToDistribute; s++) {
        const idx = Math.min(s * step, availableDays.length - 1);
        const day = availableDays[idx];
        if (!day || isNaN(day.getTime())) continue;

        const { dateISO, dayLabel } = formatDate(day);
        if (!usedPerDay[dateISO]) usedPerDay[dateISO] = new Set();
        if (usedPerDay[dateISO].has(task.title)) continue;

        usedPerDay[dateISO].add(task.title);
        const time = `${9 + ((s + i) % 6)}:00 AM`;

        slots.push({ dateISO, dayLabel, time, taskTitle: task.title, color });
      }

      // --- Add final session ON due date (if weekday) ---
      const dueDay = due.getDay();
      if (dueDay !== 0 && dueDay !== 6) {
        const { dateISO, dayLabel } = formatDate(due);
        if (!usedPerDay[dateISO]) usedPerDay[dateISO] = new Set();
        if (!usedPerDay[dateISO].has(task.title)) {
          usedPerDay[dateISO].add(task.title);
          slots.push({
            dateISO,
            dayLabel,
            time: "9:00 AM",
            taskTitle: task.title,
            color,
          });
        }
      }
    });

    slots.sort((a, b) => {
      if (a.dateISO !== b.dateISO) return a.dateISO < b.dateISO ? -1 : 1;
      return parseInt(a.time) - parseInt(b.time);
    });

    console.log("✅ Final Smart Weekday Plan:", slots);
    setPlan(slots);
  }, []);

  // --- Fetch ---
  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await tasksService.getTasks();
      if (Array.isArray(data) && data.length) {
        setTasks(data);
        autoGeneratePlan(data);
      } else setPlan([]);
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
    const d = new Date(raw);
    if (isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const formatDate = (d?: Date) => {
    if (!d || isNaN(d.getTime())) {
      return { dateISO: "Invalid", dayLabel: "Invalid Date" };
    }
    const dateISO = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
    const dayLabel = d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    return { dateISO, dayLabel };
  };

  // --- UI ---
  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px] text-gray-500">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mr-4" />
        Loading your Smart Study Plan...
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const uiDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const { dateISO, dayLabel } = formatDate(d);
    return { dateISO, dayLabel };
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900">
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
        Automatically generates a personalized study plan based on your real
        task deadlines and estimated times.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {uiDays.map((day) => (
          <div
            key={day.dateISO}
            className="bg-white rounded-lg shadow-md p-3 min-h-[220px]"
          >
            <h3 className="font-semibold text-center text-indigo-600 mb-3">
              {day.dayLabel}
            </h3>
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
                <p className="text-xs text-gray-400 text-center pt-4">
                  No sessions
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlannerPage;
