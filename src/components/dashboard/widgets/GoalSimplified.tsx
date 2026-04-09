"use client";

import React from "react";
import { Target, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Goal {
  id: string;
  title: string;
  progress: number;
}

interface GoalSimplifiedProps {
  goals: Goal[];
  lang: string;
  dict: any;
}

const GoalSimplified = ({ goals, lang, dict }: GoalSimplifiedProps) => {
  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900 tracking-tight">{dict.dashboard.widgets.activeGoals}</h2>
        <Target size={18} className="text-slate-300" />
      </div>

      <div className="space-y-5">
        {goals.map((goal, idx) => (
          <div key={goal.id} className="space-y-2">
            <div className="flex items-end justify-between leading-none">
              <p className="text-[10px] font-black text-zinc-900 uppercase tracking-tight truncate max-w-[70%]">{goal.title}</p>
              <p className="text-[10px] font-bold text-slate-400">{goal.progress}%</p>
            </div>
            <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${goal.progress}%` }}
                transition={{ duration: 0.8, delay: idx * 0.2 }}
                className="h-full bg-zinc-900 rounded-full"
              />
            </div>
          </div>
        ))}
        {goals.length === 0 && (
          <p className="text-center py-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {dict.goals.empty || "No active goals."}
          </p>
        )}
      </div>

      <Link href={`/${lang}/goals`} className="flex items-center justify-center gap-2 text-[9px] font-bold text-slate-400 hover:text-zinc-900 transition-colors uppercase tracking-[0.2em] pt-2">
        {dict.dashboard.viewMilestones} <MoreHorizontal size={12} />
      </Link>
    </div>
  );
};

export default GoalSimplified;
