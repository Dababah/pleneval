"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Settings as SettingsIcon,
  ExternalLink,
  Plus,
  CheckCircle2,
  RefreshCcw,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface HubSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
  dict: any;
  isConnected: boolean;
  isSyncing?: boolean;
}

export default function HubSidebar({
  isOpen,
  onClose,
  lang,
  dict,
  isConnected,
  isSyncing = false
}: HubSidebarProps) {
  
  const handleConnect = () => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(
      "/api/auth/google-calendar/link",
      "google-calendar-auth",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes`
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for Mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-900/5 backdrop-blur-sm z-[80] lg:hidden"
          />

          {/* Sidebar container */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-[280px] bg-white border-l border-slate-100 shadow-2xl z-[90] flex flex-col"
          >
            {/* External Floating Close Button (Left Edge, Center) */}
            <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 z-[100]">
              <button
                onClick={onClose}
                className="w-7 h-10 rounded-xl bg-zinc-900 text-white shadow-2xl flex items-center justify-center transition-all hover:scale-110 hover:bg-zinc-800 active:scale-95 group"
              >
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {/* Centering Wrapper */}
              <div className="min-h-full px-6 py-12 flex flex-col items-center justify-center">
                
                {/* Integration Grid */}
                <div className="grid grid-cols-3 gap-6 text-center">
                
                {/* Google Calendar Icon */}
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={isConnected ? undefined : handleConnect}
                    className={cn(
                      "group relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm border",
                      isConnected 
                        ? "bg-white border-slate-100 shadow-emerald-100/20 hover:shadow-emerald-200/40 hover:scale-105" 
                        : "bg-white border-slate-50 hover:border-zinc-200 scale-95"
                    )}
                  >
                    {/* Shadow Glow for Connected */}
                    {isConnected && (
                      <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 animate-pulse blur-xl" />
                    )}

                    <img
                      src="https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png"
                      alt="Google Calendar"
                      className={cn(
                        "w-6 h-6 relative z-10 transition-all duration-700",
                        isConnected ? "grayscale-0 opacity-100 scale-110" : "grayscale opacity-30"
                      )}
                    />

                    {/* Plus Icon Overlay for Disconnected */}
                    {!isConnected && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-zinc-900 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                        <Plus size={10} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                </div>

                {/* Placeholder: GitHub */}
                <div className="flex flex-col items-center gap-3 opacity-20 filter grayscale cursor-not-allowed">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-slate-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-zinc-900" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                    </svg>
                  </div>
                </div>

                {/* Placeholder: Telegram */}
                <div className="flex flex-col items-center gap-3 opacity-20 filter grayscale cursor-not-allowed">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-slate-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#229ED9]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0C5.347 0 0 5.347 0 11.944c0 6.596 5.347 11.944 11.944 11.944 6.596 0 11.944-5.348 11.944-11.944C23.888 5.347 18.54 0 11.944 0zm5.787 8.35c-.172 1.832-.93 6.307-1.316 8.368-.163.873-.485 1.165-.796 1.192-.68.06-1.196-.452-1.855-.884-1.03-.675-1.612-1.096-2.613-1.755-1.157-.763-.407-1.182.253-1.865.172-.178 3.167-2.905 3.226-3.155.007-.031.014-.15-.056-.212-.07-.063-.174-.041-.249-.024-.106.024-1.794 1.14-5.064 3.346-.48.33-.914.49-1.303.48-.429-.01-.1.25-.807.502-1.545.502-2.73 1.116-.807.502-.429 0-.914-.16-1.303-.49z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hub Footer */}
          <div className="p-8 border-t border-slate-50">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px bg-slate-100 flex-1" />
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] text-center whitespace-nowrap">Plen Hub v2</p>
              <div className="h-px bg-slate-100 flex-1" />
            </div>
          </div>
        </motion.aside>
      </>
    )}
  </AnimatePresence>
);
}
