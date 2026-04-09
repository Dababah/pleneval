import Link from "next/link";
import { ArrowLeft, Heart, GraduationCap, Clock, Sparkles } from "lucide-react";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/get-dictionary";

export default async function AboutPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const lang = params.lang;
  const dict = await getDictionary(lang);
  const about = dict.about;

  return (
    <div className="min-h-screen bg-background selection:bg-rose-100 selection:text-rose-900">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(255,182,193,0.1),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(0,102,255,0.05),transparent_50%)]" />

      {/* Navigation */}
      <nav className="border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            href={`/${lang}`} 
            className="flex items-center gap-2 text-sm font-bold hover:text-rose-500 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            {dict.landing.backToHome || "Back to Home"}
          </Link>
          <div className="flex items-center gap-2 font-black tracking-tighter text-xl text-zinc-900">
            <Sparkles className="text-rose-500 fill-rose-500" size={24} />
            PLEN
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="space-y-6 mb-20 text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-100">
            <Heart size={12} fill="currentColor" /> {about.title}
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 leading-[0.9]">
            {about.subtitle}
          </h1>
          <div className="h-1.5 w-24 bg-rose-500 rounded-full mx-auto" />
        </div>

        {/* Story Section */}
        <div className="grid gap-12 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
          <section className="bg-white/80 border border-slate-100 rounded-[3rem] p-10 md:p-16 shadow-xl shadow-rose-100/20 backdrop-blur-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <GraduationCap size={120} />
             </div>
             
             <div className="relative space-y-8">
                <h2 className="text-2xl md:text-3xl font-black text-rose-500 uppercase tracking-tighter leading-none italic">
                   "{about.story.title}"
                </h2>
                
                <div className="space-y-6 text-lg text-slate-600 font-medium leading-relaxed">
                   <p>{about.story.p1}</p>
                   <div className="flex items-center gap-4 py-4">
                      <div className="h-[2px] flex-1 bg-gradient-to-r from-rose-500/50 to-transparent" />
                      <Clock className="text-rose-400 animate-pulse" />
                      <div className="h-[2px] flex-1 bg-gradient-to-l from-rose-500/50 to-transparent" />
                   </div>
                   <p>{about.story.p2}</p>
                   <p className="border-l-4 border-rose-500 pl-6 italic text-rose-900/70">
                      {about.story.p3}
                   </p>
                </div>
             </div>
          </section>

          {/* Mission Cards */}
          <div className="grid md:grid-cols-2 gap-8">
             <div className="p-10 rounded-[2.5rem] bg-zinc-900 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                <h3 className="text-xl font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Sparkles size={20} className="text-rose-500" />
                   {about.mission}
                </h3>
                <p className="text-zinc-400 text-sm font-bold leading-relaxed">
                   {about.missionText}
                </p>
             </div>

             <Link 
                href={`/${lang}/register`}
                className="p-10 rounded-[2.5rem] bg-rose-500 text-white shadow-2xl group transition-all hover:scale-[1.02] flex flex-col justify-between"
             >
                <h3 className="text-xl font-black uppercase tracking-widest mb-4">
                   Lets Build Together
                </h3>
                <div className="flex items-center justify-between">
                   <span className="text-3xl font-black uppercase tracking-tighter">Gas Keun!</span>
                   <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-2 transition-transform">
                      <ArrowLeft size={24} className="rotate-180" />
                   </div>
                </div>
             </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-20 text-center opacity-40 text-[10px] font-black uppercase tracking-[0.3em]">
           Designed with Love & Caffeine in a Dorm Room.
        </div>
      </main>
    </div>
  );
}
