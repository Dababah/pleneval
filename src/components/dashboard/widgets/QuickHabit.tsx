"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Habit {
  id: string;
  title: string;
  icon: string | null;
  isCompletedToday: boolean;
}

interface QuickHabitProps {
  habits: Habit[];
  dict: any;
}

const QuickHabit = ({ habits: initialHabits, dict }: QuickHabitProps) => {
  const [habits, setHabits] = useState(initialHabits);

  const toggleHabit = async (habit: Habit) => {
    const newStatus = !habit.isCompletedToday;
    
    // Optimistic update
    setHabits(prev => prev.map(h => 
      h.id === habit.id ? { ...h, isCompletedToday: newStatus } : h
    ));

    try {
      await fetch(`/api/habits/${habit.id}/check`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: newStatus, habitItemId: null })
      });
    } catch (error) {
      console.error("Failed to toggle habit:", error);
      // Rollback
      setHabits(prev => prev.map(h => 
        h.id === habit.id ? { ...h, isCompletedToday: !newStatus } : h
      ));
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900 tracking-tight">{dict.dashboard.widgets.habitTracker}</h2>
        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
            {habits.filter(h => h.isCompletedToday).length}/{habits.length} {dict.dashboard.widgets.done}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {habits.map((habit, idx) => (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            key={habit.id}
            onClick={() => toggleHabit(habit)}
            className={cn(
              "aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 relative overflow-hidden",
              habit.isCompletedToday 
                ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20" 
                : "bg-slate-50 text-slate-400 hover:bg-slate-100"
            )}
          >
            <span className="text-xl">{habit.icon || "⚡"}</span>
            <span className="text-[8px] font-black uppercase tracking-tighter truncate w-full px-1">
              {habit.title}
            </span>
            {habit.isCompletedToday && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center"
              >
                <Check size={8} strokeWidth={4} className="text-white" />
              </motion.div>
            )}
          </motion.button>
        ))}
        {habits.length === 0 && (
          <p className="col-span-4 text-center py-5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {dict.dashboard.widgets.noHabits}
          </p>
        )}
      </div>
    </div>
  );
};

export default QuickHabit;
