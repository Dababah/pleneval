"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Target,
  Plus,
  TrendingUp,
  CheckCircle2,
  Clock,
  MoreVertical,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronRight,
  CalendarClock,
  Trophy,
  Pause,
  Play,
  Flag,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import GoalModal from "./GoalModal";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface Milestone {
  id: string;
  title: string;
  isCompleted: boolean;
}

interface Goal {
  id: string;
  title: string;
  description?: string | null;
  targetDate?: string | Date | null;
  progress: number;
  milestones: Milestone[];
  createdAt: string | Date;
}

interface GoalsViewProps {
  initialGoals: Goal[];
  lang: string;
  dict: Record<string, any>;
}

// Circular progress ring component
const ProgressRing = ({
  progress,
  milestoneCount,
  size = 56,
  strokeWidth = 4,
}: {
  progress: number;
  milestoneCount: number;
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const hasMilestones = milestoneCount > 0;
  const offset = circumference - (hasMilestones ? (progress / 100) * circumference : circumference);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            "transition-all duration-1000 ease-out",
            !hasMilestones 
              ? "text-slate-200"
              : progress === 100
              ? "text-emerald-500"
              : progress >= 60
              ? "text-zinc-900"
              : progress >= 30
              ? "text-amber-500"
              : "text-slate-400"
          )}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            "font-bold leading-none",
            !hasMilestones ? "text-slate-300" : "text-zinc-900",
            size >= 56 ? "text-xs" : "text-[9px]"
          )}
        >
          {hasMilestones ? `${progress}%` : "—"}
        </span>
      </div>
    </div>
  );
};

type StatusFilter = "all" | "in_progress" | "completed" | "paused" | "overdue" | "no_milestones";

