import { auth } from "@/auth";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { redirect } from "next/navigation";
import { 
  Calendar as CalendarIcon, 
  ArrowUpRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { getDashboardData } from "@/lib/actions/dashboard";
import TodayFocus from "@/components/dashboard/widgets/TodayFocus";
import QuickHabit from "@/components/dashboard/widgets/QuickHabit";
import FinanceCard from "@/components/dashboard/widgets/FinanceCard";
import GoalSimplified from "@/components/dashboard/widgets/GoalSimplified";

export default async function DashboardPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const lang = params.lang;
  const session = await auth();

  const userId = session?.user?.id;
  if (!session || !userId) {
    redirect(`/${lang}/login`);
  }

  const user = session.user;
  const dict = await getDictionary(lang);
  const data = await getDashboardData(userId);

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{dict.dashboard.widgets.failedLoad}</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in zoom-in duration-700 h-full pb-10">
      {/* Header Section */}
      <div className="mb-10 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-black text-zinc-900 leading-none uppercase tracking-tighter">
              {dict.dashboard.title}
            </h1>
            <Sparkles size={18} className="text-amber-400 fill-amber-400" />
          </div>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-none">
            {dict.dashboard.welcome.replace('{name}', user?.name?.split(' ')[0] || 'User')} • {dict.dashboard.status}
          </p>
        </div>
        
        <div className="text-right hidden md:block">
           <p className="text-[10px] font-black text-zinc-900 leading-none mb-1 uppercase tracking-tight">
             {new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
           </p>
           <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.2em] opacity-50">{lang === 'id' ? 'Sinkronisasi Aktif' : 'Sync Active'}</p>
        </div>
      </div>

      {/* Grid Layout: Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Main Column (8/12) */}
        <div className="lg:col-span-8 space-y-6 lg:space-y-8">
          
          {/* Top Row: Compact Finance Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FinanceCard 
              spent={data.finance.spent} 
              budget={data.finance.budget} 
              dict={dict} 
            />
            {/* Empty space or future small widget */}
          </div>

          {/* Second Row in Main: Today's Focus & Habits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TodayFocus 
              courses={data.courses} 
              tasks={data.tasks} 
              dict={dict} 
            />
            <QuickHabit 
              habits={data.habits} 
              dict={dict} 
            />
          </div>

        </div>

        {/* Sidebar Column (4/12) */}
        <div className="lg:col-span-4 space-y-6 lg:space-y-8">
          
          {/* Upcoming Event Snippet */}
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dict.dashboard.upcoming}</p>
              <CalendarIcon size={16} className="text-slate-200" />
            </div>
            
            <div className="space-y-4">
              {data.events.length === 0 ? (
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{dict.dashboard.noEvents}</p>
              ) : (
                data.events.map((event, idx) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="w-1 bg-zinc-900 rounded-full" />
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-bold text-zinc-900 uppercase tracking-tight">{event.title}</p>
                      <p className="text-[9px] text-slate-400 font-medium tracking-wide">
                        {new Date(event.start).toLocaleDateString(lang, { day: 'numeric', month: 'short' })} • {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link href={`/${lang}/calendar`} className="flex items-center justify-center gap-2 w-full py-3.5 text-center rounded-2xl bg-zinc-50 border border-slate-100 text-zinc-900 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-900 hover:text-white transition-all shadow-sm">
              {dict.dashboard.calendarBtn} <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* Goals Progress Widget */}
          <GoalSimplified 
            goals={data.goals} 
            lang={lang} 
            dict={dict}
          />

        </div>

      </div>
    </div>
  );
}
