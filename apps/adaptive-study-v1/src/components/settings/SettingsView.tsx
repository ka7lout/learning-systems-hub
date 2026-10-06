"use client";

import { useState } from "react";
import { Settings, Clock, Volume2, Palette, Save } from "lucide-react";

interface Settings {
  id?: string;
  focusDurationMinutes?: number | null;
  breakDurationMinutes?: number | null;
  audioPreference?: string | null;
  theme?: string | null;
  availableStudyHoursPerDay?: number | null;
}

export function SettingsView({ initialSettings }: { initialSettings: Settings | null }) {
  const [focusDuration, setFocusDuration] = useState(initialSettings?.focusDurationMinutes || 20);
  const [breakDuration, setBreakDuration] = useState(initialSettings?.breakDurationMinutes || 5);
  const [audioPreference, setAudioPreference] = useState(initialSettings?.audioPreference || "silence");
  const [theme, setTheme] = useState(initialSettings?.theme || "dark");
  const [studyHours, setStudyHours] = useState(initialSettings?.availableStudyHoursPerDay || 4);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    // In production, this would save to the database
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Settings
        </h1>
        <p className="text-gray-400 mt-1">Customize your study experience</p>
      </div>

      <div className="space-y-6">
        {/* Focus Timer */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Focus Timer
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Focus Duration: {focusDuration} minutes
              </label>
              <input
                type="range"
                min="5"
                max="60"
                value={focusDuration}
                onChange={(e) => setFocusDuration(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5 min</span>
                <span>60 min</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Break Duration: {breakDuration} minutes
              </label>
              <input
                type="range"
                min="1"
                max="30"
                value={breakDuration}
                onChange={(e) => setBreakDuration(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 min</span>
                <span>30 min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Audio */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-gray-400" />
            Audio
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            {["silence", "white_noise", "pink_noise", "brown_noise"].map((option) => (
              <button
                key={option}
                onClick={() => setAudioPreference(option)}
                className={`p-3 rounded-lg text-left transition-colors ${
                  audioPreference === option
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <p className="font-medium capitalize">
                  {option.replace("_", " ")}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-gray-400" />
            Appearance
          </h2>
          
          <div className="flex gap-3">
            {["dark", "light", "system"].map((option) => (
              <button
                key={option}
                onClick={() => setTheme(option)}
                className={`flex-1 p-3 rounded-lg text-center transition-colors ${
                  theme === option
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <p className="font-medium capitalize">{option}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Study Time */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="font-semibold text-white mb-4">Available Study Time</h2>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Hours per day: {studyHours}
            </label>
            <input
              type="range"
              min="1"
              max="12"
              value={studyHours}
              onChange={(e) => setStudyHours(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 hour</span>
              <span>12 hours</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
            saved
              ? "bg-green-600 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          <Save className="w-5 h-5" />
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