const GoalsView = ({ initialGoals, lang, dict }: GoalsViewProps) => {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [newMilestoneText, setNewMilestoneText] = useState<
    Record<string, string>
  >({});
  const [addingMilestone, setAddingMilestone] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setMenuOpen(null);
    if (menuOpen) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  // Determine goal status
  const getGoalStatus = useCallback((goal: Goal): StatusFilter => {
    if (goal.milestones.length === 0) return "no_milestones";
    if (goal.progress === 100) return "completed";
    if (goal.targetDate) {
      const target = new Date(goal.targetDate);
      if (target < new Date() && goal.progress < 100) return "overdue";
    }
    return "in_progress";
  }, []);

  // Calculate stats
  const stats = {
    total: goals.length,
    active: goals.filter((g) => getGoalStatus(g) === "in_progress").length,
    completed: goals.filter((g) => g.progress === 100).length,
    overdue: goals.filter((g) => getGoalStatus(g) === "overdue").length,
    noMilestones: goals.filter((g) => g.milestones.length === 0).length,
  };

  // Filter goals
  const filteredGoals = goals.filter((g) => {
    if (statusFilter === "all") return true;
    return getGoalStatus(g) === statusFilter;
  });

  // Days remaining
  const getDaysRemaining = (targetDate: string | Date) => {
    const target = new Date(targetDate);
    const now = new Date();
    const diff = Math.ceil(
      (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  };

  // CRUD Operations
  const handleSaveGoal = async (data: {
    id?: string;
    title: string;
    description?: string;
    targetDate?: string;
  }) => {
    if (data.id) {
      // Update
      const res = await fetch(`/api/goals/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setGoals((prev) => prev.map((g) => (g.id === data.id ? updated : g)));
      }
    } else {
      // Create
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json();
        setGoals((prev) => [created, ...prev]);
      }
    }
  };

  const handleDeleteGoal = async (id: string) => {
    const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
    if (res.ok) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const handleToggleMilestone = async (
    goalId: string,
    milestoneId: string,
    isCompleted: boolean
  ) => {
    setLoadingStates((prev) => ({ ...prev, [milestoneId]: true }));
    try {
      const res = await fetch(`/api/goals/${goalId}/milestones`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId, isCompleted }),
      });
      if (res.ok) {
        const updated = await res.json();
        setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
      }
    } finally {
      setLoadingStates((prev) => ({ ...prev, [milestoneId]: false }));
    }
  };

  const handleAddMilestone = async (goalId: string) => {
    const text = newMilestoneText[goalId]?.trim();
    if (!text) return;

    setLoadingStates((prev) => ({ ...prev, [`add_${goalId}`]: true }));
    try {
      const res = await fetch(`/api/goals/${goalId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: text }),
      });
      if (res.ok) {
        const updated = await res.json();
        setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
        setNewMilestoneText((prev) => ({ ...prev, [goalId]: "" }));
        setAddingMilestone(null);
      }
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`add_${goalId}`]: false }));
    }
  };

  const handleDeleteMilestone = async (
    goalId: string,
    milestoneId: string
  ) => {
    setLoadingStates((prev) => ({ ...prev, [milestoneId]: true }));
    try {
      const res = await fetch(
        `/api/goals/${goalId}/milestones?milestoneId=${milestoneId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        const updated = await res.json();
        setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
      }
    } finally {
      setLoadingStates((prev) => ({ ...prev, [milestoneId]: false }));
    }
  };

  const statusFilters: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: dict.goals?.filterAll || "All", count: stats.total },
    {
      key: "in_progress",
      label: dict.goals?.status?.in_progress || "In Progress",
      count: stats.active,
    },
    {
      key: "completed",
      label: dict.goals?.status?.completed || "Completed",
      count: stats.completed,
    },
    {
      key: "overdue",
      label: dict.goals?.status?.overdue || "Overdue",
      count: stats.overdue,
    },
    {
      key: "no_milestones",
      label: dict.goals?.needsSetup || "Needs Setup",
      count: stats.noMilestones,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Title Area */}
        <div className="lg:col-span-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white p-4 md:p-5 rounded-xl border border-slate-100 shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-md shrink-0">
              <Target size={18} />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-zinc-900">
                {dict.goals?.title || "Active Roadmap"}
              </h2>
              <p className="text-[11px] md:text-xs text-slate-400 font-normal">
                {dict.goals?.desc || "Track your long-term objectives."}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingGoal(null);
              setModalOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold shadow-md hover:bg-zinc-800 active:scale-95 transition-all"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>{dict.goals?.newBtn || "New goal"}</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {dict.goals?.status?.in_progress || "Active"}
            </p>
            <p className="text-2xl font-bold text-zinc-900 leading-none mt-1">
              {stats.active}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Play size={16} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-zinc-900 p-4 md:p-5 rounded-xl text-white shadow-md flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
            <Trophy size={48} strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              {dict.goals?.status?.completed || "Completed"}
            </p>
            <p className="text-2xl font-bold leading-none mt-1">
              {stats.completed}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center relative z-10">
            <Trophy size={16} />
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
        {statusFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap",
              statusFilter === f.key
                ? "bg-zinc-900 text-white shadow-md"
                : "bg-white text-slate-500 border border-slate-100 hover:border-zinc-300"
            )}
          >
            {f.label}
            <span
              className={cn(
                "w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold",
                statusFilter === f.key
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-400"
              )}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <AnimatePresence mode="popLayout">
          {filteredGoals.map((goal) => {
            const status = getGoalStatus(goal);
            const daysLeft = goal.targetDate
              ? getDaysRemaining(goal.targetDate)
              : null;
            const isExpanded = expandedGoal === goal.id;
            const completedMilestones = goal.milestones.filter(
              (m) => m.isCompleted
            ).length;

            return (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "bg-white rounded-xl border overflow-hidden group hover:shadow-md transition-all duration-300 relative",
                  status === "completed"
                    ? "border-emerald-200 bg-emerald-50/30"
                    : status === "overdue"
                    ? "border-red-200 bg-red-50/20"
                    : status === "no_milestones"
                    ? "border-dashed border-slate-200 opacity-90"
                    : "border-slate-100 hover:border-zinc-300"
                )}
              >
                {/* Card Header */}
                <div className="p-4 md:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Progress Ring */}
                      <ProgressRing 
                        progress={goal.progress} 
                        milestoneCount={goal.milestones.length} 
                        size={48} 
                        strokeWidth={3.5} 
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        {/* Status Badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider",
                              status === "completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : status === "overdue"
                                ? "bg-red-100 text-red-600"
                                : status === "no_milestones"
                                ? "bg-slate-100 text-slate-400"
                                : "bg-zinc-100 text-zinc-600"
                            )}
                          >
                            {status === "no_milestones" 
                              ? dict.goals?.noMilestones || "No Milestones" 
                              : status === "overdue"
                              ? dict.goals?.status?.overdue || "Overdue"
                              : dict.goals?.status?.[status] || status}
                          </span>

                          {daysLeft !== null && status !== "completed" && (
                            <span
                              className={cn(
                                "flex items-center gap-1 text-[9px] font-semibold",
                                daysLeft < 0
                                  ? "text-red-500"
                                  : daysLeft <= 7
                                  ? "text-amber-500"
                                  : "text-slate-400"
                              )}
                            >
                              <CalendarClock size={10} />
                              {daysLeft < 0
                                ? `${Math.abs(daysLeft)}d ${dict.goals?.overdue || "overdue"}`
                                : daysLeft === 0
                                ? dict.goals?.today || "Today"
                                : `${daysLeft}d ${dict.goals?.left || "left"}`}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-bold text-zinc-900 leading-snug">
                          {goal.title}
                        </h3>
                        {goal.description && (
                          <p className="text-[11px] text-slate-400 font-normal leading-relaxed line-clamp-2">
                            {goal.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Menu */}
                    <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === goal.id ? null : goal.id);
                        }}
                        className="p-1.5 text-slate-300 hover:text-zinc-900 transition-colors rounded-lg hover:bg-slate-50"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {menuOpen === goal.id && (
                        <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingGoal(goal);
                              setModalOpen(true);
                              setMenuOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                          >
                            <Pencil size={12} />
                            {dict.goals?.edit || "Edit"}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(goal.id);
                              setMenuOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-xs font-semibold text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 size={12} />
                            {dict.goals?.delete || "Delete"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Milestone Summary */}
                  <button
                    onClick={() =>
                      setExpandedGoal(isExpanded ? null : goal.id)
                    }
                    className="mt-3 w-full flex items-center justify-between py-2 px-3 bg-slate-50/80 hover:bg-slate-100/80 rounded-lg transition-all group/expand"
                  >
                    <div className="flex items-center gap-2">
                      <Flag size={11} className="text-slate-400" />
                      <span className="text-[10px] font-semibold text-slate-500">
                        {dict.goals?.milestones || "Milestones"}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-900">
                        {completedMilestones}/{goal.milestones.length}
                      </span>
                    </div>
                    <ChevronDown
                      size={12}
                      className={cn(
                        "text-slate-400 transition-transform duration-300",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>
                </div>

                {/* Expanded Milestones */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-1.5">
                        {goal.milestones.map((ms) => (
                          <div
                            key={ms.id}
                            className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100/50 hover:bg-white hover:border-slate-200 transition-all group/ms"
                          >
                            <button
                              onClick={() =>
                                handleToggleMilestone(
                                  goal.id,
                                  ms.id,
                                  !ms.isCompleted
                                )
                              }
                              disabled={loadingStates[ms.id]}
                              className={cn(
                                "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                                ms.isCompleted
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : "border-slate-300 hover:border-zinc-700"
                              )}
                            >
                              {loadingStates[ms.id] ? (
                                <Loader2
                                  size={8}
                                  className="animate-spin text-slate-400"
                                />
                              ) : (
                                ms.isCompleted && (
                                  <CheckCircle2 size={8} strokeWidth={3} />
                                )
                              )}
                            </button>
                            <p
                              className={cn(
                                "text-[11px] font-medium flex-1 truncate",
                                ms.isCompleted
                                  ? "text-slate-400 line-through"
                                  : "text-zinc-800"
                              )}
                            >
                              {ms.title}
                            </p>
                            <button
                              onClick={() =>
                                handleDeleteMilestone(goal.id, ms.id)
                              }
                              disabled={loadingStates[ms.id]}
                              className="opacity-0 group-hover/ms:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}

                        {/* Add Milestone */}
                        {addingMilestone === goal.id ? (
                          <div className="flex items-center gap-2 p-2">
                            <input
                              autoFocus
                              value={newMilestoneText[goal.id] || ""}
                              onChange={(e) =>
                                setNewMilestoneText((prev) => ({
                                  ...prev,
                                  [goal.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddMilestone(goal.id);
                                if (e.key === "Escape") setAddingMilestone(null);
                              }}
                              placeholder={
                                dict.goals?.milestonePlaceholder ||
                                "e.g. Complete chapter 1..."
                              }
                              className="flex-1 text-[11px] font-medium text-zinc-900 placeholder:text-slate-300 bg-transparent focus:outline-none"
                            />
                            <button
                              onClick={() => handleAddMilestone(goal.id)}
                              disabled={
                                loadingStates[`add_${goal.id}`] ||
                                !newMilestoneText[goal.id]?.trim()
                              }
                              className="px-3 py-1 bg-zinc-900 text-white rounded-md text-[10px] font-semibold disabled:opacity-50 hover:bg-zinc-800 transition-all flex items-center gap-1"
                            >
                              {loadingStates[`add_${goal.id}`] ? (
                                <Loader2 size={10} className="animate-spin" />
                              ) : (
                                "Add"
                              )}
                            </button>
                            <button
                              onClick={() => setAddingMilestone(null)}
                              className="p-1 text-slate-400 hover:text-zinc-900 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAddingMilestone(goal.id)}
                            className="w-full py-5 text-center text-[22px] font-medium text-slate-400 border border-dashed border-slate-200 rounded-lg hover:border-zinc-300 hover:text-zinc-900 transition-all flex items-center justify-center gap-1.5"
                          >
                            <Plus size={22} />
                            {dict.goals?.addMilestone || "Add Milestone"}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty State */}
        {filteredGoals.length === 0 && (
          <div className="lg:col-span-2 py-16 bg-white rounded-xl border border-slate-100 border-dashed flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-slate-500 font-semibold text-sm mb-0.5">
                {statusFilter !== "all"
                  ? dict.goals?.noFiltered || "No goals in this filter"
                  : dict.goals?.empty || "No goals defined"}
              </p>
              <p className="text-[11px] text-slate-300 font-normal max-w-xs">
                {dict.goals?.emptyDesc ||
                  "Create your first long-term goal to start tracking progress."}
              </p>
            </div>
            {statusFilter === "all" && (
              <button
                onClick={() => {
                  setEditingGoal(null);
                  setModalOpen(true);
                }}
                className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-semibold shadow-md hover:bg-zinc-800 active:scale-95 transition-all flex items-center gap-2"
              >
                <Sparkles size={12} />
                {dict.goals?.createFirst || "Create Goal"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Goal Modal */}
      <GoalModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        goal={editingGoal}
        dict={dict}
      />

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) handleDeleteGoal(deleteConfirm);
        }}
        title={dict.goals?.deleteTitle || "Delete Goal"}
        message={
          dict.goals?.deleteMessage ||
          "This will permanently delete this goal and all its milestones. This action cannot be undone."
        }
        confirmText={dict.goals?.delete || "Delete"}
        cancelText={dict.finance?.modals?.common?.cancel || "Cancel"}
        variant="danger"
      />
    </div>
  );
};

export default GoalsView;
