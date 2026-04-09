import ParticlesBackground from "@/components/ParticlesBackground";
import { ShieldCheck } from "lucide-react";
import AuthGraphicSlideshow from "@/components/auth/AuthGraphicSlideshow";
import Image from "next/image";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/get-dictionary";

export default async function AuthLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { children } = props;
  const params = await props.params;
  const lang = params.lang as Locale;
  const dict = await getDictionary(lang);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#fafafa] overflow-hidden py-12 px-6">
      {/* Back to Landing Page Button */}
      <a 
        href={`/${lang}`} 
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors bg-white/50 backdrop-blur px-4 py-2 rounded-full shadow-sm hover:shadow-md border border-gray-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        {lang === "id" ? "Beranda" : "Home"}
      </a>

      {/* Background Particles */}
      <ParticlesBackground />
      
      {/* Centered Auth Card */}
      <div className="relative z-10 w-full max-w-[580px] flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-gray-100 h-auto md:h-[500px]">
        {/* Form Side (Left on Desktop) */}
        <div className="w-full md:w-[290px] flex flex-col items-center justify-center p-4 md:p-5 bg-white">
          <div className="w-full max-w-[250px] space-y-2.5">
            {children}
          </div>
        </div>

        <AuthGraphicSlideshow 
          dict={{
            heroTitle: dict.layout.heroTitle,
            heroDescription: dict.layout.heroDescription
          }} 
        />
      </div>

      {/* Footer Links */}
      <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center gap-6 text-[9px] text-gray-400 font-medium">
        <a href={`/${lang}/terms`} className="hover:text-black transition-colors">{dict.layout.terms}</a>
        <a href={`/${lang}/privacy`} className="hover:text-black transition-colors">{dict.layout.privacy}</a>
      </div>
    </div>
  );
}
