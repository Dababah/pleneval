"use client";

import React, { useState, useEffect } from "react";
import type { Locale } from "@/i18n-config";
import KanbanBoard from "@/components/dashboard/kanban/KanbanBoard";
import { getDictionary } from "@/lib/get-dictionary";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  category?: string | null;
  dueDate?: Date | null;
}

export default function TasksPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const [lang, setLang] = useState<Locale>("id");
  const [dict, setDict] = useState<any>(null);

  useEffect(() => {
    params.then(async (p) => {
      setLang(p.lang);
      const dictionary = await getDictionary(p.lang);
      setDict(dictionary);
    });
  }, [params]);

  if (!dict) return (
     <div className="py-40 flex flex-col items-center justify-center space-y-6">
        <div className="w-12 h-12 rounded-2xl border-4 border-slate-50 border-t-zinc-900 animate-spin shadow-lg" />
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] animate-pulse">Initializing Plen Core...</p>
     </div>
  );

  return (
    <div className="w-full">
      <div className="mb-0 overflow-hidden">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-zinc-900 mb-0.5 leading-none uppercase tracking-tighter">
            {dict.tasks.title}
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{dict.navbar.tasks}</p>
        </div>
      </div>

      <div className="mt-8">
        <KanbanBoard dict={dict} lang={lang} />
      </div>
    </div>
  );
}
