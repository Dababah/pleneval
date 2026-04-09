"use client";

import { useState } from "react";
import Link from "next/link";
import { User as UserIcon, X } from "lucide-react";

type FollowListUser = {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
};

type FollowerRecord = {
  follower: FollowListUser;
};

type FollowingRecord = {
  following: FollowListUser;
};

interface FollowStatsProps {
  followers: FollowerRecord[];
  following: FollowingRecord[];
  lang: string;
}

export default function FollowStats({ followers, following, lang }: FollowStatsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');

  const openModal = (tab: 'followers' | 'following') => {
    setActiveTab(tab);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  return (
    <>
      <div className="flex items-center justify-center md:justify-start gap-6">
        <div 
          className="text-center md:text-left cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => openModal('followers')}
        >
          <p className="text-xl md:text-2xl font-black text-zinc-900 leading-none">{followers.length}</p>
          <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Followers</p>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div 
          className="text-center md:text-left cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => openModal('following')}
        >
          <p className="text-xl md:text-2xl font-black text-zinc-900 leading-none">{following.length}</p>
          <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Following</p>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={closeModal}>
          <div 
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: '70vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 flex-none">
              <div className="flex space-x-6 px-2">
                <button 
                  onClick={() => setActiveTab('followers')}
                  className={`text-sm font-black pb-1 border-b-2 transition-colors ${activeTab === 'followers' ? 'text-zinc-900 border-zinc-900' : 'text-slate-400 border-transparent hover:text-zinc-600'}`}
                >
                  {followers.length} Followers
                </button>
                <button 
                  onClick={() => setActiveTab('following')}
                  className={`text-sm font-black pb-1 border-b-2 transition-colors ${activeTab === 'following' ? 'text-zinc-900 border-zinc-900' : 'text-slate-400 border-transparent hover:text-zinc-600'}`}
                >
                  {following.length} Following
                </button>
              </div>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-zinc-900 bg-slate-50 hover:bg-slate-100 transition-colors rounded-full mb-1">
                <X size={18} />
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto p-2 flex-1">
              {activeTab === 'followers' ? (
                 followers.length === 0 ? (
                   <div className="p-12 pl-14 text-center text-slate-400 font-bold text-sm">No followers yet.</div>
                 ) : (
                   followers.map(({ follower }) => <UserRow key={follower.id} user={follower} lang={lang} onClick={closeModal} />)
                 )
              ) : (
                 following.length === 0 ? (
                   <div className="p-12 pl-14 text-center text-slate-400 font-bold text-sm">Not following anyone yet.</div>
                 ) : (
                   following.map(({ following: fUser }) => <UserRow key={fUser.id} user={fUser} lang={lang} onClick={closeModal} />)
                 )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function UserRow({ user, lang, onClick }: { user: FollowListUser, lang: string, onClick: () => void }) {
  if (!user.username) return null;

  return (
    <Link 
      href={`/${lang}/${user.username}`} 
      onClick={onClick} 
      className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-all mb-1 group"
    >
      <div className="w-12 h-12 rounded-full bg-blue-600 shrink-0 overflow-hidden relative shadow-sm border-2 border-white group-hover:border-slate-100 transition-colors">
        {user.image ? (
          <img src={user.image} alt={user.username} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <UserIcon size={24} className="opacity-80 text-white" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-black text-zinc-900 truncate tracking-tight">@{user.username}</p>
        {user.name && <p className="text-xs text-slate-500 font-bold truncate uppercase tracking-widest">{user.name}</p>}
      </div>
    </Link>
  );
}
