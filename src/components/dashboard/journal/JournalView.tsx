"use client";

import React, { useState, useMemo } from "react";
import useSWR, { mutate } from "swr";
import { format, startOfDay } from "date-fns";
import {
  History,
  Calendar as CalendarIcon,
  Search,
  BookOpen,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import JournalEditor from "./JournalEditor";
import JournalHeatmap from "./JournalHeatmap";
import JournalArchiveModal from "./JournalArchiveModal";

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface JournalViewProps {
  initialEntries: any[];
  lang: string;
  dict: any;
}

const JournalView = ({ initialEntries, lang, dict }: JournalViewProps) => {
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [searchQuery, setSearchQuery] = useState("");
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  // SWR for all entries (history & heatmap)
  const { data: allEntries = [] } = useSWR("/api/journal", fetcher, {
    fallbackData: initialEntries
  });

  // SWR for current entry
  const { data: currentEntry, isLoading } = useSWR(`/api/journal/${dateStr}`, fetcher);

  const handleSave = async (data: { content: string; mood: string | null }) => {
    try {
      const res = await fetch(`/api/journal/${dateStr}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        // Mutate both to keep UI in sync
        mutate("/api/journal");
        mutate(`/api/journal/${dateStr}`);
      }
    } catch (error) {
      console.error("Save failed", error);
    }
  };

  const filteredHistory = useMemo(() => {
    if (!searchQuery) return allEntries.slice(0, 10);
    return allEntries.filter((e: any) =>
      e.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.mood && e.mood.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [allEntries, searchQuery]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

      {/* Left Column: Editor (Primary) */}
      <div className="lg:col-span-8 flex flex-col min-h-[600px]">
        <JournalEditor
          selectedDate={selectedDate}
          initialData={currentEntry || { content: "", mood: null }}
          onSave={handleSave}
          dict={dict}
        />
      </div>

      {/* Right Column: Sidebar (Stats & History) */}
      <div className="lg:col-span-4 space-y-6">

        {/* Heatmap Card */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-500">
                <TrendingUp size={16} />
              </div>
              <h2 className="text-sm font-black text-zinc-900 leading-none">Stats</h2>
            </div>
            <button
              onClick={() => setIsArchiveModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-100 text-[9px] font-black uppercase text-slate-400 hover:bg-slate-50 transition-all"
            >
              {dict.journal.viewArchive}
            </button>
          </div>

          <JournalHeatmap entries={allEntries} dict={dict} />

          <div className="pt-4 border-t border-slate-50">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Completion</p>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-1000"
                style={{ width: `${Math.min((allEntries.length / 30) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-medium italic">
              {dict.journal.historyDesc.replace("{count}", allEntries.length)}
            </p>
          </div>
        </div>

        {/* History / Timeline Card */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-900 text-white">
                <History size={16} />
              </div>
              <h2 className="text-sm font-black text-zinc-900 leading-none">{dict.journal.history}</h2>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative mb-4 group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-zinc-900 transition-colors" />
            <input
              type="text"
              placeholder="Find in logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-xs font-medium focus:ring-2 focus:ring-zinc-900/5 transition-all"
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((entry: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedDate(startOfDay(new Date(entry.date)))}
                  className={cn(
                    "w-full p-3 rounded-2xl text-left transition-all border group",
                    format(selectedDate, "yyyy-MM-dd") === format(new Date(entry.date), "yyyy-MM-dd")
                      ? "bg-zinc-900 border-zinc-900 shadow-lg shadow-zinc-200"
                      : "bg-slate-50 border-transparent hover:bg-white hover:border-slate-200"
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-wider",
                      format(selectedDate, "yyyy-MM-dd") === format(new Date(entry.date), "yyyy-MM-dd") ? "text-zinc-500" : "text-slate-400"
                    )}>
                      {format(new Date(entry.date), "MMM d, yyyy")}
                    </p>
                    {entry.mood && (
                      <span className="text-xs">{entry.mood === dict.journal.moods.excellent ? '❤️' : entry.mood === dict.journal.moods.great ? '⚡' : '😊'}</span>
                    )}
                  </div>
                  <p className={cn(
                    "text-xs font-medium line-clamp-2 leading-relaxed",
                    format(selectedDate, "yyyy-MM-dd") === format(new Date(entry.date), "yyyy-MM-dd") ? "text-zinc-200" : "text-zinc-600"
                  )}>
                    {entry.content}
                  </p>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-30">
                <BookOpen size={32} />
                <p className="text-xs font-bold">{dict.journal.empty}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsArchiveModalOpen(true)}
            className="w-full mt-4 py-2.5 rounded-xl border border-dashed border-slate-200 text-[10px] font-black uppercase text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-all flex items-center justify-center gap-2"
          >
            {dict.journal.viewArchive} <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Archive Modal */}
      <JournalArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        entries={allEntries}
        onSelectDate={(date) => setSelectedDate(startOfDay(date))}
        lang={lang}
        dict={dict}
      />
    </div>
  );
};

export default JournalView;
