"use client";

import React from "react";
import { format, subDays, isSameDay, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

interface JournalHeatmapProps {
  entries: { date: Date | string; mood?: string | null }[];
  dict: any;
}

const JournalHeatmap = ({ entries, dict }: JournalHeatmapProps) => {
  // We'll show the last 18 weeks (~126 days)
  const today = startOfDay(new Date());
  const daysToShow = 126;
  const days = Array.from({ length: daysToShow }).map((_, i) => subDays(today, daysToShow - 1 - i));

  const getEntryForDay = (day: Date) => {
    return entries.find(e => isSameDay(new Date(e.date), day));
  };

  const getMoodColor = (mood: string | null | undefined) => {
    if (!mood) return "bg-slate-100 hover:bg-slate-200";
    
    // Logic for mood colors in heatmap
    switch (mood) {
      case dict.journal.moods.excellent: return "bg-rose-400";
      case dict.journal.moods.great: return "bg-amber-400";
      case dict.journal.moods.good: return "bg-emerald-400";
      case dict.journal.moods.neutral: return "bg-slate-400";
      case dict.journal.moods.low: return "bg-blue-400";
      default: return "bg-zinc-800"; // Entry exists but mood is unknown or just content
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dict.journal.heatmap.title}</h3>
      </div>
      
      <div className="flex flex-wrap gap-1.5">
        {days.map((day, i) => {
          const entry = getEntryForDay(day);
          return (
            <div 
              key={i}
              title={format(day, "MMM d, yyyy") + (entry ? `: ${entry.mood || 'Recorded'}` : ': No entry')}
              className={cn(
                "w-3 h-3 md:w-3.5 md:h-3.5 rounded-[3px] transition-all cursor-crosshair",
                entry ? getMoodColor(entry.mood) : "bg-slate-50 border border-slate-100/50"
              )}
            />
          );
        })}
      </div>
      
      <div className="flex items-center gap-2 text-[9px] text-slate-400 font-medium">
        <span>{dict.journal.heatmap.less}</span>
        <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-50 border border-slate-100/50" />
        <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-200" />
        <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400" />
        <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600" />
        <span>{dict.journal.heatmap.more}</span>
      </div>
    </div>
  );
};

export default JournalHeatmap;
