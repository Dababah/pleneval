"use client";

import React, { useState } from "react";
import { Wallet, TrendingUp, AlertCircle, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FinanceCardProps {
  spent: number;
  budget: number;
  dict: any;
}

const FinanceCard = ({ spent, budget, dict }: FinanceCardProps) => {
  const [showBalance, setShowBalance] = useState(false);
  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOverBudget = spent > budget && budget > 0;

  return (
    <div className="p-4 md:p-5 rounded-3xl bg-zinc-900 text-white shadow-2xl shadow-zinc-900/40 space-y-4 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-6 opacity-5">
        <Wallet size={80} />
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold tracking-tight">{dict.dashboard.widgets.financialHealth}</h2>
            <button 
                onClick={() => setShowBalance(!showBalance)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors text-zinc-500"
            >
                {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
        </div>
        <TrendingUp size={14} className="text-zinc-500" />
      </div>

      <div className="space-y-0.5 relative z-10">
        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">{dict.dashboard.widgets.monthlySpending}</p>
        <div className="flex items-baseline gap-2">
            <AnimatePresence mode="wait">
                <motion.h3 
                    key={showBalance ? "visible" : "hidden"}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-xl md:text-2xl font-black tracking-tighter"
                >
                    {showBalance ? `Rp ${spent.toLocaleString('id-ID')}` : "Rp ••••••"}
                </motion.h3>
            </AnimatePresence>
            <span className="text-[9px] text-zinc-500 font-bold uppercase">
                / {showBalance ? budget.toLocaleString('id-ID') : "••••••"}
            </span>
        </div>
      </div>

      <div className="space-y-2 relative z-10">
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${isOverBudget ? "bg-red-500" : "bg-white"}`}
          />
        </div>
        <div className="flex items-center justify-between">
            <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
                {isOverBudget 
                  ? dict.dashboard.widgets.budgetExceeded 
                  : dict.dashboard.widgets.budgetUsed.replace('{percent}', Math.round(percentage).toString())}
            </p>
            {isOverBudget && <AlertCircle size={10} className="text-red-500 animate-pulse" />}
        </div>
      </div>
    </div>
  );
};

export default FinanceCard;
