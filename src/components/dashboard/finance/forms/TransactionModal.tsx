"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Save, TrendingUp, TrendingDown, Calendar, Tag, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrencyInput, parseCurrency } from "@/lib/finance-utils";
import { Transaction, BudgetCategory } from "@/lib/finance-types";

interface TransactionModalProps {
  onClose: () => void;
  onSave: (data: Omit<Transaction, "id">) => Promise<void>;
  initialData?: Transaction;
  budgets: BudgetCategory[];
  dict: any;
  lang: string;
}

const DEFAULT_CATEGORIES = [
  "Makanan", "Transport", "Belanja", "Kesehatan", 
  "Hiburan", "Tagihan", "Cicilan", "Lainnya"
];

const INCOME_CATEGORY = "Pemasukan";

export default function TransactionModal({ onClose, onSave, initialData, budgets, dict, lang }: TransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(initialData?.name || "");
  const [amountStr, setAmountStr] = useState(initialData ? formatCurrencyInput(initialData.amount) : "");
  const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'expense');
  const [category, setCategory] = useState(initialData?.category || "");
  const [date, setDate] = useState(initialData?.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState(initialData?.note || "");
  const [mounted, setMounted] = useState(false);

  // Sync category when type changes
  useEffect(() => {
    const INCOME_CATEGORY = dict.finance.overview.income;
    if (type === 'income') {
      setCategory(INCOME_CATEGORY);
    } else if (type === 'expense' && category === INCOME_CATEGORY) {
      setCategory("");
    }
  }, [type, category, dict]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = budgets.map(b => b.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amountStr || !category || !date) return;

    setLoading(true);
    try {
      await onSave({
        name,
        amount: parseCurrency(amountStr),
        type,
        category,
        date: new Date(date).toISOString(),
        note
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-zinc-900/5 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-500 relative z-10">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-zinc-50/50">
            <div>
              <h2 className="text-lg font-black text-zinc-900 leading-tight">
                {initialData ? dict.finance.modals.transaction.edit : dict.finance.modals.transaction.add}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{dict.finance.modals.transaction.desc}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all active:scale-90">
              <X size={18} className="text-slate-400" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           {/* Transaction Name */}
           <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">{dict.finance.modals.transaction.name}</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={dict.finance.transactions.searchPlaceholder} 
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-zinc-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-300 transition-all"
              />
           </div>

           {/* Amount & Type */}
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">{dict.finance.transactions.table.amount} (Rp)</label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 pointer-events-none group-focus-within:text-zinc-900 transition-colors uppercase">Rp</div>
                    <input 
                        value={amountStr}
                        onChange={(e) => setAmountStr(formatCurrencyInput(e.target.value))}
                        required
                        placeholder="0" 
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-black text-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-300 transition-all placeholder:text-slate-300"
                    />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">{dict.finance.modals.transaction.type}</label>
                <div className="flex h-11 p-1 rounded-xl bg-slate-50 border border-slate-100 gap-1">
                   <button 
                     type="button"
                     onClick={() => setType('income')}
                     className={cn(
                       "flex-1 flex items-center justify-center gap-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all",
                       type === 'income' ? "bg-white shadow-sm text-emerald-600" : "text-slate-400 hover:text-zinc-600"
                     )}
                   >
                     <TrendingUp size={12} /> {dict.finance.overview.income}
                   </button>
                   <button 
                     type="button"
                     onClick={() => setType('expense')}
                     className={cn(
                       "flex-1 flex items-center justify-center gap-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all",
                       type === 'expense' ? "bg-white shadow-sm text-red-500" : "text-slate-400 hover:text-zinc-600"
                     )}
                   >
                     <TrendingDown size={12} /> {dict.finance.overview.expense}
                   </button>
                </div>
              </div>
           </div>

           {/* Category & Date */}
           <div className={cn(
             "grid gap-4 transition-all duration-300",
             type === 'expense' ? "grid-cols-2" : "grid-cols-1"
           )}>
              {type === 'expense' && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-left-2 duration-300">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                     <Tag size={10} /> {dict.finance.modals.transaction.category}
                  </label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required={type === 'expense'}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">{dict.finance.modals.transaction.selectBudget}</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    {categories.length === 0 && (
                      <option disabled value="">{dict.finance.modals.transaction.noBudgets}</option>
                    )}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                   <Calendar size={10} /> {dict.finance.modals.transaction.date}
                </label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all cursor-pointer"
                />
              </div>
           </div>

           {/* Note */}
           <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                 <FileText size={10} /> {dict.finance.modals.transaction.name} ({dict.navbar.finance})
              </label>
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder={dict.finance.modals.transaction.addDetail} 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-zinc-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all resize-none"
              />
           </div>

           <div className="pt-4 flex gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-zinc-900 hover:bg-slate-50 transition-all active:scale-95 border border-transparent hover:border-slate-100"
              >
                {dict.finance.modals.common.cancel}
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-[1.5] h-12 bg-zinc-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-zinc-200 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={14} /> {dict.finance.modals.transaction.save}</>}
              </button>
           </div>
        </form>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
