"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  X, 
  Search, 
  Calendar as CalendarIcon, 
  ChevronRight,
  BookOpen,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface JournalEntry {
  date: string | Date;
  content: string;
  mood: string | null;
}

interface JournalArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntry[];
  onSelectDate: (date: Date) => void;
  lang: string;
  dict: any;
}

const JournalArchiveModal = ({ 
  isOpen, 
  onClose, 
  entries, 
  onSelectDate, 
  dict 
}: JournalArchiveModalProps) => {
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const filteredEntries = useMemo(() => {
    return entries.filter(e => 
      e.content.toLowerCase().includes(search.toLowerCase()) ||
      (e.mood && e.mood.toLowerCase().includes(search.toLowerCase())) ||
      format(new Date(e.date), "MMMM yyyy").toLowerCase().includes(search.toLowerCase())
    );
  }, [entries, search]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop - Clean Glass Blur without dark tint */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-white/10 backdrop-blur-md"
      />

      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-white/50"
      >
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
           <div>
              <h2 className="text-xl font-black text-zinc-900 leading-none">{dict.journal.logs}</h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-2">
                 Total {entries.length} Reflections
              </p>
           </div>
           <button 
             onClick={onClose}
             className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-zinc-900 transition-all"
           >
              <X size={20} />
           </button>
        </div>

        {/* Toolbar */}
        <div className="px-8 py-4 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center border-b border-slate-50">
           <div className="relative flex-1 group w-full">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-zinc-900 transition-colors" />
              <input 
                type="text"
                placeholder="Search through your thoughts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-200 transition-all outline-none"
              />
           </div>
           <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-100 text-xs font-bold text-slate-500 hover:text-zinc-900 transition-all shadow-sm">
              <Filter size={14} /> Filters
           </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 custom-scrollbar bg-slate-50/20">
           {filteredEntries.length > 0 ? (
             filteredEntries.map((entry, i) => (
               <motion.button
                 key={i}
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: i * 0.03 }}
                 onClick={() => {
                   onSelectDate(new Date(entry.date));
                   onClose();
                 }}
                 className="w-full text-left bg-white p-5 rounded-3xl border border-slate-100 hover:border-zinc-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex gap-5 items-start"
               >
                 <div className="w-14 h-14 rounded-[20px] bg-slate-50 flex flex-col items-center justify-center shrink-0 border border-slate-100 group-hover:bg-zinc-900 group-hover:border-zinc-900 transition-all duration-300">
                    <span className="text-[10px] font-black text-slate-400 group-hover:text-zinc-500 uppercase">{format(new Date(entry.date), "MMM")}</span>
                    <span className="text-xl font-black text-zinc-900 group-hover:text-white leading-none">{format(new Date(entry.date), "d")}</span>
                 </div>

                 <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                       <h3 className="text-sm font-black text-zinc-900 group-hover:translate-x-1 transition-transform">{format(new Date(entry.date), "EEEE, yyyy")}</h3>
                       <div className="flex items-center gap-2">
                          {entry.mood && (
                             <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500 uppercase tracking-tighter">
                               {entry.mood}
                             </span>
                          )}
                          <ChevronRight size={14} className="text-slate-300 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all" />
                       </div>
                    </div>
                    <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">
                       {entry.content}
                    </p>
                 </div>
               </motion.button>
             ))
           ) : (
             <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200">
                   <BookOpen size={32} />
                </div>
                <div className="space-y-1">
                   <p className="text-sm font-black text-zinc-900">No entries found</p>
                   <p className="text-xs text-slate-400 font-medium">Try searching for different keywords or dates.</p>
                </div>
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-white border-t border-slate-50 flex items-center justify-center">
           <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">End of Archive</p>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default JournalArchiveModal;
