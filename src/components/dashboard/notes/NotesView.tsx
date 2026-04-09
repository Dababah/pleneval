"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Plus,
  Search,
  Tag,
  MoreVertical,
  Clock,
  Pin,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import NoteModal from "./NoteModal";

import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface Note {
  id: string;
  title: string;
  content: string;
  category?: string | null;
  color?: string | null;
  colSpan?: number;
  rowSpan?: number;
  positionX?: number;
  positionY?: number;
  updatedAt: Date | string;
  isPinned?: boolean;
}

interface NotesViewProps {
  initialNotes: Note[];
  lang: string;
  dict: any;
}

const NoteCard = ({ note, onEdit, onDelete, onTogglePin, lang, h }: any) => {
  const isSmallHeight = h <= 60; // ~150px or less (h is in units of 10px, so 3 rows * 20 = 60)
  const isTiny = h <= 40; // ~100px or less


  return (
    <div
      onPointerDown={(e) => {
        e.currentTarget.dataset.startX = e.clientX.toString();
        e.currentTarget.dataset.startY = e.clientY.toString();
      }}
      onClick={(e) => {
        const startX = parseFloat(e.currentTarget.dataset.startX || "0");
        const startY = parseFloat(e.currentTarget.dataset.startY || "0");
        if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        onEdit(note);
      }}
      className={cn(
        "p-4 rounded-[22px] border border-slate-100/60 shadow-sm hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-200/50 transition-[border-color,box-shadow,background-color,transform] duration-300 cursor-pointer group relative flex flex-col overflow-hidden h-full w-full bg-white",
        isSmallHeight && "p-3",
        isTiny && "p-2"
      )}
      style={{ backgroundColor: note.color || "#ffffff" }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        .mask-image-bottom {
          -webkit-mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
          mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
        }
      `}} />
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex items-start justify-between mb-3 relative z-50 shrink-0">
        <div className={cn(
          "rounded-xl border transition-all duration-300 bg-white/50 backdrop-blur-sm flex items-center justify-center",
          note.isPinned
            ? "text-zinc-900 border-zinc-900 shadow-md shadow-zinc-200/50"
            : "text-slate-400 group-hover:text-zinc-600 border-transparent shadow-sm",
          isSmallHeight ? "w-7 h-7" : "w-10 h-10 p-2"
        )}>
          <FileText size={isSmallHeight ? 14 : 16} strokeWidth={2.5} />
        </div>
        <div className="flex items-center gap-1">
          <button
            onPointerDown={(e) => e.stopPropagation()} // prevent drag
            onClick={(e) => { e.stopPropagation(); onTogglePin(note); }}
            className="p-1.5 text-slate-400 hover:text-zinc-900 hover:bg-white/50 rounded-lg transition-all"
            title={lang === 'id' ? 'Sematkan' : 'Pin note'}
          >
            <Pin size={16} strokeWidth={2.5} className={note.isPinned ? 'text-zinc-900 fill-zinc-900' : ''} />
          </button>
          <div className="relative group/menu">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 text-slate-400 hover:text-zinc-900 hover:bg-white/50 rounded-lg transition-all"
            >
              <MoreVertical size={16} />
            </button>
            <div className="absolute right-0 top-full mt-1 w-32 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-[100] flex flex-col p-1.5 ring-1 ring-black/5 translate-y-1">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(note); }}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl w-full text-left transition-colors"
              >
                <Edit size={12} strokeWidth={3} /> {lang === 'id' ? 'Edit' : 'Edit'}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl w-full text-left transition-colors"
              >
                <Trash2 size={12} strokeWidth={3} /> {lang === 'id' ? 'Hapus' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <h3 className={cn(
        "font-black text-zinc-900 leading-tight truncate relative z-10 shrink-0",
        isSmallHeight ? "text-xs mb-1" : "text-sm mb-2"
      )}>
        {note.title}
      </h3>

      <div className={cn(
        "flex-1 min-h-0 overflow-hidden relative z-10 w-full pb-2 font-medium leading-relaxed whitespace-pre-wrap break-words text-slate-600",
        isSmallHeight ? "text-[11px]" : "text-[13px]"
      )}>
        {note.content}
      </div>

      {!isTiny && (
        <div className={cn(
          "border-t border-slate-200/40 flex items-center justify-between relative z-10 shrink-0 mt-2",
          isSmallHeight ? "pt-2" : "pt-3"
        )}>
          <div className="flex items-center min-w-0 -ml-0.5">
            {note.category && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/50 backdrop-blur-sm text-[9px] font-black text-slate-600 border border-slate-100/50 truncate shadow-sm">
                <Tag size={10} strokeWidth={3} className="shrink-0 text-slate-400" />
                <span className="truncate uppercase tracking-wider">{note.category}</span>
              </div>
            )}
          </div>
          {!isSmallHeight && (
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 shrink-0 ml-2">
              <Clock size={10} />
              <span className="truncate">{new Date(note.updatedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ITEMS_PER_PAGE = 16;

const NotesView = ({ initialNotes, lang, dict }: NotesViewProps) => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [search, setSearch] = useState("");
  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);


  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch('/api/notes');
        if (res.ok) {
          const data = await res.json();
          setNotes(data);
        }
      } catch (err) {
        console.error("Failed to fetch initial notes:", err);
      }
    };
    fetchNotes();
  }, []);

  const sortedNotes = useMemo(() => {
    let result = [...notes];

    // Search filter
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query) ||
        (n.category && n.category.toLowerCase().includes(query))
      );
    }

    // Sort: Pinned first, then latest updatedAt
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, search]);

  const totalPages = Math.ceil(sortedNotes.length / ITEMS_PER_PAGE);

  const displayedNotes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedNotes.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedNotes, currentPage]);

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const generateLayout = () => {
    return displayedNotes.map((n, index) => {
      const w = n.colSpan || 1;
      // Kita pakai skala 4 (dengan rowHeight 50, jadinya 200px)
      const h = (n.rowSpan || 1) * 4;

      return {
        i: n.id,
        x: n.positionX ?? (index % 4), // Biar rapi kalau baru pertama load
        y: n.positionY ?? Math.floor(index / 4) * h,
        w: w,
        h: h,
        minW: 1,
        minH: 2, // Minimal 100px (2 * 50px)
      };
    });
  };

  const onLayoutChange = async (layout: any[]) => {
    let changed = false;
    const newNotes = notes.map(note => {
      const match = layout.find((l: any) => l.i === note.id);
      if (!match) return note;

      // Ubah pembaginya jadi 4 (sesuai perkalian di generateLayout)
      const currentRS = Math.max(1, Math.round(match.h / 4));
      const currentW = Math.min(4, Math.max(1, match.w));

      const scaledH = (note.rowSpan || 1) * 4;

      if (
        match.x !== (note.positionX || 0) ||
        match.y !== (note.positionY || 0) ||
        match.w !== (note.colSpan || 1) ||
        match.h !== scaledH
      ) {
        changed = true;
        return {
          ...note,
          positionX: match.x,
          positionY: match.y,
          colSpan: currentW,
          rowSpan: currentRS
        };
      }
      return note;
    });

    if (!changed) return;
    setNotes(newNotes);

    if (search.trim()) return;

    try {
      await fetch('/api/notes/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // Jangan lupa di backend pastiin nyimpen x, y, w, h-nya bener ya
        body: JSON.stringify({ layouts: layout.map(l => ({ id: l.i, x: l.x, y: l.y, w: l.w, h: l.h })) })
      });
    } catch (err) {
      console.error("Failed to save layout", err);
    }
  };

  const openNewModal = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(lang === 'id' ? 'Hapus catatan ini?' : 'Delete this note?')) return;
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotes(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (note: Note) => {
    const newIsPinned = !note.isPinned;
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, isPinned: newIsPinned } : n));
    try {
      await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: newIsPinned })
      });
    } catch (err) {
      setNotes(prev => prev.map(n => n.id === note.id ? { ...n, isPinned: note.isPinned } : n));
      console.error(err);
    }
  };

  const handleSaveNote = async (data: { id?: string; title: string; content: string; category?: string; isPinned?: boolean }) => {
    const isEdit = !!data.id;
    const url = isEdit ? `/api/notes/${data.id}` : '/api/notes';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error("Failed to save");

    const savedNote = await res.json();
    setNotes(prev => isEdit ? prev.map(n => n.id === savedNote.id ? savedNote : n) : [savedNote, ...prev]);
  };

  const isMobile = currentBreakpoint === 'xs' || currentBreakpoint === 'xxs';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56 lg:w-64 group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-zinc-900 transition-colors" />
            <input
              type="text"
              placeholder={dict.notes.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all font-medium placeholder:text-slate-300 shadow-sm"
            />
          </div>
          <button
            onClick={openNewModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold shadow-md hover:bg-zinc-800 active:scale-95 transition-all w-full sm:w-auto"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>{lang === 'id' ? 'Catatan Baru' : 'Add note'}</span>
          </button>
        </div>
      </div>

      <div className="min-h-[400px] flex flex-col">
        {displayedNotes.length === 0 && !search.trim() ? (
          <div className="py-12 bg-white rounded-xl border border-slate-100 border-dashed flex flex-col items-center justify-center text-center space-y-3 w-full">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-200">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-slate-400 font-medium text-xs mb-0.5">{dict.notes.empty}</p>
              <p className="text-[10px] text-slate-300 font-normal max-w-[200px]">{dict.notes.emptyDesc}</p>
            </div>
            <button
              onClick={openNewModal}
              className="px-5 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold shadow-md active:scale-95 transition-transform"
            >
              {lang === 'id' ? 'Buat Catatan' : 'Create note'}
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1">
              <ResponsiveGridLayout
                className="layout -mx-2"
                // CUKUP PASS KE 'lg' SAJA. RGL bakal otomatis ngitung buat md, sm, dll.
                layouts={{
                  lg: generateLayout(),
                }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
                rowHeight={50} // Naikkin dari 10 ke 50 biar ditarik nggak gampang lari ke bawah
                containerPadding={[12, 12]}
                margin={[12, 12]}
                isDraggable={!search.trim()}
                isResizable={!search.trim()}
                compactType="vertical" // Biar posisinya selalu rapi naik ke atas, ga acak-acakan
                preventCollision={false}
                useCSSTransforms={true} // Bikin drag/drop lebih smooth pake GPU
                onBreakpointChange={setCurrentBreakpoint}
                onLayoutChange={(layout) => onLayoutChange(layout)}
              >
                {displayedNotes.map((note) => (
                  <div key={note.id} className="cursor-pointer group">
                    <NoteCard
                      note={note}
                      h={notes.find(n => n.id === note.id)?.rowSpan ? (note.rowSpan || 1) * 20 : 20}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                      onTogglePin={handleTogglePin}
                      lang={lang}
                    />
                  </div>
                ))}
              </ResponsiveGridLayout>
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-slate-100 bg-white shadow-sm disabled:opacity-30 disabled:cursor-not-allowed hover:border-zinc-300 transition-all active:scale-90"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/50 backdrop-blur-md border border-slate-100 text-[11px] font-black text-slate-500 shadow-sm ring-1 ring-black/5">
                  <span className="text-zinc-900">{currentPage}</span>
                  <span className="opacity-30">/</span>
                  <span>{totalPages}</span>
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-slate-100 bg-white shadow-sm disabled:opacity-30 disabled:cursor-not-allowed hover:border-zinc-300 transition-all active:scale-90"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingNote}
        onSave={handleSaveNote}
        lang={lang}
        dict={dict}
      />
    </div>
  );
};

export default NotesView;
