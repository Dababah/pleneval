import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Image from "next/image";
import { Flame, Users, UserPlus, CheckCircle2, User as UserIcon } from "lucide-react";
import ParticlesBackground from "@/components/ParticlesBackground";
import FollowButton from "@/components/dashboard/network/FollowButton";
import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/get-dictionary";
import Link from "next/link";
import FollowStats from "./FollowStats";

export default async function PublicProfilePage(props: {
  params: Promise<{ lang: Locale; username: string }>;
}) {
  const params = await props.params;
  const { lang, username } = params;
  const decodedUsername = decodeURIComponent(username).toLowerCase();

  // Protect internal routes if somehow matched
  if (["login", "register", "dashboard", "api", "network", "goals", "habits", "finance"].includes(decodedUsername)) {
    notFound();
  }

  const dict = await getDictionary(lang);
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { username: decodedUsername },
    include: {
      followers: {
        include: {
          follower: {
            select: { id: true, username: true, name: true, image: true }
          }
        }
      },
      following: {
        include: {
          following: {
            select: { id: true, username: true, name: true, image: true }
          }
        }
      },
      habits: {
        orderBy: { currentStreak: 'desc' },
        take: 3, // Only show top 3 streaks
      }
    }
  });

  if (!user) {
    notFound();
  }

  const isOwnProfile = session?.user?.id === user.id;
  
  let isFollowing = false;
  if (!isOwnProfile && session?.user?.id && user.followers) {
    isFollowing = user.followers.some(f => f.followerId === session!.user!.id);
  }

  return (
    <div className="relative min-h-screen w-full bg-[#fafafa] flex flex-col items-center pt-24 pb-20 px-4 overflow-hidden">
      {/* Background Particles */}
      <ParticlesBackground />

      {/* Back to Dashboard Button */}
      <Link 
        href={`/${lang}/network`} 
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors bg-white/50 backdrop-blur px-4 py-2 rounded-full shadow-sm hover:shadow-md border border-gray-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        {lang === "id" ? "Kembali ke Pencarian" : "Back to Search"}
      </Link>

      <div className="w-full max-w-4xl relative z-10">
        {/* Profile Card */}
        <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 p-6 md:p-10 border border-slate-100">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left">
            
            {/* Avatar container with forced clipping context */}
            <div className="relative">
              <div 
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-blue-600 shrink-0 relative isolate"
                style={{ borderRadius: '50%' }}
              >
                {user.image ? (
                  <img src={user.image!} alt={user.username!} className="w-full h-full object-cover rounded-full absolute inset-0" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white">
                    <UserIcon size={64} strokeWidth={2} />
                  </div>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 pt-2">
              <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight leading-none">@{user.username}</h1>
              <p className="text-slate-500 font-bold text-sm mt-2 mb-4 uppercase tracking-[0.1em]">{user.name}</p>
              <FollowStats 
                followers={user.followers as any} 
                following={user.following as any} 
                lang={lang} 
              />
            </div>

            {/* Actions */}
            <div className="w-full md:w-auto pt-2">
              {isOwnProfile ? (
                <Link
                  href={`/${lang}/settings`}
                  className="w-full md:w-auto px-8 py-3 bg-slate-100 hover:bg-slate-200 text-zinc-900 rounded-2xl font-bold transition-all inline-block text-center shadow-sm"
                >
                  Edit Profile
                </Link>
              ) : session?.user?.id ? (
                  // Import this at the top of the file!
                  <FollowButton 
                    targetUserId={user.id} 
                    initialFollowing={isFollowing} 
                    size="lg" 
                  />
              ) : (
                <Link
                  href={`/${lang}/login`}
                  className="w-full md:w-auto px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-bold transition-all shadow-md inline-flex items-center justify-center gap-2"
                >
                  <UserPlus size={18} /> Login to Follow
                </Link>
              )}
            </div>
          </div>

          <hr className="my-8 border-slate-100" />

          {/* Top Habits / Streaks */}
          <div>
            <h2 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Flame className="text-orange-500" /> Top Active Streaks
            </h2>

            {user.habits.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {user.habits.map((habit) => (
                  <div key={habit.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-lg shrink-0">
                        {habit.icon || "⚡"}
                      </div>
                      <div className="min-w-0">
                         <h3 className="text-sm font-bold text-zinc-900 truncate">{habit.title}</h3>
                         <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5 tracking-wider">
                           {habit.currentStreak > 0 ? 'Active' : 'No streak'}
                         </p>
                      </div>
                    </div>
                    {habit.currentStreak > 0 && (
                      <div className="flex flex-col items-end">
                        <span className="text-xl font-black text-orange-500 leading-none flex items-center gap-1">
                          {habit.currentStreak}
                        </span>
                        <span className="text-[9px] font-bold text-orange-300 uppercase tracking-wider">Days</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
               <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                 <p className="text-slate-400 font-medium">No habits visible</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
