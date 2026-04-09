"use client";

import React, { useState, useEffect } from "react";
import { MoveRight, Loader2, AtSign, User as UserIcon, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { DEFAULT_AVATARS } from "@/lib/constants";

export default function OnboardingModal({ isOpen, dict }: { isOpen: boolean; dict: any }) {
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Handle regeneration of avatars (optional feature)
  const [avatarList, setAvatarList] = useState(DEFAULT_AVATARS);
  
  const regenerateAvatars = () => {
    // Just a quick shuffle for now or generating new ones would be better
    const shuffled = [...DEFAULT_AVATARS].sort(() => Math.random() - 0.5);
    setAvatarList(shuffled);
    if (!shuffled.includes(selectedAvatar)) {
      setSelectedAvatar(shuffled[0]);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation basic
    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      setError("Only lowercase letters, numbers, and underscores allowed");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username,
          image: selectedAvatar
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to set username");
      } else {
        // Success
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-zinc-950/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <AtSign size={80} />
        </div>
        
        <div className="relative z-10">
          <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-zinc-900/20">
            <AtSign size={20} strokeWidth={2.5}/>
          </div>
          
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">
            Claim your username
          </h2>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            Welcome to PLEN! Before you start tracking, define your unique identity to connect with friends.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider ml-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-semibold">
                  @
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="davin_123"
                  className={cn(
                    "w-full pl-9 pr-4 py-3 bg-slate-50 border rounded-xl text-sm font-semibold transition-all outline-none focus:ring-4 placeholder:font-medium placeholder:text-slate-300",
                    error 
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 text-red-900" 
                      : "border-slate-200 focus:border-zinc-900 focus:ring-zinc-900/10 text-zinc-900"
                  )}
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-xs font-semibold text-red-500 ml-1 mt-1 animate-in slide-in-from-top-1">{error}</p>
              )}
            </div>

            {/* Avatar Selection */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Choose Avatar</label>
                <button 
                  type="button" 
                  onClick={regenerateAvatars}
                  className="text-[10px] font-bold text-slate-400 hover:text-zinc-900 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw size={10} /> Randomize
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                {avatarList.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(url)}
                    className={cn(
                      "relative aspect-square rounded-xl border-2 transition-all overflow-hidden bg-slate-50 hover:scale-105 active:scale-95",
                      selectedAvatar === url 
                        ? "border-zinc-900 ring-4 ring-zinc-900/10 shadow-lg" 
                        : "border-transparent hover:border-slate-200"
                    )}
                  >
                    <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                    {selectedAvatar === url && (
                      <div className="absolute inset-0 bg-zinc-900/5 flex items-center justify-center">
                        <div className="bg-zinc-900 text-white p-0.5 rounded-full ring-2 ring-white">
                          <AtSign size={10} />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !username}
              className="w-full h-12 mt-4 bg-zinc-900 hover:bg-zinc-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Continue <MoveRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
