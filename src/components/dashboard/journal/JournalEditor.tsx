"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Smile,
  Frown,
  Meh,
  Heart,
  Zap,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface JournalEditorProps {
  selectedDate: Date;
  initialData: { content: string; mood: string | null };
  onSave: (data: { content: string; mood: string | null }) => Promise<void>;
  dict: any;
}

const JournalEditor = ({ selectedDate, initialData, onSave, dict }: JournalEditorProps) => {
  const [content, setContent] = useState(initialData.content);
  const [mood, setMood] = useState<string | null>(initialData.mood);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);

  // Update internal state when initialData changes (e.g. date switch)
  useEffect(() => {
    setContent(initialData.content);
    setMood(initialData.mood);
    setLastSaved(null);
  }, [initialData, selectedDate]);

  const moods = [
    { name: dict.journal.moods.excellent, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50', hover: 'hover:bg-rose-100' },
    { name: dict.journal.moods.great, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50', hover: 'hover:bg-amber-100' },
    { name: dict.journal.moods.good, icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-50', hover: 'hover:bg-emerald-100' },
    { name: dict.journal.moods.neutral, icon: Meh, color: 'text-slate-500', bg: 'bg-slate-50', hover: 'hover:bg-slate-100' },
    { name: dict.journal.moods.low, icon: Frown, color: 'text-blue-500', bg: 'bg-blue-50', hover: 'hover:bg-blue-100' },
  ];

  // Auto-save logic
  useEffect(() => {
    if (content === initialData.content && mood === initialData.mood) return;

    const timeout = setTimeout(async () => {
      setIsSaving(true);
      await onSave({ content, mood });
      setIsSaving(false);
      setLastSaved(new Date());
    }, 2000); // Save after 2s of inactivity

    return () => clearTimeout(timeout);
  }, [content, mood, onSave, initialData]);

  const getRandomPrompt = () => {
    const prompts = dict.journal.prompts;
    const random = prompts[Math.floor(Math.random() * prompts.length)];
    setPrompt(random);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden relative">

      {/* Top Bar / Status */}
      <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h2 className="text-sm font-black text-zinc-900 leading-none">
            {format(selectedDate, "EEEE, d MMMM yyyy")}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <AnimatePresence mode="wait">
              {isSaving ? (
                <motion.div
                  key="saving"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider"
                >
                  <Loader2 size={10} className="animate-spin" />
                  {dict.journal.saving}
                </motion.div>
              ) : lastSaved ? (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold uppercase tracking-wider"
                >
                  <CheckCircle2 size={10} />
                  {dict.journal.saved}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        <button
          onClick={getRandomPrompt}
          className="p-2.5 rounded-2xl bg-slate-50 hover:bg-zinc-900 group transition-all duration-300 border border-slate-100"
          title={dict.journal.promptBtn}
        >
          <Sparkles size={16} className="text-zinc-400 group-hover:text-amber-400 transition-colors" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

        {/* Mood Section */}
        <section className="space-y-4">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">{dict.journal.question}</p>
          <div className="grid grid-cols-5 gap-3">
            {moods.map((m) => (
              <button
                key={m.name}
                onClick={() => setMood(m.name)}
                className={cn(
                  "flex flex-col items-center justify-center py-4 rounded-[24px] border-2 transition-all duration-500 group relative overflow-hidden",
                  mood === m.name
                    ? `${m.bg} border-slate-200 ${m.color} scale-[1.02] shadow-lg shadow-slate-100`
                    : `bg-slate-50/50 border-transparent text-slate-300 ${m.hover}`
                )}
              >
                <m.icon
                  size={24}
                  strokeWidth={mood === m.name ? 2.5 : 2}
                  className={cn(
                    "transition-transform duration-500",
                    mood === m.name ? "scale-110" : "group-hover:scale-110"
                  )}
                />
                <span className={cn(
                  "text-[10px] font-black mt-2 uppercase tracking-wider transition-opacity duration-500",
                  mood === m.name ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                  {m.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Content Section */}
        <section className="space-y-4 relative">
          <AnimatePresence>
            {prompt && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 text-[13px] font-bold text-amber-700 italic flex items-start gap-3 relative group"
              >
                <Sparkles size={16} className="mt-0.5 shrink-0 opacity-50" />
                <p className="flex-1 leading-relaxed">{prompt}</p>
                <button onClick={() => setPrompt(null)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-amber-100 rounded-lg transition-all absolute top-2 right-2">
                  <CheckCircle2 size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={dict.journal.placeholder}
            className="w-full min-h-[400px] text-sm md:text-base font-medium text-zinc-800 placeholder:text-slate-200 bg-transparent border-none outline-none focus:outline-none focus:ring-0 resize-none leading-relaxed p-0"
          />
        </section>
      </div>

      {/* Subtle Bottom Border for feeling */}
      <div className="h-1.5 w-full flex">
        {moods.map(m => (
          <div key={m.name} className={cn("flex-1", mood === m.name ? m.bg.replace('bg-', 'bg-').split(' ')[0] : 'bg-transparent')} />
        ))}
      </div>
    </div>
  );
};

export default JournalEditor;
