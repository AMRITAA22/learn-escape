import React, { useState, useEffect } from "react";
import { Smile, Frown, Meh, Zap } from "lucide-react";

const moods = [
  { id: "focused", label: "Focused", icon: <Zap />, color: "bg-green-500" },
  { id: "tired", label: "Tired", icon: <Frown />, color: "bg-gray-400" },
  { id: "stressed", label: "Stressed", icon: <Meh />, color: "bg-red-400" },
  { id: "relaxed", label: "Relaxed", icon: <Smile />, color: "bg-blue-400" },
];

export const MoodSelector = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(
    localStorage.getItem("userMood")
  );
  const [suggestion, setSuggestion] = useState("");

  useEffect(() => {
    if (selectedMood) {
      localStorage.setItem("userMood", selectedMood);
      updateSuggestion(selectedMood);
    }
  }, [selectedMood]);

  const updateSuggestion = (mood: string) => {
    switch (mood) {
      case "focused":
        setSuggestion("Great! Stay on track with a Pomodoro session.");
        break;
      case "tired":
        setSuggestion("You seem tired. Try a short 5-minute break or a calm study room.");
        break;
      case "stressed":
        setSuggestion("Deep breath! Review light topics or your achievement page.");
        break;
      case "relaxed":
        setSuggestion("Perfect mood for creativity — maybe take some new notes?");
        break;
      default:
        setSuggestion("");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        How are you feeling today?
      </h2>
      <div className="flex justify-center gap-4 mb-4">
        {moods.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMood(m.id)}
            className={`flex flex-col items-center p-3 rounded-xl transition-all ${
              selectedMood === m.id
                ? `${m.color} text-white scale-105`
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            <div className="w-8 h-8">{m.icon}</div>
            <span className="mt-1 text-sm">{m.label}</span>
          </button>
        ))}
      </div>
      {suggestion && (
        <div className="text-center text-gray-700 font-medium bg-indigo-50 p-3 rounded-lg">
          {suggestion}
        </div>
      )}
    </div>
  );
};
