"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { UserCircle, LogOut, LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";

interface NavbarProps {
  lang: string;
  dict: any;
}

const Navbar = ({ lang, dict }: NavbarProps) => {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Hide navbar on auth and dashboard/profile pages
  const isAuthPage = 
    pathname === `/${lang}/login` || 
    pathname === `/${lang}/register` ||
    pathname?.startsWith(`/${lang}/dashboard`) ||
    pathname?.startsWith(`/${lang}/profile`);
  
  if (isAuthPage) {
    return null;
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-[0_25px_50px_-12px_rgba(185,5,56,0.08)]">
      <div className="container mx-auto px-8 h-16 flex items-center justify-between font-jakarta font-medium">
        <Link href={`/${lang}`} className="text-2xl font-black tracking-tighter text-zinc-900 hover:scale-105 transition-transform duration-200">
          PLEN
        </Link>
        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-6">
              <Link 
                href={`/${lang}/dashboard`} 
                className="flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-primary transition-all duration-200 hover:scale-105"
              >
                <LayoutDashboard size={18} />
                <span className="hidden sm:inline">{dict.navbar.dashboard}</span>
              </Link>
              <button 
                onClick={() => signOut({ callbackUrl: `/${lang}` })}
                className="flex items-center gap-2 text-sm font-bold text-error hover:scale-105 transition-all duration-200"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">{dict.navbar.logout}</span>
              </button>
              <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden border border-outline-variant shadow-sm hover:scale-110 transition-transform">
                {session.user?.image ? (
                  <img src={session.user.image} alt={session.user.name || "Avatar"} className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={22} className="text-on-surface-variant" />
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href={`/${lang}/login`} className="px-6 py-2 text-sm font-bold text-zinc-600 hover:text-primary transition-all duration-200 hover:scale-105">
                {dict.navbar.login}
              </Link>
              <Link href={`/${lang}/register`} className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold text-sm scale-95 active:scale-90 transition-all duration-200 shadow-[0_10px_20px_-5px_rgba(185,5,56,0.2)] hover:scale-105">
                {dict.navbar.register}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
