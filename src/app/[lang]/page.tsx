import Link from "next/link";
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Globe, 
  Sparkles, 
  ArrowUpRight, 
  Share2, 
  Heart,
  GraduationCap,
  Clock
} from "lucide-react";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/get-dictionary";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";

export default async function LandingPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const lang = params.lang;
  const session = await auth();

  // If user is already logged in, redirect to dashboard
  if (session) {
    redirect(`/${lang}/dashboard`);
  }

  const dict = await getDictionary(lang);

  return (
    <div className="bg-background text-on-background font-jakarta selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen">
      <Navbar lang={lang} dict={dict} />

      <main className="relative overflow-hidden pt-16">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-[120px]"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-secondary-container/30 to-transparent blur-[100px]"></div>
          <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] rounded-full bg-gradient-to-tr from-rose-200/20 to-transparent blur-[80px]"></div>
        </div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-8 pt-32 pb-32 flex flex-col items-start md:items-center text-left md:text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 bg-surface-container-high px-4 py-1.5 rounded-full mb-8 scale-100 animate-pulse transition-transform cursor-default">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{dict.landing.badge}</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-zinc-900 leading-[0.9] mb-8 uppercase italic">
            {dict.landing.heroTitle}
          </h1>
          
          <p className="text-xl md:text-2xl text-secondary max-w-2xl font-medium mb-12 leading-relaxed">
            {dict.landing.heroSubtitle}
          </p>
          
          <div className="flex justify-center w-full sm:w-auto">
            <Link 
              href={`/${lang}/register`}
              className="bg-primary text-on-primary px-10 py-5 rounded-full text-lg font-bold shadow-[0_25px_50px_-12px_rgba(185,5,56,0.15)] transition-all duration-300 hover:scale-105 active:scale-95 group flex items-center justify-center gap-2"
            >
              {dict.landing.getStarted}
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-24 w-full aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl relative group border border-outline-variant/30">
            <img 
              alt="Premium office space" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAv-fQnc9DLnx_PPC7Y24v8LifNGGlncucai_eedF5uGwNQ0PTXxc4Vcgfw5E2twke5XOoUddQ1O6_TJ3nJpMZ7Koj4djlX5MWoYrIE2o6QJWLfVFc68BrtMJeQmtkomPLxKKJFeuhRPpHlMmFxuiTOW7RZlmGC6v3iFzUYdaAnh_s6XKM8WSgIrg7h3FAGc4FIcgVVYlD1SUEu1kKc8kSFEZO8dZ0pHFUrEdVKY6n77FX8N6iJr5yigyzccwClzIAUafSrL9kr"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/20 to-transparent"></div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="max-w-7xl mx-auto px-8 py-32">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-xl animate-in fade-in slide-in-from-left-8 duration-700">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 mb-6 uppercase">
                {dict.landing.featuresTitle.split('.')[0]}. <br/><span className="text-primary">{dict.landing.featuresTitle.split('.')[1] || "Perfection."}</span>
              </h2>
              <p className="text-lg text-secondary leading-relaxed font-medium">
                {dict.landing.featuresSubtitle}
              </p>
            </div>
            <div className="hidden md:block">
              <span className="text-primary font-black text-6xl opacity-10">01 / 03</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {dict.landing.features.map((feature: any, i: number) => (
              <div 
                key={i} 
                className="bg-white/40 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white/50 flex flex-col gap-8 transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_40px_80px_-20px_rgba(185,5,56,0.1)] group"
              >
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 ${i === 0 ? 'bg-primary-fixed' : i === 1 ? 'bg-secondary-fixed' : 'bg-tertiary-fixed-dim'}`}>
                  {i === 0 ? <Sparkles size={30} className="text-primary" /> : i === 1 ? <Shield size={30} className="text-secondary" /> : <Zap size={30} className="text-tertiary" />}
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-zinc-900 mb-4 uppercase italic">{feature.title}</h3>
                  <p className="text-secondary leading-relaxed font-medium">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Integrated About Us Section (NEW) */}
        <section className="max-w-7xl mx-auto px-8 py-32 overflow-hidden">
          <div className="bg-surface-container-low rounded-[4rem] p-10 md:p-20 relative overflow-hidden border border-outline-variant/20 shadow-xl">
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <GraduationCap size={300} />
             </div>
             
             <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
                <div className="space-y-8 animate-in fade-in slide-in-from-left-10 duration-1000">
                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-[.3em]">
                      <Heart size={12} fill="currentColor" /> {dict.about.title}
                   </div>
                   <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-zinc-900 leading-none">
                      {dict.about.story.title}
                   </h2>
                   <div className="h-1.5 w-20 bg-primary rounded-full" />
                   <p className="text-xl text-slate-600 font-medium leading-relaxed italic">
                      "{dict.about.story.p2}"
                   </p>
                </div>
                
                <div className="space-y-6 text-lg text-slate-500 font-medium leading-relaxed animate-in fade-in slide-in-from-right-10 duration-1000 delay-200">
                   <p>{dict.about.story.p1}</p>
                   <div className="flex items-center gap-4 py-8">
                      <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                      <Clock className="text-primary/40" size={24} />
                      <div className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent" />
                   </div>
                   <p className="border-l-4 border-primary pl-6 font-bold text-zinc-800">
                      {dict.about.story.p3}
                   </p>
                   <div className="pt-8">
                      <Link href={`/${lang}/about`} className="text-primary font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:gap-4 transition-all group">
                         {dict.footer.about} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* Signature Bento Layout */}
        <section className="max-w-7xl mx-auto px-8 py-32">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-auto md:h-[600px]">
            <div className="md:col-span-7 bg-zinc-900 rounded-[3.5rem] p-12 relative overflow-hidden flex flex-col justify-end group border border-zinc-800">
              <img 
                alt="Abstract Art" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRveCXoOoD9volBDLUsVEWGL3xt28ZesJQ1wDs2Ud7k5eDgpHvX8VOJ3bZu5oYxvR6veTFW3aCBRMobX4zbWQ_Ertb45gOIjUvGxzt5mvb3S4PelAYR4duqvxrVrBOg6y2Sa964SjIg9S7VNlLcHK9AoQNJ-8tTu4jwTR6GlKutRboCu3fevIHG8pKxSumJyK0JBvV7SjcvDAnG9smcM7H1hJplVk19Chet4Fe47F_-5orYo3eAGXy1lwsfKE0Kcef5i4Hyw6D" 
              />
              <div className="relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <h4 className="text-4xl font-black text-white tracking-tighter mb-4 uppercase italic">{dict.landing.bento.title}</h4>
                <p className="text-zinc-400 max-w-sm font-medium">{dict.landing.bento.desc}</p>
              </div>
            </div>
            
            <div className="md:col-span-5 flex flex-col gap-8">
              <div className="flex-1 bg-surface-container-high rounded-[3.5rem] p-12 flex flex-col justify-center border border-outline-variant/30 transition-all hover:bg-surface-container-highest duration-300">
                <h4 className="text-2xl font-black tracking-tight text-zinc-900 mb-4 uppercase">{dict.landing.bento.editorial}</h4>
                <p className="text-secondary font-medium">{dict.landing.bento.editorialDesc}</p>
              </div>
              <Link 
                href={`/${lang}/register`}
                className="flex-1 bg-primary p-12 rounded-[3.5rem] flex flex-col justify-between group cursor-pointer shadow-[0_25px_50px_-12px_rgba(185,5,56,0.2)] hover:scale-[1.02] transition-all duration-300"
              >
                <ArrowUpRight size={48} className="text-on-primary self-end transition-transform group-hover:rotate-45 group-hover:-translate-y-1 group-hover:translate-x-1" />
                <h4 className="text-3xl font-black text-on-primary tracking-tighter uppercase italic">{dict.landing.bento.waitlist}</h4>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-8 py-32 text-center">
          <div className="bg-zinc-950 rounded-[4rem] p-16 md:p-32 relative overflow-hidden border border-zinc-800 shadow-3xl">
            <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-rose-900/20 to-transparent blur-3xl"></div>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-12 relative z-10 leading-[0.9] uppercase italic">
              {dict.landing.ctaTitle.split(' ').slice(0, 2).join(' ')} <br/>
              <span className="text-primary-container">{dict.landing.ctaTitle.split(' ').slice(2).join(' ')}</span>
            </h2>
            <Link 
              href={`/${lang}/register`}
              className="bg-white text-zinc-950 px-12 py-6 rounded-full text-xl font-black uppercase tracking-widest transition-all duration-300 hover:scale-110 active:scale-95 relative z-10 shadow-2xl"
            >
              {dict.landing.ctaButton}
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-20 bg-zinc-50 font-jakarta text-sm tracking-wide border-t border-outline-variant/20">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="text-3xl font-black tracking-tighter text-zinc-900">PLEN</div>
            <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px]">© 2026 PLEN. {dict.footer.copyright.split('.')[1] || "Kinetic Curation."}</p>
          </div>
          
          <div className="flex items-center gap-12 text-[10px] font-black uppercase tracking-widest">
            <Link className="text-zinc-500 hover:text-primary transition-colors" href={`/${lang}/privacy`}>{dict.footer.privacy}</Link>
            <Link className="text-zinc-500 hover:text-primary transition-colors" href={`/${lang}/terms`}>{dict.footer.terms}</Link>
            <Link className="text-zinc-500 hover:text-primary transition-colors" href={`/${lang}/about`}>{dict.footer.about}</Link>
          </div>
          
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center opacity-80 hover:opacity-100 cursor-pointer transition-all hover:scale-110 shadow-sm">
              <Globe className="text-zinc-600" size={20} />
            </div>
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center opacity-80 hover:opacity-100 cursor-pointer transition-all hover:scale-110 shadow-sm">
              <Share2 className="text-zinc-600" size={20} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
