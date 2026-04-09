"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  FileText, 
  Tag, 
  Loader2, 
  Pin,
  Sparkles,
  AlignLeft,
  Calendar,
  Heading
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  title: string;
  content: string;
  category?: string | null;
  color?: string | null;
  colSpan?: number;
  rowSpan?: number;
  updatedAt: Date | string;
  isPinned?: boolean;
}

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: { id?: string; title: string; content: string; category?: string; color?: string; isPinned?: boolean }) => Promise<void>;
  initialData: Note | null;
  dict: any;
  lang: string;
}

const NoteModal = ({ isOpen, onClose, onSave, initialData, dict, lang }: NoteModalProps) => {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);

  const NOTE_COLORS = [
    { name: "Default", value: "" },
    { name: "Red", value: "#fee2e2" },
    { name: "Orange", value: "#ffedd5" },
    { name: "Yellow", value: "#fef08a" },
    { name: "Green", value: "#dcfce7" },
    { name: "Blue", value: "#e0f2fe" },
    { name: "Purple", value: "#f3e8ff" },
    { name: "Pink", value: "#fae8ff" },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || "");
      setContent(initialData?.content || "");
      setCategory(initialData?.category || "");
      setColor(initialData?.color || "");
      setIsPinned(initialData?.isPinned || false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialData]);

  if (!mounted) return null;

  const handleSubmit = async () => {
    if (!title.trim()) return;
    
    setLoading(true);
    try {
      await onSave({
        id: initialData?.id,
        title: title.trim(),
        content: content.trim(),
        category: category.trim() || undefined,
        color: color || undefined,
        isPinned,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
            className="relative w-full max-w-[440px] max-h-[85vh] rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col transition-colors duration-300"
            style={{ backgroundColor: color || "#ffffff" }}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-2 flex items-center justify-between sticky top-0 z-10 shrink-0 transition-colors duration-300" style={{ backgroundColor: color || "#ffffff" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-md">
                  <FileText size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    {initialData ? (lang === 'id' ? 'Edit Catatan' : 'Edit Note') : (lang === 'id' ? 'Catatan Baru' : 'New Note')}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                    {lang === 'id' ? 'Simpan ide brilian Anda' : 'Capture your thoughts and ideas'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsPinned(!isPinned)}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                    isPinned ? "bg-zinc-900 text-white shadow-md scale-105" : "text-slate-300 hover:text-zinc-900 bg-slate-50"
                  )}
                >
                  <Pin size={14} strokeWidth={2.5} className={isPinned ? "fill-white" : ""} />
                </button>
                <button onClick={onClose} className="p-2 text-slate-300 hover:text-zinc-900 rounded-full transition-all">
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 scrollbar-hide">
              
              {/* Title Input */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Heading size={10} strokeWidth={3} />
                  <label className="text-[10px] font-semibold uppercase tracking-wider">
                    {lang === 'id' ? 'Judul Catatan' : 'Note Title'}
                  </label>
                </div>
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={lang === 'id' ? 'Tulis judul di sini...' : 'Enter title here...'}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-zinc-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Tag size={10} strokeWidth={3} />
                  <label className="text-[10px] font-semibold uppercase tracking-wider">
                    {lang === 'id' ? 'Kategori' : 'Category'}
                  </label>
                </div>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder={lang === 'id' ? 'e.g. Kerja, Personal, List' : 'e.g. Work, Personal, List'}
                  className="w-full h-11 px-4 bg-white/50 backdrop-blur-sm border border-slate-100/60 rounded-xl text-xs font-semibold text-zinc-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all"
                />
              </div>

              {/* Color Picker */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <div className="w-[10px] h-[10px] rounded-full border-2 border-current" />
                  <label className="text-[10px] font-semibold uppercase tracking-wider">
                    {lang === 'id' ? 'Warna Sampul' : 'Cover Color'}
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={cn(
                        "w-7 h-7 rounded-full shadow-sm transition-transform border border-slate-200/50",
                        color === c.value ? "scale-110 ring-2 ring-zinc-400 ring-offset-1" : "hover:scale-110",
                        c.value === "" && "bg-white"
                      )}
                      style={c.value ? { backgroundColor: c.value } : undefined}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <AlignLeft size={10} strokeWidth={3} />
                  <label className="text-[10px] font-semibold uppercase tracking-wider">
                    {lang === 'id' ? 'Isi Catatan' : 'Content'}
                  </label>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={lang === 'id' ? 'Mulai mengetik di sini...' : 'Start typing here...'}
                  className="w-full min-h-[160px] p-4 bg-white/50 backdrop-blur-sm border border-slate-100/60 rounded-2xl text-[13px] font-medium text-slate-700 leading-relaxed placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all resize-none"
                />
              </div>

              {initialData && (
                 <div className="pt-2 flex items-center justify-center gap-2 text-slate-300">
                    <Calendar size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">
                      Last edited: {new Date(initialData.updatedAt).toLocaleString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                 </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-2 flex items-center gap-3 shrink-0 transition-colors duration-300" style={{ backgroundColor: color || "#ffffff" }}>
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 h-11 rounded-xl bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50"
              >
                {lang === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !title.trim()}
                className="flex-1 h-11 rounded-xl bg-zinc-900 text-white text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-zinc-900/10 hover:bg-zinc-800 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles size={14} className="fill-white/20" />
                    <span>{initialData ? (lang === 'id' ? 'Simpan' : 'Save') : (lang === 'id' ? 'Buat' : 'Create')}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default NoteModal;
