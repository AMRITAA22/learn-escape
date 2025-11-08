import React, { useEffect, useState, useCallback } from "react";
import tasksService from '../services/tasksService';
import { Calendar, Brain, Loader2, RefreshCw } from "lucide-react";

interface Task {
  _id: string;
  title: string;
  subject?: string;
  dueDate?: string;
  priority?: string;
  estimatedMinutes?: number;
  completed?: boolean;
}

// ---
// ✅ MODIFIED: We now store duration and minute for precise display
// ---
interface StudySlot {
  dateISO: string;
  dayLabel: string;
  time: string; // This will be the formatted time, e.g., "10:11 AM"
  taskTitle: string;
  color: string;
  hour: number; // 24-hour number for sorting
  minute: number; // Minute for sorting
  duration: number; // e.g., 71
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

// Helper to format minutes-from-midnight into a display time
const formatSlotTime = (totalMinutes: number) => {
    const hour24 = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const displayHour = hour24 > 12 ? hour24 - 12 : (hour24 === 0 ? 12 : hour24);
    const displayMinute = String(minute).padStart(2, '0');

    return `${displayHour}:${displayMinute} ${period}`;
};

export const PlannerPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [plan, setPlan] = useState<StudySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Core: Generate plan based on task deadlines ---
  const autoGeneratePlan = useCallback((taskList: Task[]) => {
    console.log("=== PLANNER DEBUG START ===");
    console.log("Total tasks received:", taskList.length);

    if (!taskList || taskList.length === 0) {
      console.log("No tasks to plan");
      setPlan([]);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const incompleteTasks = taskList.filter(task => !task.completed);
    console.log("Incomplete tasks:", incompleteTasks.length);
    
    if (incompleteTasks.length === 0) {
      console.log("All tasks completed! Nothing to plan.");
      setPlan([]);
      return;
    }

    const sorted = [...incompleteTasks].sort((a, b) => {
      const da = parseDeadline(a.dueDate);
      const db = parseDeadline(b.dueDate);
      
      if (da && db) {
        if (da.getTime() !== db.getTime()) {
          return da.getTime() - db.getTime();
        }
      } else if (da) {
        return -1;
      } else if (db) {
        return 1;
      }
      
      const ma = a.estimatedMinutes || 60;
      const mb = b.estimatedMinutes || 60;
      return mb - ma; // Higher minutes first
    });
    
    console.log("Sorted Tasks:", sorted.map(t => `${t.title} (${t.estimatedMinutes}min)`));

    const slots: StudySlot[] = [];
    
    // ---
    // ✅ MODIFIED: This tracker now stores the next available MINUTE from midnight
    // We start at 540 (which is 9:00 AM)
    // ---
    const daySlotTracker = new Map<string, number>();
    const START_MINUTE = 540; // 9:00 AM
    const END_MINUTE = 1020; // 5:00 PM (17 * 60)

    sorted.forEach((task, i) => {
      const color = COLORS[i % COLORS.length];
      let due = parseDeadline(task.dueDate);
      
      console.log(`\nProcessing: "${task.title}"`);
      
      if (!due) {
        due = new Date(today);
        due.setDate(due.getDate() + 3);
      }
      
      if (due.getTime() < today.getTime() && due.toDateString() !== today.toDateString()) {
        console.log(`  ❌ Task is overdue, skipping`);
        return;
      }

      // ---
      // ✅ MODIFIED: We no longer use `hoursNeeded`. We use the *actual* minutes.
      // ---
      const duration = task.estimatedMinutes ?? 60;
      console.log(`  - Duration: ${duration} minutes`);

      const maxWindow = 7;
      const start = new Date(today);
      const end = new Date(Math.min(due.getTime(), start.getTime() + (maxWindow - 1) * 86400000));
      
      const availableDays = dateRange(start, end);
      if (availableDays.length === 0) {
        availableDays.push(new Date(today));
      }
      
      // ---
      // ✅ MODIFIED: Simplified loop. We just find ONE slot for the task.
      // (We can add task-splitting later if needed, but this is cleaner)
      // ---
      
      // Find the first available day, starting from the due date
      let dayFound = false;
      for (let j = availableDays.length - 1; j >= 0; j--) {
        const day = availableDays[j];
        const { dateISO, dayLabel } = formatDate(day);

        // Get the next available start time for this day
        const startTime = daySlotTracker.get(dateISO) || START_MINUTE;
        const endTime = startTime + duration;

        // Check if it fits within the day (before 5 PM)
        if (endTime <= END_MINUTE) {
          // Yes! Schedule it.
          const time = formatSlotTime(startTime);
          
          slots.push({
            dateISO,
            dayLabel,
            time,
            taskTitle: task.title,
            color,
            hour: Math.floor(startTime / 60),
            minute: startTime % 60,
            duration: duration,
          });

          // Update the tracker for the next task on this day
          daySlotTracker.set(dateISO, endTime);
          dayFound = true;
          console.log(`  ✅ Scheduled on ${dateISO} at ${time} for ${duration} min.`);
          break; // Exit loop, task is scheduled
        }
      }

      if (!dayFound) {
        console.log(`  ⚠️ Could not find a slot for "${task.title}"`);
        // Optional: If it couldn't be scheduled, add it to the first day anyway
        // This is a fallback, but you can customize it.
        const day = availableDays[0];
        const { dateISO, dayLabel } = formatDate(day);
        const startTime = daySlotTracker.get(dateISO) || START_MINUTE;
        const time = formatSlotTime(startTime);

        slots.push({
            dateISO,
            dayLabel,
            time,
            taskTitle: task.title,
            color,
            hour: Math.floor(startTime / 60),
            minute: startTime % 60,
            duration: duration,
        });
        daySlotTracker.set(dateISO, startTime + duration);
        console.log(`  ✅ Fallback: Scheduled on ${dateISO} at ${time} for ${duration} min.`);
      }
    });

    // Sort by date, then 24-hour, then minute
    slots.sort((a, b) => {
      if (a.dateISO !== b.dateISO) return a.dateISO < b.dateISO ? -1 : 1;
      if (a.hour !== b.hour) return a.hour - b.hour;
      return a.minute - b.minute;
    });

    console.log(`\n✅ Generated ${slots.length} total slots`);
    console.log("=== PLANNER DEBUG END ===\n");
    setPlan(slots);
  }, []);

  // --- Fetch tasks (no changes) ---
  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("📥 Fetching tasks from backend...");
      const data = await tasksService.getTasks();
      console.log("✅ Fetched tasks:", data);
      
      if (Array.isArray(data)) {
        setTasks(data);
        if (data.length > 0) {
          autoGeneratePlan(data);
        } else {
          console.log("⚠️ No tasks found");
          setPlan([]);
        }
      } else {
        console.error("❌ Invalid data format:", data);
        setPlan([]);
      }
    } catch (err) {
      console.error("❌ Failed to fetch tasks:", err);
      setPlan([]);
    } finally {
      setIsLoading(false);
    }
  }, [autoGeneratePlan]);
  
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // --- Helpers (no changes) ---
  const parseDeadline = (raw?: string): Date | null => {
    if (!raw) return null;
    try {
      const datePart = raw.split('T')[0];
      const parts = datePart.split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        d.setHours(0, 0, 0, 0); 
        if (!isNaN(d.getTime())) {
          return d;
        }
      }
    } catch (e) {
      console.error("Date parsing error:", e);
    }
    console.warn("Failed to parse date string:", raw);
    return null;
  };

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateISO = `${year}-${month}-${day}`; 
    const dayLabel = d.toLocaleString("en-US", {
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
      return [new Date(start)];
    }
    while (cur <= last) {
      arr.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return arr;
  };

  // --- UI (no changes) ---
  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mr-4" />
        <span className="text-lg">Loading your Smart Study Plan...</span>
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

  const incompleteTasks = tasks.filter(t => !t.completed);

  return (
    <div className="p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
              <Brain size={36} className="text-indigo-600" /> Smart Study Planner
            </h1>
            <p className="text-gray-600">
              {incompleteTasks.length} active task{incompleteTasks.length !== 1 ? 's' : ''} • {plan.length} study session{plan.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>
          <button
            onClick={loadTasks}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-semibold shadow-md transition-all hover:shadow-lg"
          >
            <RefreshCw size={20} /> Regenerate Plan
          </button>
        </div>

        {incompleteTasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">All Caught Up! 🎉</h3>
            <p className="text-gray-500">You have no active tasks. Add some tasks to see your study plan.</p>
          </div>
        ) : plan.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Study Sessions Scheduled</h3>
            <p className="text-gray-500">This can happen if all tasks are overdue or have no estimated time. Add new tasks to generate a plan.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <p className="text-sm text-gray-600">
                📚 <strong>Pro tip:</strong> This plan distributes your study time based on task deadlines and estimated hours. 
                Click "Regenerate Plan" after updating any task details.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {uiDays.map((day) => {
                const daySessions = plan.filter((slot) => slot.dateISO === day.dateISO);
                
                const d = new Date(day.dateISO);
                d.setDate(d.getDate() + 1); 
                const isToday = d.toDateString() === new Date().toDateString();

                return (
                  <div 
                    key={day.dateISO} 
                    className={`bg-white rounded-lg shadow-md p-4 min-h-[280px] transition-all hover:shadow-lg ${
                      isToday ? 'ring-2 ring-indigo-500' : ''
                    }`}
                  >
                    <h3 className={`font-semibold text-center mb-3 pb-2 border-b-2 ${
                      isToday ? 'text-indigo-600 border-indigo-500' : 'text-gray-700 border-gray-200'
                    }`}>
                      {day.dayLabel}
                      {isToday && <span className="ml-2 text-xs bg-indigo-100 px-2 py-1 rounded">Today</span>}
                    </h3>
                    
                    <div className="space-y-2">
                      {daySessions.length > 0 ? (
                        daySessions.map((slot, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-lg text-white text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
                            style={{ backgroundColor: slot.color }}
                          >
                            <div className="font-bold truncate">{slot.taskTitle}</div>
                            {/* ---
                            ✅ MODIFIED: Display the accurate time and duration
                            --- */}
                            <div className="opacity-90 text-xs mt-1">
                                {slot.time} ({slot.duration} min)
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-32">
                          <p className="text-xs text-gray-400 text-center">No sessions<br/>scheduled</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};