"use client";

import React from "react";
import { Clock, BookOpen, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TodayFocusProps {
  courses: any[];
  tasks: any[];
  dict: any;
}

const TodayFocus = ({ courses, tasks, dict }: TodayFocusProps) => {
  const allEvents = [
    ...courses.map(c => ({
      type: 'course',
      time: c.startTime,
      title: c.courseName,
      subtitle: `${c.room || ''} • ${c.lecturer || ''}`,
      color: "bg-blue-500"
    })),
    ...tasks.map(t => ({
      type: 'task',
      time: t.dueDate ? new Date(t.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (dict.dashboard.widgets.asap || 'ASAP'),
      title: t.title,
      subtitle: (dict.tasks.priority[t.priority] || t.priority).toUpperCase(),
      color: t.priority === 'high' ? "bg-red-500" : "bg-emerald-500"
    }))
  ].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900 tracking-tight">{dict.dashboard.widgets.todayFocus}</h2>
        <span className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
        </span>
      </div>

      <div className="space-y-4 relative">
        {/* Timeline Line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100" />

        {allEvents.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
            <CheckCircle2 size={32} className="text-slate-200" />
            <p className="text-xs font-medium text-slate-400">{dict.dashboard.widgets.allClear}</p>
          </div>
        ) : (
          allEvents.map((item, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="flex gap-4 relative z-10"
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm ring-1 ring-slate-100",
                item.color
              )}>
                {item.type === 'course' ? <BookOpen size={10} className="text-white" /> : <AlertCircle size={10} className="text-white" />}
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-zinc-900 leading-tight uppercase tracking-tight">{item.title}</p>
                  <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock size={10} /> {item.time}
                  </p>
                </div>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{item.subtitle}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodayFocus;
