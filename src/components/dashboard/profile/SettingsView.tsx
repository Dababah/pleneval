"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "next/navigation";
import { 
  Bot, 
  MessageSquare, 
  Shield, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Link2,
  Terminal,
  Settings as SettingsIcon,
  Bell,
  Cpu,
  Globe,
  Info,
  ArrowLeft,
  ArrowRight,
  Languages,
  Loader2,
  XCircle,
  Github,
  Mail,
  User as UserIcon,
  Heart,
  QrCode
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import AvatarPicker from "./AvatarPicker";
import { User } from "next-auth";

type SettingsTab = 'menu' | 'ai' | 'telegram' | 'language' | 'connections' | 'profile' | 'support';

interface UserSettings {
  aiProvider: string;
  aiModel: string;
  aiApiKey: string;
  telegramBotToken: string;
  telegramChatId: string;
  notifMorningSummary: boolean;
  notifStockDropPct: number;
  notifStockRisePct: number;
  notifDebtReminderDays: number;
  notifBudgetThresholdPct: number;
  notifSavingReminder: boolean;
  notifTelegramAiChat: boolean;
  customAiEndpoint: string;
  customAiHeaderName: string;
  customAiHeaderPrefix: string;
  customAiBodyTemplate: string;
}

export default function SettingsView({ lang, dict, user }: { lang: string, dict: any, user: User }) {
  const router = useRouter();
  const pathname = usePathname();
  const { update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState<SettingsTab>('menu');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showBotToken, setShowBotToken] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    aiProvider: 'openai',
    aiModel: 'gpt-4o',
    aiApiKey: '',
    telegramBotToken: '',
    telegramChatId: '',
    notifMorningSummary: false,
    notifStockDropPct: 5,
    notifStockRisePct: 10,
    notifDebtReminderDays: 3,
    notifBudgetThresholdPct: 80,
    notifSavingReminder: false,
    notifTelegramAiChat: false,
    customAiEndpoint: '',
    customAiHeaderName: 'Authorization',
    customAiHeaderPrefix: 'Bearer',
    customAiBodyTemplate: '{"model": "{model}", "messages": {prompt}}'
  });

  // Test Connection States
  const [testStatus, setTestStatus] = useState<{
    show: boolean;
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ show: false, loading: false });

  // Profile Edit State
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    username: (user as any)?.username || "",
    image: user?.image || ""
  });

  const [accounts, setAccounts] = useState<any[]>([]);
  const [fetchingProviders, setFetchingProviders] = useState(false);

  const [openRouterModels, setOpenRouterModels] = useState<any[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ 
    name: user?.name || "", 
    email: user?.email || "", 
    message: "",
    images: [] as File[]
  });
  const [contactSending, setContactSending] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  const providers = [
    { id: 'openai', label: 'OpenAI' },
    { id: 'anthropic', label: 'Anthropic' },
    { id: 'google', label: 'Google Gemini' },
    { id: 'mistral', label: 'Mistral' },
    { id: 'cohere', label: 'Cohere' },
    { id: 'groq', label: 'Groq' },
    { id: 'together', label: 'Together AI' },
    { id: 'openrouter', label: 'OpenRouter' },
    { id: 'custom', label: 'Custom (HTTP Request)' }
  ];

  const getModelsByProvider = () => {
    switch (settings.aiProvider) {
      case 'openai':
        return ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
      case 'anthropic':
        return ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'];
      case 'google':
        return ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];
      case 'groq':
        return ['llama-3.3-70b', 'llama-3.1-8b', 'mixtral-8x7b'];
      case 'mistral':
        return ['mistral-large', 'mistral-medium', 'mistral-small'];
      case 'openrouter':
        return openRouterModels.length > 0 
          ? openRouterModels.map(m => m.id) 
          : ['google/gemini-2.0-flash-exp:free', 'openai/gpt-3.5-turbo', 'anthropic/claude-3-haiku'];
      default:
        return [];
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOpenRouterModels = async () => {
    setFetchingModels(true);
    try {
      const res = await fetch('https://openrouter.ai/api/v1/models');
      const data = await res.json();
      if (data.data) {
        setOpenRouterModels(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch OpenRouter models:', error);
    } finally {
      setFetchingModels(false);
    }
  };

  const fetchLinkedProviders = async () => {
    setFetchingProviders(true);
    try {
      const res = await fetch('/api/user/accounts');
      const data = await res.json();
      if (data.success) {
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error('Failed to fetch linked providers:', error);
    } finally {
      setFetchingProviders(false);
    }
  };

  const handleUnlink = async (provider: string) => {
     setTestStatus({ show: true, loading: true, message: `Memutuskan tautan ${provider}...` });
     try {
        const res = await fetch('/api/user/accounts/unlink', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ provider }),
        });
        const data = await res.json();
        if (data.success) {
           setTestStatus({
              show: true,
              loading: false,
              success: true,
              message: `Tautan ${provider} berhasil diputuskan.`
           });
           fetchLinkedProviders(); // Refresh list
        } else {
           setTestStatus({
              show: true,
              loading: false,
              success: false,
              message: `Gagal memutuskan tautan: ${data.error}`
           });
        }
     } catch (e) {
        setTestStatus({
           show: true,
           loading: false,
           success: false,
           message: 'Gagal memutuskan tautan. Silakan coba lagi.'
        });
     }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let res;
      if (activeTab === 'profile') {
        res = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData),
        });
      } else {
        res = await fetch('/api/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        });
      }

      const data = await res.json();
      if (res.ok) {
        setTestStatus({
          show: true,
          loading: false,
          success: true,
          message: dict.settings.saveSuccess || dict.settings.profile?.success
        });
        if (activeTab === 'profile') {
           // Refresh session if possible or just show success
           await updateSession({
             name: profileData.name,
             username: profileData.username,
             image: profileData.image
           });
           router.refresh();
        }
        setTimeout(() => setTestStatus(prev => ({ ...prev, show: false })), 2000);
      } else {
        setTestStatus({
          show: true,
          loading: false,
          success: false,
          message: data.error === 'username_taken' ? dict.settings.profile?.usernameTaken : (data.error || dict.settings.saveError)
        });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setTestStatus({
        show: true,
        loading: false,
        success: false,
        message: dict.settings.saveError
      });
    } finally {
      setSaving(false);
    }
  };

  const testAiConnection = async () => {
     if (!settings.aiApiKey) {
        setTestStatus({
          show: true,
          loading: false,
          success: false,
          message: 'API Key tidak boleh kosong!'
        });
        return;
     }

     setTestStatus({ show: true, loading: true, message: 'Mengetest koneksi AI...' });
     try {
       const res = await fetch('/api/ai/chat', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ 
           messages: [{ role: 'user', content: 'Connection test. Reply with "OK".' }],
           test: true,
           apiKey: settings.aiApiKey,
           provider: settings.aiProvider,
           model: settings.aiModel
         }),
       });
       const data = await res.json();
       if (data.success) {
         setTestStatus({
           show: true,
           loading: false,
           success: true,
           message: `${dict.settings.ai.testSuccess} Model: ${settings.aiModel}`
         });
       } else {
         setTestStatus({
           show: true,
           loading: false,
           success: false,
           message: `${dict.settings.ai.testError}: ${data.error}`
         });
       }
     } catch (e) {
       setTestStatus({
         show: true,
         loading: false,
         success: false,
         message: dict.settings.ai.testError
       });
     }
  };

  const testTelegramSend = async () => {
    if (!settings.telegramBotToken) {
       setTestStatus({
         show: true,
         loading: false,
         success: false,
         message: 'Bot Token tidak boleh kosong!'
       });
       return;
    }

    setTestStatus({ show: true, loading: true, message: 'Mengetest kirim pesan Telegram...' });
    try {
       const res = await fetch('/api/telegram/send', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ 
           test: true,
           token: settings.telegramBotToken,
           chatId: settings.telegramChatId
         }),
       });
       const data = await res.json();
       if (data.success) {
         setTestStatus({
           show: true,
           loading: false,
           success: true,
           message: dict.settings.telegram.testSuccess
         });
       } else {
         setTestStatus({
           show: true,
           loading: false,
           success: false,
           message: `${dict.settings.telegram.testError}: ${data.error}`
         });
       }
     } catch (e) {
       setTestStatus({
         show: true,
         loading: false,
         success: false,
         message: dict.settings.telegram.testError
       });
     }
  };

  const changeLanguage = (newLang: string) => {
    if (newLang === lang) return;
    const newPathname = pathname.replace(`/${lang}`, `/${newLang}`);
    router.push(newPathname);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.message) return;
    
    setContactSending(true);
    try {
      const formData = new FormData();
      formData.append("name", contactForm.name);
      formData.append("email", contactForm.email);
      formData.append("message", contactForm.message);
      contactForm.images.forEach(img => {
        formData.append("images", img);
      });

      const res = await fetch('/api/contact', {
        method: 'POST',
        body: formData, // No headers needed for FormData
      });
      if (res.ok) {
        setContactSuccess(true);
        setContactForm(prev => ({ ...prev, message: "", images: [] }));
        setTimeout(() => setContactSuccess(false), 5000);
      } else {
        const data = await res.json();
        setTestStatus({
          show: true,
          loading: false,
          success: false,
          message: data.error || "Failed to send message"
        });
      }
    } catch (error) {
      console.error(error);
      setTestStatus({
        show: true,
        loading: false,
        success: false,
        message: "Connection error"
      });
    } finally {
      setContactSending(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchSettings();
    fetchLinkedProviders();

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data === "google-calendar-success") {
        fetchLinkedProviders();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Auto-select provider's first model if current model is invalid
  useEffect(() => {
    const models = getModelsByProvider();
    if (models.length > 0 && !models.includes(settings.aiModel)) {
      setSettings(prev => ({ ...prev, aiModel: models[0] }));
    }
  }, [settings.aiProvider, openRouterModels]);

  useEffect(() => {
    if (settings.aiProvider === 'openrouter' && openRouterModels.length === 0) {
      fetchOpenRouterModels();
    }
  }, [settings.aiProvider]);

  if (loading) return <div className="p-10 text-center">Loading settings...</div>;


  return (
    <div className="space-y-6 pb-20 relative">
      {/* Loading/Status Popup Overlay using Portal to cover EVERYTHING including Sidebar */}
      {isMounted && testStatus.show && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-zinc-900/10 backdrop-blur-[12px] animate-in fade-in duration-500">
           <div className="bg-white border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.25)] rounded-[2.5rem] p-10 max-w-sm w-full text-center space-y-8 scale-in-center animate-in zoom-in-95 duration-500">
              <div className="flex justify-center relative">
                 {testStatus.loading && (
                    <div className="absolute inset-0 rounded-full bg-zinc-900/5 animate-ping scale-150 opacity-20" />
                 )}
                 {testStatus.loading ? (
                   <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center shadow-2xl shadow-zinc-200 relative z-10">
                      <Loader2 className="text-white animate-spin" size={40} strokeWidth={3} />
                   </div>
                 ) : testStatus.success ? (
                   <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-100 relative z-10">
                      <CheckCircle2 className="text-white" size={40} strokeWidth={3} />
                   </div>
                 ) : (
                   <div className="w-20 h-20 rounded-full bg-rose-500 flex items-center justify-center shadow-2xl shadow-rose-100 relative z-10">
                      <XCircle className="text-white" size={40} strokeWidth={3} />
                   </div>
                 )}
              </div>
              <div className="space-y-3">
                 <h3 className="text-xl font-black text-zinc-900 leading-tight">
                    {testStatus.loading ? 'Processing...' : (testStatus.success ? 'Success!' : 'Failed')}
                 </h3>
                 <p className="text-[13px] font-bold text-slate-400 leading-relaxed px-2">
                    {testStatus.message}
                 </p>
              </div>
              {!testStatus.loading && (
                <button 
                  onClick={() => setTestStatus({ ...testStatus, show: false })}
                  className="w-full bg-zinc-900 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 active:scale-[0.97] transition-all shadow-xl shadow-zinc-100"
                >
                  Confirm
                </button>
              )}
           </div>
        </div>,
        document.body
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {activeTab !== 'menu' && (
            <button 
              onClick={() => setActiveTab('menu')}
              className="p-2 rounded-xl bg-white border border-slate-100 hover:bg-zinc-900 hover:text-white transition-all shadow-sm"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-black text-zinc-900 leading-none mb-1">
              {activeTab === 'menu' ? dict.settings.title : (
                activeTab === 'ai' ? dict.settings.tabs.ai : 
                activeTab === 'telegram' ? dict.settings.tabs.telegram : 
                activeTab === 'connections' ? dict.settings.tabs.connections :
                activeTab === 'profile' ? dict.settings.tabs.profile :
                dict.settings.tabs.language
              )}
            </h1>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-none">
              {activeTab === 'menu' ? dict.settings.subtitle : dict.settings.title}
            </p>
          </div>
        </div>
        {activeTab !== 'menu' && activeTab !== 'profile' && activeTab !== 'support' && (
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-zinc-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {saving ? dict.settings.saving : dict.settings.saveButton}
          </button>
        )}
      </div>

      {activeTab === 'menu' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
           {/* Card Profile */}
           <button 
             onClick={() => setActiveTab('profile')}
             className="group p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-zinc-300 transition-all duration-500 text-left flex items-center justify-between relative overflow-hidden"
           >
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-zinc-50 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg shadow-zinc-200 group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                   {profileData.image ? (
                      <img src={profileData.image} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                      <UserIcon size={24} />
                   )}
                </div>
                <div>
                   <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest leading-none mb-1">{dict.settings.tabs.profile || "Edit Profile"}</h2>
                   <p className="text-[10px] text-slate-400 font-bold leading-none">{dict.settings.profile?.description || "Update your identity"}</p>
                </div>
              </div>
              <div className="relative z-10 flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-zinc-900 transition-colors">
                 <ArrowRight size={14} />
              </div>
           </button>

           {/* Card AI */}
           <button 
             onClick={() => setActiveTab('ai')}
             className="group p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-zinc-300 transition-all duration-500 text-left flex items-center justify-between relative overflow-hidden"
           >
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-zinc-50 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg shadow-zinc-200 group-hover:scale-110 transition-transform duration-500">
                   <Bot size={24} />
                </div>
                <div>
                   <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest leading-none mb-1">{dict.settings.tabs.ai}</h2>
                   <p className="text-[10px] text-slate-400 font-bold leading-none">{dict.settings.ai.description}</p>
                </div>
              </div>
              <div className="relative z-10 flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-zinc-900 transition-colors">
                 <ArrowRight size={14} />
              </div>
           </button>

           {/* Card Telegram */}
           <button 
             onClick={() => setActiveTab('telegram')}
             className="group p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-zinc-300 transition-all duration-500 text-left flex items-center justify-between relative overflow-hidden"
           >
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-zinc-50 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100 group-hover:scale-110 transition-transform duration-500">
                   <MessageSquare size={24} />
                </div>
                <div>
                   <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest leading-none mb-1">{dict.settings.tabs.telegram}</h2>
                   <p className="text-[10px] text-slate-400 font-bold leading-none">{dict.settings.telegram.description}</p>
                </div>
              </div>
              <div className="relative z-10 flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-zinc-900 transition-colors">
                 <ArrowRight size={14} />
              </div>
           </button>

           {/* Card Language */}
           <button 
             onClick={() => setActiveTab('language')}
             className="group p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-zinc-300 transition-all duration-500 text-left flex items-center justify-between relative overflow-hidden"
           >
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-zinc-50 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform duration-500">
                   <Languages size={24} />
                </div>
                <div>
                   <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest leading-none mb-1">{dict.settings.tabs.language}</h2>
                   <p className="text-[10px] text-slate-400 font-bold leading-none">{dict.settings.language.description}</p>
                </div>
              </div>
              <div className="relative z-10 flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-zinc-900 transition-colors">
                 <ArrowRight size={14} />
              </div>
           </button>

           {/* Card Connections */}
           <button 
             onClick={() => setActiveTab('connections')}
             className="group p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-zinc-300 transition-all duration-500 text-left flex items-center justify-between relative overflow-hidden"
           >
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-zinc-50 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg shadow-zinc-200 group-hover:scale-110 transition-transform duration-500">
                   <Link2 size={24} />
                </div>
                <div>
                   <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest leading-none mb-1">{dict.settings.tabs.connections}</h2>
                   <p className="text-[10px] text-slate-400 font-bold leading-none">{dict.settings.connections.description}</p>
                </div>
              </div>
              <div className="relative z-10 flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-zinc-900 transition-colors">
                 <ArrowRight size={14} />
              </div>
           </button>

           {/* Card Support & Contact */}
           <button 
             onClick={() => setActiveTab('support')}
             className="group p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-zinc-300 transition-all duration-500 text-left flex items-center justify-between relative overflow-hidden"
           >
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-zinc-50 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-100 group-hover:scale-110 transition-transform duration-500">
                   <Mail size={24} />
                </div>
                <div>
                   <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest leading-none mb-1">{dict.settings.tabs.support}</h2>
                   <p className="text-[10px] text-slate-400 font-bold leading-none">{dict.settings.support.subtitle}</p>
                </div>
              </div>
              <div className="relative z-10 flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-zinc-900 transition-colors">
                 <ArrowRight size={14} />
              </div>
           </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
           {/* Chromium Autofill Killer Dummy Inputs */}
            <div className="hidden" aria-hidden="true">
               <input type="text" name="fake-user-name" tabIndex={-1} autoComplete="off" />
               <input type="password" name="fake-password" tabIndex={-1} autoComplete="new-password" />
            </div>

            {activeTab === 'profile' && (
               <div className="space-y-10 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="space-y-1">
                     <div className="flex items-center gap-2 text-zinc-900">
                        <UserIcon size={18} />
                        <h2 className="text-sm font-black uppercase tracking-widest">{dict.settings.profile.title}</h2>
                     </div>
                     <p className="text-[11px] text-slate-400 font-bold">{dict.settings.profile.description}</p>
                  </div>

                  <div className="grid gap-10">
                     {/* Avatar Picker Section */}
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest px-1">{dict.settings.profile.avatar}</label>
                        <div className="bg-zinc-50 rounded-3xl p-6 border border-slate-100">
                           <AvatarPicker 
                              lang={lang}
                              currentImage={profileData.image} 
                              onSelect={(img) => setProfileData({...profileData, image: img})} 
                           />
                        </div>
                     </div>

                     {/* Profile Fields */}
                     <div className="grid gap-6">
                        <div className="grid gap-2">
                           <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest px-1">{dict.settings.profile.name}</label>
                           <input 
                              type="text"
                              className="w-full bg-zinc-50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                              value={profileData.name}
                              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                              placeholder="Your full name"
                           />
                        </div>

                        <div className="grid gap-2">
                           <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest px-1">{dict.settings.profile.username}</label>
                           <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">@</span>
                              <input 
                                 type="text"
                                 className="w-full bg-zinc-50 border border-slate-100 rounded-xl pl-8 pr-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                                 value={profileData.username}
                                 onChange={(e) => setProfileData({...profileData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                                 placeholder="username"
                              />
                           </div>
                           <p className="text-[9px] text-slate-400 font-bold px-1 uppercase tracking-tight">Used for your public profile URL: {window.location.origin}/{profileData.username || 'username'}</p>
                        </div>
                     </div>

                     <div className="pt-4 border-t border-slate-100">
                        <button 
                           onClick={handleSave}
                           disabled={saving}
                           className="w-full bg-zinc-900 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 active:scale-[0.97] transition-all shadow-xl shadow-zinc-200 flex items-center justify-center gap-3"
                        >
                           {saving ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                           {dict.settings.profile.updateBtn}
                        </button>
                     </div>
                  </div>
               </div>
            )}

           {activeTab === 'ai' && (
             <div className="space-y-8 max-w-2xl">
               <div className="space-y-1">
                 <div className="flex items-center gap-2 text-zinc-900">
                    <Cpu size={18} />
                    <h2 className="text-sm font-black uppercase tracking-widest">{dict.settings.ai.title}</h2>
                 </div>
                 <p className="text-[11px] text-slate-400 font-bold">{dict.settings.ai.description}</p>
               </div>
   
               <div className="grid gap-6">
                 <div className="grid gap-2">
                   <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">AI Provider</label>
                   <select 
                     className="bg-zinc-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                     value={settings.aiProvider}
                     onChange={(e) => setSettings({...settings, aiProvider: e.target.value})}
                   >
                     {providers.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                   </select>
                 </div>
   
                 {(settings.aiProvider !== 'custom') && (
                   <div className="grid gap-2">
                     <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">
                       {dict.settings.ai.model} {fetchingModels && <span className="animate-pulse text-emerald-500 ml-2">Fetching models...</span>}
                     </label>
                     <select 
                       className="bg-zinc-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                       value={settings.aiModel}
                       onChange={(e) => setSettings({...settings, aiModel: e.target.value})}
                     >
                       {getModelsByProvider().map(m => (
                         <option key={m} value={m}>{m}</option>
                       ))}
                     </select>
                   </div>
                 )}
   
                 <div className="grid gap-2">
                   <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">{dict.settings.ai.apiKey}</label>
                   <div className="relative">
                     <input 
                       type={showApiKey ? "text" : "password"}
                       className="w-full bg-zinc-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all pr-12"
                       placeholder="sk-..."
                       autoComplete="new-password"
                       name="x-ai-provider-token"
                       id="x-ai-provider-token"
                       data-lpignore="true"
                       value={settings.aiApiKey}
                       onChange={(e) => setSettings({...settings, aiApiKey: e.target.value})}
                       onFocus={(e) => e.target.removeAttribute('readonly')}
                       readOnly
                     />
                     <button 
                       onClick={() => setShowApiKey(!showApiKey)}
                       className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-zinc-900 transition-colors"
                     >
                       {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                     </button>
                   </div>
                   <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">* Browser autofill disabled for safety.</p>
                 </div>
   
                 {settings.aiProvider === 'custom' && (
                   <div className="p-4 bg-zinc-50 rounded-xl border border-dashed border-slate-200 space-y-4">
                      <div className="grid gap-2">
                         <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">{dict.settings.ai.customEndpoint}</label>
                         <input 
                           className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-xs"
                           value={settings.customAiEndpoint}
                           onChange={(e) => setSettings({...settings, customAiEndpoint: e.target.value})}
                           autoComplete="nope"
                         />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="grid gap-2">
                           <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Header Name</label>
                           <input 
                             className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-xs"
                             value={settings.customAiHeaderName}
                             onChange={(e) => setSettings({...settings, customAiHeaderName: e.target.value})}
                             autoComplete="nope"
                           />
                         </div>
                         <div className="grid gap-2">
                           <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Prefix (e.g Bearer)</label>
                           <input 
                             className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-xs"
                             value={settings.customAiHeaderPrefix}
                             onChange={(e) => setSettings({...settings, customAiHeaderPrefix: e.target.value})}
                             autoComplete="nope"
                           />
                         </div>
                      </div>
                      <div className="grid gap-2">
                         <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">JSON Body Template ({'{prompt}'})</label>
                         <textarea 
                           className="bg-white border border-slate-100 rounded-lg px-3 py-2 text-xs h-20 font-mono"
                           value={settings.customAiBodyTemplate}
                           onChange={(e) => setSettings({...settings, customAiBodyTemplate: e.target.value})}
                           autoComplete="nope"
                         />
                      </div>
                   </div>
                 )}
   
                 <button 
                   onClick={testAiConnection}
                   className="flex items-center justify-center gap-2 border border-zinc-200 text-zinc-900 py-3 rounded-xl text-xs font-black transition-all hover:bg-zinc-50 active:scale-[0.98]"
                 >
                   <Terminal size={14} /> {dict.settings?.ai?.testButton || "Test Koneksi AI"}
                 </button>
               </div>
             </div>
           )}
   
           {activeTab === 'telegram' && (
             <div className="space-y-10">
               <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-zinc-900">
                         <MessageSquare size={18} />
                         <h2 className="text-sm font-black uppercase tracking-widest">{dict.settings.telegram.title}</h2>
                       </div>
                       <p className="text-[11px] text-slate-400 font-bold leading-relaxed">{dict.settings.telegram.description}</p>
                    </div>
   
                    <div className="bg-zinc-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                       <h3 className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">{dict.settings.telegram.guide.title}</h3>
                       <div className="space-y-3">
                          <div className="flex gap-3">
                             <div className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[9px] font-black shrink-0">1</div>
                             <p className="text-[11px] font-semibold text-zinc-700">{dict.settings.telegram.guide.step1}</p>
                          </div>
                          <div className="flex gap-3">
                             <div className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[9px] font-black shrink-0">2</div>
                             <p className="text-[11px] font-semibold text-zinc-700">{dict.settings.telegram.guide.step2}</p>
                          </div>
                          <div className="flex gap-3">
                             <div className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[9px] font-black shrink-0">3</div>
                             <p className="text-[11px] font-semibold text-zinc-700">{dict.settings.telegram.guide.step3}</p>
                          </div>
                       </div>
                    </div>
   
                    <div className="grid gap-6">
                       <div className="grid gap-2">
                         <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">{dict.settings.telegram.botToken}</label>
                         <div className="relative">
                           <input 
                             type={showBotToken ? "text" : "password"}
                             className="w-full bg-zinc-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all pr-12"
                             placeholder="000000:AAABBB..."
                             autoComplete="new-password"
                             name="x-telegram-comm-id"
                             id="x-telegram-comm-id"
                             data-lpignore="true"
                             value={settings.telegramBotToken}
                             onChange={(e) => setSettings({...settings, telegramBotToken: e.target.value})}
                             onFocus={(e) => e.target.removeAttribute('readonly')}
                             readOnly
                           />
                           <button 
                             onClick={() => setShowBotToken(!showBotToken)}
                             className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-zinc-900 transition-colors"
                           >
                             {showBotToken ? <EyeOff size={16} /> : <Eye size={16} />}
                           </button>
                         </div>
                       </div>
                       <div className="grid gap-2">
                          <label className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">{dict.settings.telegram.chatId}</label>
                          <input 
                           type="text"
                           className="w-full bg-zinc-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                           placeholder="12345678"
                           autoComplete="nope"
                           value={settings.telegramChatId}
                           onChange={(e) => setSettings({...settings, telegramChatId: e.target.value})}
                         />
                       </div>
                       <button 
                         onClick={testTelegramSend}
                         className="flex items-center justify-center gap-2 border border-zinc-200 text-zinc-900 py-3 rounded-xl text-xs font-black transition-all hover:bg-zinc-50 active:scale-[0.98]"
                       >
                         <MessageSquare size={14} /> {dict.settings.telegram.testButton}
                       </button>
                    </div>
                  </div>
   
                  <div className="space-y-6">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-zinc-900">
                         <Bell size={18} />
                         <h2 className="text-sm font-black uppercase tracking-widest">{dict.settings.telegram.notifications.title}</h2>
                       </div>
                       <p className="text-[11px] text-slate-400 font-bold leading-relaxed">{dict.settings.telegram.notifications.desc}</p>
                    </div>
   
                    <div className="space-y-3">
                       <div className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-slate-100">
                          <div className="space-y-0.5">
                             <p className="text-[11px] font-black text-zinc-900 uppercase tracking-tight">{dict.settings.telegram.notifications.morning}</p>
                             <p className="text-[9px] text-slate-400 font-bold">{dict.settings.telegram.notifications.morningDesc}</p>
                          </div>
                          <input 
                           type="checkbox" 
                           className="toggle accent-zinc-900 w-4 h-4" 
                           checked={settings.notifMorningSummary}
                           onChange={(e) => setSettings({...settings, notifMorningSummary: e.target.checked})}
                         />
                       </div>
   
                       <div className="p-3 rounded-xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-slate-100 space-y-3">
                          <div className="flex items-center justify-between">
                             <div className="space-y-0.5">
                                 <p className="text-[11px] font-black text-zinc-900 uppercase tracking-tight">{dict.settings.telegram.notifications.stockRise}</p>
                                 <p className="text-[9px] text-slate-400 font-bold">{dict.settings.telegram.notifications.stockRiseDesc}</p>
                             </div>
                             <Globe size={14} className="text-slate-300" />
                          </div>
                          <div className="grid grid-cols-2 gap-3 pl-4">
                             <div className="grid gap-1">
                                <label className="text-[8px] font-black text-zinc-400 uppercase">Naik &gt; %</label>
                                <input 
                                 type="number"
                                 className="bg-white border border-slate-100 rounded px-2 py-1 text-[10px]"
                                 value={settings.notifStockRisePct}
                                 onChange={(e) => setSettings({...settings, notifStockRisePct: parseFloat(e.target.value)})}
                                />
                             </div>
                             <div className="grid gap-1">
                                <label className="text-[8px] font-black text-zinc-400 uppercase">Turun &gt; %</label>
                                <input 
                                 type="number"
                                 className="bg-white border border-slate-100 rounded px-2 py-1 text-[10px]"
                                 value={settings.notifStockDropPct}
                                 onChange={(e) => setSettings({...settings, notifStockDropPct: parseFloat(e.target.value)})}
                                />
                             </div>
                          </div>
                       </div>
   
                       <div className="p-3 rounded-xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-slate-100 flex items-center justify-between">
                          <div className="space-y-0.5">
                             <p className="text-[11px] font-black text-zinc-900 uppercase tracking-tight">{dict.settings.telegram.notifications.debt}</p>
                             <p className="text-[9px] text-slate-400 font-bold">{dict.settings.telegram.notifications.debtDesc}</p>
                          </div>
                          <div className="flex items-center gap-2">
                             <input 
                               type="number"
                               className="bg-white border border-slate-100 rounded px-2 py-1 text-[10px] w-12 text-center"
                               value={settings.notifDebtReminderDays}
                               onChange={(e) => setSettings({...settings, notifDebtReminderDays: parseInt(e.target.value)})}
                             />
                             <span className="text-[9px] font-bold text-zinc-400">{dict.settings.days}</span>
                          </div>
                       </div>
   
                       <div className="p-3 rounded-xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-slate-100 flex items-center justify-between">
                          <div className="space-y-0.5">
                             <p className="text-[11px] font-black text-zinc-900 uppercase tracking-tight">{dict.settings.telegram.notifications.budget}</p>
                             <p className="text-[9px] text-slate-400 font-bold">{dict.settings.telegram.notifications.budgetDesc}</p>
                          </div>
                          <div className="flex items-center gap-2">
                             <input 
                               type="number"
                               className="bg-white border border-slate-100 rounded px-2 py-1 text-[10px] w-12 text-center"
                               value={settings.notifBudgetThresholdPct}
                               onChange={(e) => setSettings({...settings, notifBudgetThresholdPct: parseInt(e.target.value)})}
                             />
                             <span className="text-[9px] font-bold text-zinc-400">%</span>
                          </div>
                       </div>
   
                       <div className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-slate-100">
                          <div className="space-y-0.5">
                             <p className="text-[11px] font-black text-zinc-900 uppercase tracking-tight">{dict.settings.telegram.notifications.aiChat}</p>
                             <p className="text-[9px] text-slate-400 font-bold">{dict.settings.telegram.notifications.aiChatDesc}</p>
                          </div>
                          <input 
                           type="checkbox" 
                             className="toggle accent-zinc-900 w-4 h-4" 
                           checked={settings.notifTelegramAiChat}
                           onChange={(e) => setSettings({...settings, notifTelegramAiChat: e.target.checked})}
                         />
                       </div>
                    </div>
                 </div>
               </div>
            </div>
           )}

           {activeTab === 'language' && (
              <div className="space-y-8 max-w-2xl">
                <div className="space-y-1">
                   <div className="flex items-center gap-2 text-zinc-900">
                      <Globe size={18} />
                      <h2 className="text-sm font-black uppercase tracking-widest">{dict.settings.language.title}</h2>
                   </div>
                   <p className="text-[11px] text-slate-400 font-bold">{dict.settings.language.description}</p>
                </div>

                <div className="grid gap-4">
                   <button 
                     onClick={() => changeLanguage('en')}
                     className={cn(
                       "flex items-center justify-between p-5 rounded-2xl border transition-all duration-300",
                       lang === 'en' 
                         ? "bg-zinc-900 border-zinc-900 text-white shadow-lg shadow-zinc-200" 
                         : "bg-white border-slate-100 text-zinc-600 hover:border-zinc-300"
                     )}
                   >
                     <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs",
                          lang === 'en' ? "bg-white/10" : "bg-zinc-50"
                        )}>🇺🇸</div>
                        <span className="font-bold uppercase tracking-widest text-xs">{dict.settings.language.en}</span>
                     </div>
                     {lang === 'en' && <CheckCircle2 size={18} />}
                   </button>

                   <button 
                     onClick={() => changeLanguage('id')}
                     className={cn(
                       "flex items-center justify-between p-5 rounded-2xl border transition-all duration-300",
                       lang === 'id' 
                         ? "bg-zinc-900 border-zinc-900 text-white shadow-lg shadow-zinc-200" 
                         : "bg-white border-slate-100 text-zinc-600 hover:border-zinc-300"
                     )}
                   >
                     <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs",
                          lang === 'id' ? "bg-white/10" : "bg-zinc-50"
                        )}>🇮🇩</div>
                        <span className="font-bold uppercase tracking-widest text-xs">{dict.settings.language.id}</span>
                     </div>
                     {lang === 'id' && <CheckCircle2 size={18} />}
                   </button>
                </div>
              </div>
            )}

            {activeTab === 'connections' && (
              <div className="space-y-10 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-1">
                   <div className="flex items-center gap-2 text-zinc-900">
                      <Link2 size={18} />
                      <h2 className="text-sm font-black uppercase tracking-widest">{dict.settings.connections.title}</h2>
                   </div>
                   <p className="text-[11px] text-slate-400 font-bold">{dict.settings.connections.description}</p>
                </div>

                {/* Linked Accounts */}
                <div className="space-y-4">
                  <h3 className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">{dict.settings.connections.accounts}</h3>
                  <div className="grid gap-3">
                    {/* Google */}
                    <div className="flex items-center justify-between p-4 bg-zinc-50 border border-slate-100 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2.5 shadow-sm">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-zinc-900 uppercase tracking-tight">Google Account</p>
                          <p className="text-[9px] text-slate-400 font-bold">
                            {accounts.some(a => a.provider === 'google') ? dict.settings.connections.linked : dict.settings.connections.notLinked}
                          </p>
                        </div>
                      </div>
                      {!accounts.some(a => a.provider === 'google') ? (
                        <button 
                          onClick={() => signIn('google')}
                          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                          {dict.settings.connections.link}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                            <CheckCircle2 size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Connected</span>
                          </div>
                   
                        </div>
                      )}
                    </div>

                    {/* GitHub */}
                    <div className="flex items-center justify-between p-4 bg-zinc-50 border border-slate-100 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                          <Github size={20} className="text-zinc-900" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-zinc-900 uppercase tracking-tight">GitHub Profile</p>
                          <p className="text-[9px] text-slate-400 font-bold">
                            {accounts.some(a => a.provider === 'github') ? dict.settings.connections.linked : dict.settings.connections.notLinked}
                          </p>
                        </div>
                      </div>
                      {!accounts.some(a => a.provider === 'github') ? (
                        <button 
                          onClick={() => signIn('github')}
                          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                          {dict.settings.connections.link}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                            <CheckCircle2 size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Connected</span>
                          </div>
                          <button 
                            onClick={() => handleUnlink('github')}
                            className="text-[9px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest ml-2"
                          >
                            Unlink
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Third Party Integrations */}
                <div className="space-y-4">
                  <h3 className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">{dict.settings.connections.thirdParty}</h3>
                  <div className="p-4 bg-zinc-900 rounded-2xl shadow-xl shadow-zinc-200 border border-zinc-800 flex items-center justify-between group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center p-2.5 shadow-lg group-hover:scale-110 transition-transform duration-500">
                        <img src="https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png" alt="Google Calendar" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-widest mb-1">{dict.settings.connections.googleCalendar}</p>
                        <p className="text-[9px] text-zinc-400 font-bold tracking-tight uppercase">Automatic Event Syncing</p>
                      </div>
                    </div>
                    <div className="relative z-10">
                      {accounts.some(a => a.provider === 'google' && a.scope?.includes('https://www.googleapis.com/auth/calendar.events')) ? (
                        <button 
                          onClick={() => handleUnlink('google')}
                          className="px-5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9px] font-black uppercase tracking-[0.15em] hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                        >
                          {dict.settings.connections.unlink}
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            const width = 500;
                            const height = 600;
                            const left = window.screenX + (window.outerWidth - width) / 2;
                            const top = window.screenY + (window.outerHeight - height) / 2;
                            window.open(
                              "/api/auth/google-calendar/link",
                              "google-calendar-auth",
                              `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes`
                            );
                          }}
                          className="px-5 py-2.5 rounded-xl bg-white text-zinc-900 text-[9px] font-black uppercase tracking-[0.15em] hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-95 inline-block"
                        >
                          {dict.settings.connections.link}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'support' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-1">
                   <div className="flex items-center gap-2 text-rose-500">
                      <Heart size={18} fill="currentColor" />
                      <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900">{dict.settings.support.title}</h2>
                   </div>
                   <p className="text-[11px] text-slate-400 font-bold">{dict.settings.support.subtitle}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                   {/* QRIS Section */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center">
                            <QrCode size={16} />
                         </div>
                         <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">{dict.settings.support.creatorSupport}</h3>
                      </div>
                      
                      <div className="bg-zinc-50 border border-slate-100 rounded-[2rem] p-8 flex flex-col items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                         <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-tr from-rose-500 to-orange-400 rounded-[2.5rem] opacity-20 blur-2xl group-hover:opacity-40 transition-opacity" />
                            <div className="relative bg-white p-4 rounded-3xl shadow-xl">
                               <img 
                                 src="/QRIS.jpeg" 
                                 alt="Creator QRIS Support" 
                                 className="w-48 h-48 object-contain rounded-xl"
                               />
                            </div>
                         </div>
                         <div className="text-center space-y-2">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Scan using any Payment App</p>
                            <p className="text-[11px] font-bold text-zinc-600 bg-white px-4 py-2 rounded-full border border-slate-100 italic">"Terima kasih atas dukungannya!"</p>
                         </div>
                      </div>
                   </div>

                   {/* Contact Form Section */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center">
                            <Mail size={16} />
                         </div>
                         <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">{dict.settings.support.contactTitle}</h3>
                      </div>

                      <form onSubmit={handleContactSubmit} className="space-y-4">
                         {contactSuccess ? (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center animate-in zoom-in-95 duration-500">
                               <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-100">
                                  <CheckCircle2 size={24} />
                               </div>
                               <h4 className="text-sm font-black text-emerald-900 uppercase tracking-widest mb-2">Message Sent!</h4>
                               <p className="text-[11px] text-emerald-700 font-bold leading-relaxed">
                                  {dict.settings.support.form.success}
                               </p>
                            </div>
                         ) : (
                            <div className="space-y-4">
                               <div className="grid gap-2">
                                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">{dict.settings.support.form.name}</label>
                                  <input 
                                     type="text"
                                     required
                                     className="w-full bg-zinc-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                                     value={contactForm.name}
                                     onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                  />
                               </div>
                               <div className="grid gap-2">
                                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">{dict.settings.support.form.email}</label>
                                  <input 
                                     type="email"
                                     required
                                     className="w-full bg-zinc-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                                     value={contactForm.email}
                                     onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                  />
                               </div>
                               <div className="grid gap-2">
                                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">{dict.settings.support.form.message}</label>
                                  <textarea 
                                     required
                                     rows={4}
                                     className="w-full bg-zinc-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-zinc-900 outline-none transition-all resize-none"
                                     value={contactForm.message}
                                     onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                     placeholder="..."
                                  />
                               </div>

                               <div className="grid gap-2">
                                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">{dict.settings.support.form.images}</label>
                                  <div className="flex flex-wrap gap-2">
                                     {contactForm.images.map((img, i) => (
                                        <div key={i} className="relative w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-white group/img">
                                           <img 
                                              src={URL.createObjectURL(img)} 
                                              alt="Preview" 
                                              className="w-full h-full object-cover" 
                                           />
                                           <button 
                                              type="button"
                                              onClick={() => {
                                                 const newImgs = [...contactForm.images];
                                                 newImgs.splice(i, 1);
                                                 setContactForm({ ...contactForm, images: newImgs });
                                              }}
                                              className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                           >
                                              <XCircle size={16} />
                                           </button>
                                        </div>
                                     ))}
                                     {contactForm.images.length < 3 && (
                                        <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-zinc-300 hover:bg-zinc-50 transition-all gap-1 text-slate-400">
                                           <QrCode size={16} />
                                           <span className="text-[8px] font-black uppercase">{contactForm.images.length}/3</span>
                                           <input 
                                              type="file" 
                                              className="hidden" 
                                              accept="image/*" 
                                              multiple 
                                              onChange={(e) => {
                                                 const files = Array.from(e.target.files || []);
                                                 const validFiles = files.filter(f => f.size <= 1 * 1024 * 1024);
                                                 
                                                 if (validFiles.length < files.length) {
                                                    setTestStatus({
                                                       show: true,
                                                       loading: false,
                                                       success: false,
                                                       message: dict.settings.support.form.sizeError
                                                    });
                                                 }

                                                 const combined = [...contactForm.images, ...validFiles].slice(0, 3);
                                                 setContactForm({ ...contactForm, images: combined });
                                              }}
                                           />
                                        </label>
                                     )}
                                  </div>
                               </div>

                               <button 
                                  type="submit"
                                  disabled={contactSending}
                                  className="w-full bg-zinc-900 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-lg shadow-zinc-100 flex items-center justify-center gap-2 group"
                               >
                                  {contactSending ? (
                                     <>
                                        <Loader2 size={14} className="animate-spin" />
                                        {dict.settings.support.form.sending}
                                     </>
                                  ) : (
                                     <>
                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        {dict.settings.support.form.submit}
                                     </>
                                  )}
                               </button>
                            </div>
                         )}
                      </form>
                   </div>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
