import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/get-dictionary";
import { LEGAL_CONTENT } from "@/lib/constants/legal";

export default async function TermsPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const lang = params.lang;
  const dict = await getDictionary(lang);
  const content = LEGAL_CONTENT[lang as keyof typeof LEGAL_CONTENT].terms;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            href={`/${lang}`} 
            className="flex items-center gap-2 text-sm font-bold hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            {dict.landing.backToHome || "Back to Home"}
          </Link>
          <div className="flex items-center gap-2 font-black tracking-tighter text-xl">
            <Shield className="text-primary" size={24} />
            PLEN
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 uppercase">
            {content.title}
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Last Updated: {content.lastUpdated}
          </p>
          <div className="h-1 w-20 bg-primary rounded-full" />
        </div>

        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          {content.sections.map((section, i) => (
            <section key={i} className="space-y-4">
              <h2 className="text-lg font-black text-zinc-900 uppercase tracking-widest flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 text-[10px] text-zinc-500 font-black">
                  0{i + 1}
                </span>
                {section.title}
              </h2>
              <div className="pl-11">
                <p className="text-slate-600 leading-relaxed font-medium">
                  {section.content}
                </p>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-20 pt-12 border-t text-center space-y-4">
          <p className="text-sm text-slate-400 font-bold">
            PLEN Planning Team
          </p>
          <Link 
            href={`/${lang}/register`} 
            className="inline-flex h-12 px-8 items-center bg-zinc-900 text-white font-bold rounded-full hover:opacity-90 transition-all shadow-xl"
          >
            {dict.landing.getStarted}
          </Link>
        </div>
      </main>
    </div>
  );
}
