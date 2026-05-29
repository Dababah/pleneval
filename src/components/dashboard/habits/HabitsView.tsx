"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Zap,
  CheckCircle2,
  Plus,
  Flame,
  MoreVertical,
  Pencil,
  Trash2,
  Moon,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import HabitModal from "./HabitModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import StreakCelebration from "../layout/StreakCelebration";

interface HabitItem {
  id: string;
  title: string;
  position: number;
}

interface HabitLog {
  id: string;
  habitItemId: string | null;
  date: string;
  isCompleted: boolean;
}

interface Habit {
  id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  frequency: string;
  scheduleDays?: string | null;
  items: HabitItem[];
  logs: HabitLog[];
  createdAt: string | Date;
  currentStreak?: number;
}

interface HabitsViewProps {
  initialHabits: Habit[];
  lang: string;
  dict: Record<string, any>;
}

const DAY_MAP: Record<number, string> = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

const HabitsView = ({ initialHabits, lang, dict }: HabitsViewProps) => {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [celebrationData, setCelebrationData] = useState<{ milestone: number; title: string } | null>(null);

  const weekDaysShort = [
    dict.habits?.days?.mon || "Mon",
    dict.habits?.days?.tue || "Tue",
    dict.habits?.days?.wed || "Wed",
    dict.habits?.days?.thu || "Thu",
    dict.habits?.days?.fri || "Fri",
    dict.habits?.days?.sat || "Sat",
    dict.habits?.days?.sun || "Sun",
  ];

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setMenuOpen(null);
    if (menuOpen) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  // Check if today is a scheduled day for a habit
  const isTodayScheduled = useCallback((habit: Habit): boolean => {
    if (habit.frequency === "daily") return true;
    if (!habit.scheduleDays) return true;
    try {
      const days: string[] = JSON.parse(habit.scheduleDays);
      const todayKey = DAY_MAP[new Date().getDay()];
      return days.includes(todayKey);
    } catch {
      return true;
    }
  }, []);

  // Get schedule display text
  const getScheduleText = useCallback((habit: Habit): string => {
    if (habit.frequency === "daily") return dict.habits?.everyDay || "Every Day";
    if (!habit.scheduleDays) return dict.habits?.everyDay || "Every Day";
    try {
      const days: string[] = JSON.parse(habit.scheduleDays);
      const dayLabels: Record<string, string> = {
        mon: dict.habits?.days?.mon || "Mon",
        tue: dict.habits?.days?.tue || "Tue",
        wed: dict.habits?.days?.wed || "Wed",
        thu: dict.habits?.days?.thu || "Thu",
        fri: dict.habits?.days?.fri || "Fri",
        sat: dict.habits?.days?.sat || "Sat",
        sun: dict.habits?.days?.sun || "Sun",
      };
      return days.map((d) => dayLabels[d] || d).join(", ");
    } catch {
      return "";
    }
  }, [dict]);

  // Check if a specific item is completed today
  const isItemCompleted = useCallback((habit: Habit, itemId: string | null): boolean => {
    return habit.logs.some((log) =>
      itemId ? log.habitItemId === itemId : !log.habitItemId
    );
  }, []);

  // Calculate today's progress for a habit
  const getTodayProgress = useCallback(
    (habit: Habit): { done: number; total: number } => {
      if (habit.items.length === 0) {
        return {
          done: isItemCompleted(habit, null) ? 1 : 0,
          total: 1,
        };
      }
      const done = habit.items.filter((item) =>
        isItemCompleted(habit, item.id)
      ).length;
      return { done, total: habit.items.length };
    },
    [isItemCompleted]
  );

  // Stats
  const stats = {
    total: habits.length,
    todayDone: habits.filter((h) => {
      if (!isTodayScheduled(h)) return false;
      const p = getTodayProgress(h);
      return p.done === p.total;
    }).length,
    todayTotal: habits.filter((h) => isTodayScheduled(h)).length,
  };

  const isAllDone = stats.todayDone === stats.todayTotal && stats.todayTotal > 0;
  const userStreak = Math.max(...habits.map(h => h.currentStreak || 0), 0);

  // CRUD
  const handleSaveHabit = async (data: {
    id?: string;
    title: string;
    description?: string;
    icon?: string;
    frequency: "daily" | "custom";
    scheduleDays?: string[];
    items?: string[];
  }) => {
    if (data.id) {
      const res = await fetch(`/api/habits/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          icon: data.icon,
          frequency: data.frequency,
          scheduleDays: data.scheduleDays,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setHabits((prev) => prev.map((h) => (h.id === data.id ? updated : h)));
      }
    } else {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json();
        setHabits((prev) => [...prev, created]);
      }
    }
  };

  const handleDeleteHabit = async (id: string) => {
    const res = await fetch(`/api/habits/${id}`, { method: "DELETE" });
    if (res.ok) {
      setHabits((prev) => prev.filter((h) => h.id !== id));
    }
  };

  const handleToggleCheck = async (
    habitId: string,
    habitItemId: string | null,
    isCompleted: boolean
  ) => {
    const key = `check_${habitId}_${habitItemId || "self"}`;
    setLoadingStates((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch(`/api/habits/${habitId}/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitItemId, isCompleted }),
      });
      if (res.ok) {
        const data = await res.json();
        const { milestoneReached, milestoneCount, ...updatedHabit } = data;

        setHabits((prev) => prev.map((h) => (h.id === habitId ? updatedHabit : h)));

        if (milestoneReached && milestoneCount) {
          setCelebrationData({ milestone: milestoneCount, title: updatedHabit.title });
        }
      }
    } finally {
      setLoadingStates((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <style>{`
        @keyframes flicker {
          0%   { transform: scaleX(1)    scaleY(1)    rotate(-1deg); }
          33%  { transform: scaleX(1.04) scaleY(0.97) rotate(1.5deg); }
          66%  { transform: scaleX(0.96) scaleY(1.03) rotate(-0.5deg); }
          100% { transform: scaleX(1.02) scaleY(0.98) rotate(1deg); }
        }
        .flame {
          position: absolute;
          bottom: 0;
          border-radius: 50% 50% 20% 20% / 60% 60% 30% 30%;
          transform-origin: bottom center;
        }
        .flame-outer {
          width: 44px; height: 60px;
          background: #E2400A;
          left: 10px;
          animation: flicker 0.9s ease-in-out infinite alternate;
        }
        .flame-mid {
          width: 30px; height: 45px;
          background: #F07A14;
          left: 17px;
          animation: flicker 0.7s ease-in-out infinite alternate-reverse;
        }
        .flame-inner {
          width: 18px; height: 30px;
          background: #FAC93A;
          left: 23px;
          animation: flicker 0.5s ease-in-out infinite alternate;
        }
        .flame-core {
          width: 8px; height: 15px;
          background: #FFF5B0;
          left: 28px;
          animation: flicker 0.4s ease-in-out infinite alternate-reverse;
          border-radius: 50% 50% 30% 30% / 60% 60% 40% 40%;
        }
      `}</style>
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="lg:col-span-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white p-4 md:p-5 rounded-xl border border-slate-100 shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-md shrink-0">
              <Zap size={18} />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-zinc-900">
                {dict.habits?.title || "Habit Tracking"}
              </h2>
              <p className="text-[11px] md:text-xs text-slate-400 font-normal">
                {dict.habits?.desc || "Monitor your daily consistency."}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingHabit(null);
              setModalOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold shadow-md hover:bg-zinc-800 active:scale-95 transition-all w-full sm:w-auto"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>{dict.habits?.addBtn || "Add habit"}</span>
          </button>
        </div>

        {/* Red Flame Card (Streak Widget) */}
        <div className="bg-white border border-slate-100 p-4 md:p-5 rounded-xl flex flex-col items-center justify-center shadow-sm relative overflow-hidden group">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
             {lang === 'id' ? 'Streak Kamu' : 'Your Streak'}
          </div>

          <div className="relative w-16 h-20 mb-2 flex items-center justify-center">
            {isAllDone ? (
              <div className="relative w-full h-full flex items-end justify-center">
                <div className="flame flame-outer" />
                <div className="flame flame-mid" />
                <div className="flame flame-inner" />
                <div className="flame flame-core" />
              </div>
            ) : (
              <div className="opacity-20 grayscale">
                <svg width="60" height="80" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M30 70 C14 70 6 58 6 46 C6 34 14 26 20 20 C20 28 24 32 24 32 C24 20 28 10 30 4 C34 14 36 20 36 20 C40 16 42 10 42 10 C50 20 54 32 54 46 C54 58 46 70 30 70Z"
                    fill="#B4B2A9" />
                </svg>
              </div>
            )}
          </div>

          <div className="text-4xl font-black text-zinc-900 leading-none">
            {userStreak}
          </div>
          
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight">
            {lang === 'id' ? 'hari berturut-turut' : 'days in a row'}
          </p>
        </div>

        {/* Today Stats */}
        <div className="bg-zinc-900 p-4 md:p-5 rounded-xl text-white flex flex-row lg:flex-col justify-between items-center lg:items-start shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
            <CheckCircle2 size={48} strokeWidth={1} />
          </div>
          <div className="flex items-center gap-2 lg:justify-between lg:w-full opacity-50 relative z-10">
            <CheckCircle2 size={14} />
            <p className="text-[10px] font-semibold">
              {dict.habits?.todayProgress || "Today's Progress"}
            </p>
          </div>
          <div className="relative z-10 text-right lg:text-left">
            <p className="text-2xl md:text-3xl font-bold tracking-tight leading-none">
              {stats.todayDone}/{stats.todayTotal}
            </p>
            <p className="text-[9px] font-medium text-zinc-500 mt-0.5">
              {dict.habits?.habitsCompleted || "habits completed"}
            </p>
          </div>
        </div>
      </div>

      {/* Habits List */}
      <div className="grid grid-cols-1 gap-3">
        <AnimatePresence mode="popLayout">
          {habits.map((habit) => {
            const scheduled = isTodayScheduled(habit);
            const progress = getTodayProgress(habit);
            const allDone = progress.done === progress.total && scheduled;
            const scheduleText = getScheduleText(habit);

            return (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "p-4 md:p-5 rounded-xl bg-white border shadow-sm transition-all duration-300 group",
                  !scheduled
                    ? "border-dashed border-slate-200 opacity-60"
                    : allDone
                    ? "border-emerald-200 bg-emerald-50/30"
                    : "border-slate-100 hover:border-zinc-300 hover:shadow-md"
                )}
              >
                {/* Row 1: Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg shrink-0">
                      {habit.icon || "⚡"}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-zinc-900 truncate">
                          {habit.title}
                        </h3>
                        {/* Schedule badge */}
                        <span className="px-2 py-0.5 rounded-md bg-slate-50 text-[9px] font-semibold text-slate-400">
                          {scheduleText}
                        </span>
                      </div>
                      {habit.description && (
                        <p className="text-[11px] text-slate-400 font-normal leading-relaxed truncate">
                          {habit.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Progress + Menu */}
                  <div className="flex items-center gap-2 shrink-0">
                    {scheduled && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase",
                          allDone
                            ? "bg-emerald-100 text-emerald-700"
                            : progress.done > 0
                            ? "bg-amber-50 text-amber-600"
                            : "bg-slate-50 text-slate-400"
                        )}
                      >
                        {progress.done}/{progress.total}
                      </span>
                    )}
                    {!scheduled && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-[9px] font-semibold text-slate-400">
                        <Moon size={9} />
                        {dict.habits?.offDay || "Off-day"}
                      </span>
                    )}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === habit.id ? null : habit.id);
                        }}
                        className="p-1.5 text-slate-300 hover:text-zinc-900 transition-colors rounded-lg hover:bg-slate-50"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {menuOpen === habit.id && (
                        <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingHabit(habit);
                              setModalOpen(true);
                              setMenuOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                          >
                            <Pencil size={12} />
                            {dict.habits?.edit || "Edit"}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(habit.id);
                              setMenuOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-xs font-semibold text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 size={12} />
                            {dict.habits?.delete || "Delete"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 2: Sub-items or Single Toggle */}
                <div className="mt-4">
                  {habit.items.length > 0 ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      {habit.items.map((item) => {
                        const completed = isItemCompleted(habit, item.id);
                        const loadKey = `check_${habit.id}_${item.id}`;
                        const isLoading = loadingStates[loadKey];

                        return (
                          <button
                            key={item.id}
                            disabled={!scheduled || isLoading}
                            onClick={() =>
                              handleToggleCheck(habit.id, item.id, !completed)
                            }
                            className={cn(
                              "flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border transition-all min-w-[60px]",
                              !scheduled
                                ? "bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed"
                                : completed
                                ? "bg-emerald-50 border-emerald-200 shadow-sm"
                                : "bg-white border-slate-100 hover:border-zinc-300 hover:shadow-sm active:scale-95"
                            )}
                          >
                            <div
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all",
                                !scheduled
                                  ? "border-slate-200 bg-slate-100"
                                  : completed
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : "border-slate-300 hover:border-zinc-600"
                              )}
                            >
                              {isLoading ? (
                                <Loader2 size={10} className="animate-spin text-slate-400" />
                              ) : completed ? (
                                <CheckCircle2 size={12} strokeWidth={3} />
                              ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                              )}
                            </div>
                            <span
                              className={cn(
                                "text-[10px] font-semibold leading-none",
                                completed ? "text-emerald-700" : "text-slate-500"
                              )}
                            >
                              {item.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    /* Single toggle for habits without sub-items */
                    <button
                      disabled={!scheduled || loadingStates[`check_${habit.id}_self`]}
                      onClick={() =>
                        handleToggleCheck(
                          habit.id,
                          null,
                          !isItemCompleted(habit, null)
                        )
                      }
                      className={cn(
                        "w-full py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-all",
                        !scheduled
                          ? "bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed"
                          : isItemCompleted(habit, null)
                          ? "bg-emerald-50 border-emerald-300"
                          : "border-slate-200 hover:border-zinc-400 active:scale-[0.99]"
                      )}
                    >
                      <div
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all",
                          isItemCompleted(habit, null)
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-300"
                        )}
                      >
                        {loadingStates[`check_${habit.id}_self`] ? (
                          <Loader2 size={12} className="animate-spin text-slate-400" />
                        ) : isItemCompleted(habit, null) ? (
                          <CheckCircle2 size={14} strokeWidth={3} />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-200" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          isItemCompleted(habit, null)
                            ? "text-emerald-700"
                            : "text-slate-400"
                        )}
                      >
                        {isItemCompleted(habit, null)
                          ? dict.habits?.completed || "Completed!"
                          : dict.habits?.tapToCheck || "Tap to mark done"}
                      </span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty State */}
        {habits.length === 0 && (
          <div className="py-16 bg-white rounded-xl border border-slate-100 border-dashed flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200">
              <Zap size={28} />
            </div>
            <div>
              <p className="text-slate-500 font-semibold text-sm mb-0.5">
                {dict.habits?.empty || "No habits defined"}
              </p>
              <p className="text-[11px] text-slate-300 font-normal max-w-xs">
                {dict.habits?.emptyDesc ||
                  "Create your first habit to start tracking consistency."}
              </p>
            </div>
            <button
              onClick={() => {
                setEditingHabit(null);
                setModalOpen(true);
              }}
              className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-semibold shadow-md hover:bg-zinc-800 active:scale-95 transition-all flex items-center gap-2"
            >
              <Sparkles size={12} />
              {dict.habits?.addBtn || "Add habit"}
            </button>
          </div>
        )}
      </div>

      {/* Habit Modal */}
      <HabitModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        habit={editingHabit}
        dict={dict}
      />

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) handleDeleteHabit(deleteConfirm);
        }}
        title={dict.habits?.deleteTitle || "Delete Habit"}
        message={
          dict.habits?.deleteMessage ||
          "This will permanently delete this habit and all its logs. This action cannot be undone."
        }
        confirmText={dict.habits?.delete || "Delete"}
        cancelText={dict.finance?.modals?.common?.cancel || "Cancel"}
        variant="danger"
      />

      {/* Streak Celebration Overlay */}
      <AnimatePresence>
        {celebrationData && (
          <StreakCelebration
            key="celebration"
            milestone={celebrationData.milestone}
            habitTitle={celebrationData.title}
            onComplete={() => setCelebrationData(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HabitsView;
