import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProviderIcon } from '../components/ProviderIcons';
import { ChevronLeft, Palette, Cpu, Check, Github, BookOpen, Globe, ChevronDown, Key, Box, Smile, Settings2, X, Lock, Heart, LogOut, User as UserIcon, Search } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { ThemeName } from '../types';
import { getThemeGradient } from '../utils/theme';
import { LanguageSelectorSheet } from '../components/LanguageSelectorSheet';
import { signInWithGoogle, logOut, auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

import { AI_PROVIDERS, AI_MODELS } from '../utils/models';

const PERSONALITIES = [
  { id: 'default', icon: '🤖', name: 'Default', desc: 'Helpful, balanced, and professional' },
  { id: 'friendly', icon: '😄', name: 'Friendly', desc: 'Casual, warm, uses emoji, like chatting with a friend' },
  { id: 'academic', icon: '🎓', name: 'Academic', desc: 'Formal, detailed, cites sources, uses technical terminology' },
  { id: 'coder', icon: '💻', name: 'Coder', desc: 'Concise, code-focused, always provides examples in code blocks' },
  { id: 'creative', icon: '🎨', name: 'Creative', desc: 'Imaginative, poetic, thinks outside the box' },
  { id: 'bahasa', icon: '🇮🇩', name: 'Bahasa', desc: 'Selalu menjawab dalam Bahasa Indonesia yang baik dan benar' },
  { id: 'custom', icon: '✏️', name: 'Custom', desc: 'Write your own system prompt below' },
];

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { 
    openRouterKey, setOpenRouterKey, theme, setTheme,
    provider, setProvider, apiKeys, setApiKey, ollamaUrl, setOllamaUrl,
    model, setModel, personality, setPersonality, customSystemPrompt, setCustomSystemPrompt,
    temperature, setTemperature, maxTokens, setMaxTokens, streaming, setStreaming,
    contextMemory, setContextMemory, userName, setUserName, userAvatar, setUserAvatar
  } = useChatStore();
  
  const { t, locale } = useLanguageStore();

  const [activeModal, setActiveModal] = useState<'none' | 'provider' | 'model'>('none');
  const [localApiKeyInput, setLocalApiKeyInput] = useState(apiKeys[provider] || (provider === 'openrouter' ? openRouterKey || '' : ''));
  const [showKey, setShowKey] = useState(false);
  const [isAdvOpen, setIsAdvOpen] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [user, setUser] = useState<User | null>(null);

  const [isLangSheetOpen, setIsLangSheetOpen] = useState(false);
  
  const [modelSearch, setModelSearch] = useState('');
  const [modelFilter, setModelFilter] = useState<'all' | 'free' | 'vision' | 'code'>('all');
  const [dynamicModels, setDynamicModels] = useState<{id: string, name: string, type: 'free'|'premium', desc: string, cost: string}[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName || 'User');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themeGradient = getThemeGradient(theme);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        setUserAvatar(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };


  useEffect(() => {
    // Reset dynamic models when provider changes
    setDynamicModels([]);
    setModelSearch('');
  }, [provider]);

  useEffect(() => {
    // Fetch dynamic models when opening model selector for specific providers
    if (activeModal === 'model' && (provider === 'openrouter' || provider === 'huggingface')) {
      const fetchModels = async () => {
        setIsFetchingModels(true);
        try {
          if (provider === 'openrouter') {
             const res = await fetch('https://openrouter.ai/api/v1/models');
             if (res.ok) {
               const json = await res.json();
               const models = json.data.map((m: any) => {
                 const isFree = m.pricing && m.pricing.prompt === "0" && m.pricing.completion === "0";
                 return {
                   id: m.id,
                   name: m.name,
                   type: isFree ? 'free' : 'premium',
                   desc: m.description ? m.description.substring(0, 100) + '...' : 'Available via OpenRouter',
                   cost: isFree ? 'Free' : 'Paid'
                 };
               });
               // Merge with our static models to prefer our curated list
               setDynamicModels(models);
             }
          } else if (provider === 'huggingface') {
             const res = await fetch('https://huggingface.co/api/models?sort=trending&limit=100');
             if (res.ok) {
               const json = await res.json();
               const models = json.map((m: any) => {
                 return {
                   id: m.id,
                   name: m.id.split('/').pop() || m.id,
                   type: 'free',
                   desc: 'Trending on HuggingFace Hub',
                   cost: 'Free'
                 };
               });
               setDynamicModels(models);
             }
          }
        } catch (e) {
          console.error("Failed to fetch models", e);
        } finally {
          setIsFetchingModels(false);
        }
      };
      
      if (dynamicModels.length === 0) {
        fetchModels();
      }
    }
  }, [activeModal, provider]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setLocalApiKeyInput(apiKeys[provider] || (provider === 'openrouter' ? openRouterKey || '' : ''));
    setVerifyStatus('idle');
  }, [provider, apiKeys, openRouterKey]);

  const handleVerifySave = () => {
    setVerifyStatus('verifying');
    setTimeout(() => {
      if (localApiKeyInput.trim().length > 5 || provider === 'ollama') {
        setApiKey(provider, localApiKeyInput.trim());
        if (provider === 'openrouter') setOpenRouterKey(localApiKeyInput.trim());
        setVerifyStatus('success');
      } else {
        setVerifyStatus('error');
      }
      setTimeout(() => setVerifyStatus('idle'), 2000);
    }, 800);
  };

  const themes: { id: ThemeName, label: string, color: string }[] = [
    { id: 'cyan-blue', label: 'Neon Blue', color: 'from-[#00D4FF] to-[#7B61FF]' },
    { id: 'rose-orange', label: 'Sunset', color: 'from-[#F43F5E] to-[#F97316]' },
    { id: 'emerald-teal', label: 'Emerald', color: 'from-[#10B981] to-[#14B8A6]' },
    { id: 'purple-pink', label: 'Amethyst', color: 'from-[#A855F7] to-[#EC4899]' }
  ];

  return (
    <div className="flex-1 flex flex-col bg-transparent relative h-full">
      <header className="px-4 pb-4 flex items-center justify-between shrink-0 bg-[#0A0E1A]/80 backdrop-blur-md border-b border-white/[0.04] sticky top-0 z-20" style={{ paddingTop: 'calc(16px + var(--sat, 0px))' }}>
        <div className="flex items-center gap-2">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.08] text-[#94A3B8] hover:text-white transition-colors"
          >
            <ChevronLeft size={22} />
          </motion.button>
          <h2 className="font-bold text-lg text-[#F1F5F9] ml-2">{t('home_settings')}</h2>
        </div>
      </header>

      <div className="p-6 space-y-8 pb-32 overflow-y-auto">
        {/* 0. User Profile */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <UserIcon size={18} className="text-[#94A3B8]" />
            <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">User Profile</h3>
          </div>
          <motion.div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-[24px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex flex-col sm:flex-row items-center gap-5">
            <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleAvatarUpload} />
              <img src={userAvatar || "https://api.dicebear.com/7.x/notionists/svg?seed=David&backgroundColor=131A2A"} alt="Profile" className="w-16 h-16 rounded-full border-2 border-white/10 shrink-0 object-cover group-hover:opacity-80 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="bg-black/50 w-full h-full rounded-full flex items-center justify-center">
                   <span className="text-white font-semibold text-[10px] uppercase">Edit</span>
                 </div>
              </div>
              <button 
                className="absolute -bottom-1 -right-1 bg-[#131A2A] border border-white/10 w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors pointer-events-none"
                title="Change Avatar"
              >
                <span className="text-[10px]">✏️</span>
              </button>
            </div>
            <div className="flex flex-col flex-1 w-full gap-2">
              <div className="flex items-center justify-between">
                 <span className="text-sm font-bold text-[#E2E8F0]">Display Name</span>
                 {isEditingName ? (
                     <button 
                        onClick={() => {
                          setUserName(tempName.trim() || 'User');
                          setIsEditingName(false);
                        }}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                     >
                        Save
                     </button>
                 ) : (
                     <button 
                        onClick={() => {
                          setTempName(userName || 'User');
                          setIsEditingName(true);
                        }}
                        className="text-xs text-[#3B82F6] hover:text-[#60A5FA] font-medium transition-colors"
                     >
                        Edit
                     </button>
                 )}
              </div>
              {isEditingName ? (
                 <input 
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => {
                       if (e.key === 'Enter') {
                          setUserName(tempName.trim() || 'User');
                          setIsEditingName(false);
                       } else if (e.key === 'Escape') {
                          setIsEditingName(false);
                       }
                    }}
                    autoFocus
                    className="w-full bg-[#131A2A] border border-white/20 rounded-xl px-3 py-2 text-sm text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] transition-colors"
                 />
              ) : (
                 <div className="text-[#94A3B8] font-medium text-sm bg-[#131A2A] px-3 py-2 rounded-xl border border-transparent">{userName || 'User'}</div>
              )}
            </div>
          </motion.div>
        </section>

        {/* 1. Provider */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Cpu size={18} className="text-[#94A3B8]" />
            <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">{t('settings_provider_title')}</h3>
          </div>
          <motion.button
            whileHover={{ y: -2 }}
            onClick={() => setActiveModal('provider')}
            className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-[24px] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex items-center justify-between text-left hover:bg-white/[0.06] hover:border-white/[0.12] transition-colors"
          >
            <div className="flex items-center gap-3">
               <span className="text-2xl mt-1">
                 <ProviderIcon providerId={provider} className="w-8 h-8" />
               </span>
               <div className="flex flex-col">
                 <span className="text-[#E2E8F0] font-bold text-base">{AI_PROVIDERS.find(p => p.id === provider)?.name}</span>
                 <span className="text-xs text-[#94A3B8] mt-0.5 truncate max-w-[200px]">{model}</span>
               </div>
            </div>
            <ChevronDown size={20} className="text-[#94A3B8]" />
          </motion.button>
        </section>

        {/* 2. API Key */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Key size={18} className="text-[#94A3B8]" />
            <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">{provider === 'ollama' ? 'Local Connection' : t('settings_api_key_title')}</h3>
          </div>
          <motion.div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-[24px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-[#E2E8F0]">
                 {AI_PROVIDERS.find(p => p.id === provider)?.name} {provider === 'ollama' ? 'URL' : provider === 'github' ? 'PAT' : provider === 'github_copilot' ? 'Token / Proxy URL' : 'API Key'}
              </label>
            </div>
            {provider !== 'ollama' && (
              <p className="text-xs text-[#94A3B8] mb-4 font-medium">
                {provider === 'github' ? 'Enter your GitHub Personal Access Token (PAT).' : provider === 'github_copilot' ? 'Enter your Copilot Token or a Proxy API Key.' : t('settings_api_key_desc')}
              </p>
            )}

            <div className="space-y-3">
              {provider === 'ollama' ? (
                <input 
                  type="text" 
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-[#F1F5F9] focus:outline-none focus:border-white/30"
                />
              ) : (
                <div className="relative">
                  <input 
                    type={showKey ? "text" : "password"}
                    value={localApiKeyInput}
                    onChange={(e) => setLocalApiKeyInput(e.target.value)}
                    placeholder={provider === 'openrouter' ? "sk-or-v1-..." : provider === 'github' ? "github_pat_..." : provider === 'github_copilot' ? "tid=... or sk-..." : "sk-..."}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-4 py-3.5 text-sm font-mono text-[#F1F5F9] focus:outline-none focus:border-white/30 pr-12"
                  />
                  <button onClick={() => setShowKey(!showKey)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white">
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  {localApiKeyInput ? (
                     <><div className="w-2 h-2 rounded-full bg-emerald-400"></div><span className="text-xs font-medium text-emerald-400">Connected</span></>
                  ) : (provider === 'gemini' && user) ? (
                     <><div className="w-2 h-2 rounded-full bg-emerald-400"></div><span className="text-xs font-medium text-emerald-400">Google Pro Access</span></>
                  ) : AI_PROVIDERS.find(p => p.id === provider)?.free ? (
                     <><div className="w-2 h-2 rounded-full bg-amber-400"></div><span className="text-xs font-medium text-amber-400">Free Mode</span></>
                  ) : (
                     <><div className="w-2 h-2 rounded-full bg-red-400"></div><span className="text-xs font-medium text-red-400">Not Configured</span></>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={handleVerifySave}
                    className="border border-white/10 text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-white/5 transition-colors"
                  >
                    Verify
                  </motion.button>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={handleVerifySave}
                    className={`bg-gradient-to-r ${themeGradient} text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg flex items-center gap-2 relative overflow-hidden`}
                  >
                    {verifyStatus === 'verifying' ? 'Verifying...' : verifyStatus === 'success' ? 'Saved ✓' : verifyStatus === 'error' ? 'Invalid ✗' : t('general_save')}
                  </motion.button>
                </div>
              </div>
              
              {provider === 'gemini' && (
                <>
                  <div className="flex items-center gap-4 py-2">
                    <div className="h-[1px] flex-1 bg-white/[0.06]"></div>
                    <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest">OR</span>
                    <div className="h-[1px] flex-1 bg-white/[0.06]"></div>
                  </div>
                  
                  <div className="flex flex-col bg-white/[0.02] border border-white/5 rounded-2xl p-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/[0.05] rounded-xl flex-shrink-0">
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white mb-0.5">Google Account</div>
                        <div className="text-xs text-[#94A3B8] leading-relaxed">Sign in to access Gemini Pro models for free</div>
                      </div>
                    </div>
                    {user ? (
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={async () => {
                          try {
                            await logOut();
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="bg-white/[0.05] border border-white/10 text-white px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-between gap-3 hover:bg-white/10 transition-colors shadow-sm w-full"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <img src={user.photoURL || ''} alt="" className="w-5 h-5 rounded-full bg-white/20 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <LogOut className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
                      </motion.button>
                    ) : (
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={async () => {
                          try {
                            await signInWithGoogle();
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="bg-white text-black px-4 py-3 rounded-xl font-bold text-xs flex justify-center items-center hover:bg-gray-100 transition-colors shadow-sm w-full"
                      >
                        Log in
                      </motion.button>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </section>

        {/* 3. Model */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Box size={18} className="text-[#94A3B8]" />
            <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">{t('settings_model_title')}</h3>
          </div>
          <motion.div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-[24px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex items-center justify-between">
            <div className="flex flex-col max-w-[70%]">
              <span className="text-sm font-bold text-[#E2E8F0] block mb-1">{t('settings_current_model')}</span>
              <span className="text-[#94A3B8] text-xs leading-relaxed">{model}</span>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setActiveModal('model')} className="px-4 py-2 bg-white/[0.06] hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-colors border border-white/5">
              {t('settings_change')}
            </motion.button>
          </motion.div>
        </section>

        {/* 4. Personality */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Smile size={18} className="text-[#94A3B8]" />
            <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">{t('settings_personality_title')}</h3>
          </div>
          <div className="space-y-4">
            <div className="flex overflow-x-auto custom-scrollbar pb-2 -mx-2 px-2 gap-2">
              {PERSONALITIES.map(p => (
                <motion.button
                   key={p.id}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => setPersonality(p.id)}
                   className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all ${personality === p.id ? `border-transparent bg-gradient-to-r ${themeGradient} text-white shadow-lg` : 'border-white/10 bg-white/[0.04] text-[#94A3B8] hover:bg-white/[0.08]'}`}
                >
                  <span className="text-lg">{p.icon}</span>
                  <span className="font-bold text-sm">{p.name}</span>
                </motion.button>
              ))}
            </div>
            {personality === 'custom' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white/[0.04] border border-white/[0.08] rounded-[24px] p-4 flex flex-col">
                <textarea 
                  value={customSystemPrompt}
                  onChange={e => setCustomSystemPrompt(e.target.value)}
                  placeholder="You are a helpful assistant that..."
                  className="bg-transparent border-none focus:outline-none text-sm text-[#E2E8F0] resize-none h-24 mb-2 leading-relaxed"
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-2">
                  <button onClick={() => setCustomSystemPrompt('')} className="text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors">{t('settings_reset')}</button>
                  <span className="text-xs text-[#64748B] font-mono">{customSystemPrompt.length} / 1000</span>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* 5. Advanced Settings */}
        <section className="space-y-4">
          <motion.div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-[24px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
             <button onClick={() => setIsAdvOpen(!isAdvOpen)} className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors">
               <div className="flex items-center gap-2">
                 <Settings2 size={18} className="text-[#94A3B8]" />
                 <h3 className="text-sm font-bold text-[#E2E8F0]">{t('settings_advanced_title')}</h3>
               </div>
               <ChevronDown size={20} className={`text-[#94A3B8] transition-transform ${isAdvOpen ? 'rotate-180' : ''}`} />
             </button>
             
             <AnimatePresence>
               {isAdvOpen && (
                 <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                   <div className="p-5 pt-2 border-t border-white/[0.04] space-y-6">
                     
                     {/* Temperature */}
                     <div>
                       <div className="flex justify-between items-center mb-2">
                         <span className="text-sm font-medium text-[#E2E8F0]">{t('settings_adv_temp')}</span>
                         <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-[#94A3B8]">{temperature.toFixed(1)}</span>
                       </div>
                       <input type="range" min="0" max="2" step="0.1" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} className="w-full mb-1 accent-[#3B82F6]" />
                       <div className="flex justify-between text-[10px] text-[#64748B] uppercase font-bold tracking-widest"><span>{t('settings_adv_precise')}</span><span>{t('settings_adv_creative')}</span></div>
                     </div>

                     {/* Max Tokens */}
                     <div>
                       <div className="flex justify-between items-center mb-2">
                         <span className="text-sm font-medium text-[#E2E8F0]">{t('settings_adv_tokens')}</span>
                         <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-[#94A3B8]">{maxTokens}</span>
                       </div>
                       <input type="range" min="256" max="4096" step="256" value={maxTokens} onChange={e => setMaxTokens(parseInt(e.target.value))} className="w-full mb-1 accent-[#3B82F6]" />
                     </div>

                     {/* Context Memory */}
                     <div>
                       <div className="flex justify-between items-center mb-2">
                         <span className="text-sm font-medium text-[#E2E8F0]">{t('settings_adv_memory')}</span>
                         <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-[#94A3B8]">{contextMemory} msgs</span>
                       </div>
                       <input type="range" min="2" max="30" step="1" value={contextMemory} onChange={e => setContextMemory(parseInt(e.target.value))} className="w-full mb-1 accent-[#3B82F6]" />
                     </div>

                     {/* Streaming */}
                     <div className="flex items-center justify-between">
                       <div className="flex flex-col">
                         <span className="text-sm font-medium text-[#E2E8F0]">{t('settings_adv_stream')}</span>
                         <span className="text-[11px] text-[#64748B] mt-0.5">{t('settings_adv_stream_desc')}</span>
                       </div>
                       <button onClick={() => setStreaming(!streaming)} className={`w-12 h-6 rounded-full p-1 transition-colors relative ${streaming ? 'bg-emerald-500' : 'bg-white/10'}`}>
                         <motion.div animate={{ x: streaming ? 24 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-md" />
                       </button>
                     </div>

                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </motion.div>
        </section>

        {/* Section: Appearance (Includes Theme and Language) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Palette size={18} className="text-[#94A3B8]" />
            <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">{t('settings_appearance_title')}</h3>
          </div>
          
          <div className="space-y-3">
            <motion.div 
              whileHover={{ y: -2 }}
              className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-[24px] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.12]"
            >
              <button
                onClick={() => setIsLangSheetOpen(true)}
                className="w-full flex items-center justify-between px-4 py-3 text-left focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-[#94A3B8] mr-1" />
                  <span className="text-[#E2E8F0] font-medium">{t('settings_language')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#94A3B8] text-sm">{locale === 'id' ? 'Indonesia' : 'English'}</span>
                  <ChevronDown size={20} className="text-[#94A3B8]" />
                </div>
              </button>
            </motion.div>

            <motion.div 
              whileHover={{ y: -2 }}
              className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-[24px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.12]"
            >
              <label className="block text-sm font-bold text-[#E2E8F0] mb-4">
                 {t('settings_accent_theme')}
              </label>
              <div className="flex flex-wrap gap-4">
                {themes.map(t => (
                  <div key={t.id} className="flex flex-col items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setTheme(t.id)}
                      className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center shadow-lg transition-transform ${theme === t.id ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0A0E1A] scale-110' : 'opacity-70 hover:opacity-100'}`}
                    >
                      {theme === t.id && <Check size={20} className="text-white drop-shadow-md" />}
                    </motion.button>
                    <span className={`text-[10px] font-medium tracking-wide ${theme === t.id ? 'text-white' : 'text-[#94A3B8]'}`}>{t.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section: About */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={18} className="text-[#94A3B8]" />
            <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">{t('settings_about')}</h3>
          </div>
          
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-[24px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.12]"
          >
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <span className="text-sm font-medium text-[#E2E8F0]">{t('settings_version')}</span>
              <span className="text-sm font-mono text-[#94A3B8]">3.0.0-PRO</span>
            </div>
            <a href="https://github.com/UDIN-K/OpenKoma" target="_blank" rel="noreferrer" className="p-4 border-b border-white/[0.06] flex items-center justify-between hover:bg-white/[0.02] transition-colors">
               <div className="flex items-center gap-2 text-[#E2E8F0]">
                 <Github size={16} />
                 <span className="text-sm font-medium">{t('settings_source_code')}</span>
               </div>
               <span className="text-sm text-[#94A3B8]">@UDIN-K</span>
            </a>
            <a href="https://trakteer.id/ud1nk" target="_blank" rel="noreferrer" className="p-4 border-b border-white/[0.06] flex items-center justify-between hover:bg-white/[0.02] transition-colors">
               <div className="flex items-center gap-2 text-[#E2E8F0]">
                 <Heart size={16} className="text-rose-500" />
                 <span className="text-sm font-medium">{t('settings_support_us')}</span>
               </div>
               <span className="text-sm text-[#94A3B8]">Trakteer</span>
            </a>
            <div className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <span className="text-sm font-medium text-[#E2E8F0]">{t('settings_license')}</span>
              <span className="text-sm text-[#94A3B8]">Apache 2.0</span>
            </div>
          </motion.div>
        </section>
      </div>
      
      <LanguageSelectorSheet isOpen={isLangSheetOpen} onClose={() => setIsLangSheetOpen(false)} />
      
      {/* Modals placed inside SettingsScreen root layout */}
      <AnimatePresence>
        {activeModal !== 'none' && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-40" onClick={() => setActiveModal('none')} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="absolute bottom-0 left-0 right-0 max-h-[85%] bg-[#0A0E1A] border-t border-white/10 rounded-t-[32px] z-50 flex flex-col shadow-[0_-8px_40px_rgba(0,0,0,0.5)]">
              <div className="p-5 border-b border-white/5 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-lg text-white tracking-tight">{activeModal === 'provider' ? t('settings_select_provider') : t('settings_select_model')}</h3>
                <button onClick={() => setActiveModal('none')} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-[#94A3B8] hover:text-white transition-colors">
                   <X size={18} />
                </button>
              </div>
              <div className="overflow-y-auto p-4 custom-scrollbar space-y-2 pb-10">
                {activeModal === 'provider' && AI_PROVIDERS.map(p => (
                  <button key={p.id} disabled={p.comingSoon} onClick={() => { setProvider(p.id); setModel(AI_MODELS[p.id]?.[0]?.id || ''); setActiveModal('none'); }} className={`w-full p-4 rounded-[20px] flex items-center gap-4 text-left border transition-all ${provider === p.id ? 'bg-white/[0.08] border-white/[0.15]' : 'bg-white/[0.02] border-white/[0.04]'} ${p.comingSoon ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/[0.05]'}`}>
                     <div className="text-3xl shrink-0 flex items-center justify-center w-8 h-8">
                       <ProviderIcon providerId={p.id} className="w-8 h-8" />
                     </div>
                     <div className="flex flex-col flex-1 min-w-0 pr-2">
                       <div className="flex items-center gap-2 mb-1">
                         <span className="font-bold text-[#F1F5F9]">{p.name}</span>
                         {p.comingSoon ? (
                            <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">Coming Soon</span>
                         ) : (
                            <div className={`w-2 h-2 rounded-full ${p.free ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                         )}
                       </div>
                       <span className="text-xs text-[#94A3B8] leading-snug truncate">{p.desc}</span>
                     </div>
                     {provider === p.id && <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${themeGradient} flex items-center justify-center shrink-0`}>
                        <Check size={14} className="text-white" />
                     </div>}
                  </button>
                ))}

                {activeModal === 'model' && (
                  <div className="flex flex-col h-full">
                    <div className="px-4 pb-3 flex-shrink-0 space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
                        <input 
                           type="text" 
                           placeholder="Search models (coder, reasoning, etc)..." 
                           value={modelSearch}
                           onChange={(e) => setModelSearch(e.target.value)}
                           className="w-full bg-[#131A2A] text-white pl-9 pr-4 py-3 rounded-xl border border-white/10 placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
                        />
                      </div>
                      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                        <button onClick={()=>setModelFilter('all')} className={`text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors ${modelFilter==='all' ? 'bg-white/20 text-white': 'bg-white/5 text-[#94A3B8] hover:bg-white/10'}`}>All</button>
                        <button onClick={()=>setModelFilter('free')} className={`text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors ${modelFilter==='free' ? 'bg-emerald-500/20 text-emerald-400': 'bg-white/5 text-[#94A3B8] hover:bg-white/10'}`}>Free</button>
                        <button onClick={()=>setModelFilter('vision')} className={`text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors ${modelFilter==='vision' ? 'bg-blue-500/20 text-blue-400': 'bg-white/5 text-[#94A3B8] hover:bg-white/10'}`}>Vision / Image</button>
                        <button onClick={()=>setModelFilter('code')} className={`text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors ${modelFilter==='code' ? 'bg-purple-500/20 text-purple-400': 'bg-white/5 text-[#94A3B8] hover:bg-white/10'}`}>Code</button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                      {isFetchingModels && <div className="text-center text-xs text-[#94A3B8] py-4">Loading models...</div>}
                      
                      {Object.entries(
                         ((dynamicModels.length > 0 ? dynamicModels : AI_MODELS[provider]) || []).filter(m => {
                           if (modelFilter === 'free' && m.type !== 'free') return false;
                           
                           const desc = m.desc.toLowerCase();
                           const id = m.id.toLowerCase();
                           const isMultimodal = desc.includes('multimodal') || desc.includes('vision') || id.includes('vl') || id.includes('gemini') || id.includes('claude') || id.includes('gpt-4');
                           const isCode = desc.includes('code') || id.includes('coder');

                           if (modelFilter === 'vision' && !isMultimodal) return false;
                           if (modelFilter === 'code' && !isCode) return false;

                           return m.name.toLowerCase().includes(modelSearch.toLowerCase()) || 
                                  m.id.toLowerCase().includes(modelSearch.toLowerCase()) ||
                                  m.desc.toLowerCase().includes(modelSearch.toLowerCase());
                         }).reduce((acc, m) => {
                           if (!acc[m.type]) acc[m.type] = [];
                           acc[m.type].push(m);
                           return acc;
                         }, {} as Record<string, typeof AI_MODELS[string]>)
                      ).map(([type, models]) => (
                        <div key={type} className="mb-6 last:mb-0">
                          <div className="flex items-center gap-2 mb-3 px-2">
                            {type === 'free' ? <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 tracking-widest uppercase">{t('settings_free')}</span> : <span className="text-amber-400 text-sm">👑 Premium</span>}
                            <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">{type === 'free' ? t('settings_available_models') : t('settings_premium_models')}</h4>
                          </div>
                          <div className="space-y-2">
                            {models.map(m => {
                              const isPremium = m.type === 'premium';
                              const isGooglePro = (provider === 'gemini' && !!user);
                              const hasKey = !!localApiKeyInput || isGooglePro;
                              const isDisabled = isPremium && !hasKey && !AI_PROVIDERS.find(p=>p.id === provider)?.free;
                              
                              const isMultimodal = m.desc.toLowerCase().includes('multimodal') || m.desc.toLowerCase().includes('vision') || m.id.includes('vl') || m.id.includes('gemini') || m.id.includes('claude') || m.id.includes('gpt-4');
                              const isVideo = m.id.includes('gemini-2') || m.id.includes('gemini-1.5');
                              
                              return (
                                <button key={m.id} disabled={isDisabled} onClick={() => { setModel(m.id); setActiveModal('none'); }} className={`w-full py-3 px-1 text-left border-b last:border-b-0 flex items-center justify-between transition-all ${model === m.id ? 'border-white/20 bg-white/[0.03] rounded-lg' : 'border-white/[0.04]'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/[0.05] rounded-lg'}`}>
                                  <div className="flex flex-col pr-4 pl-2">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`font-bold text-sm ${model === m.id ? 'text-[#F1F5F9]' : 'text-[#E2E8F0]'}`}>{m.name}</span>
                                      {isDisabled && <Lock size={12} className="text-[#94A3B8]" />}
                                    </div>
                                    <span className="text-[11px] text-[#94A3B8] truncate max-w-[220px] sm:max-w-md mb-1">{m.desc}</span>
                                    <div className="flex gap-1.5 mt-0.5">
                                      <span className="text-[9px] bg-white/[0.06] text-white/70 px-1.5 py-0.5 rounded border border-white/5">Text</span>
                                      {isMultimodal && <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">Image</span>}
                                      {isVideo && <span className="text-[9px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20">Video</span>}
                                    </div>
                                  </div>
                                  <span className="text-[10px] bg-black/20 px-2 py-1 rounded text-[#94A3B8] font-mono shrink-0 mr-1">{m.cost}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {/* Allow custom model ID if nothing matches exactly */}
                      {modelSearch && !((dynamicModels.length > 0 ? dynamicModels : AI_MODELS[provider]) || []).find(m => m.id === modelSearch) && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                           <button 
                             onClick={() => { setModel(modelSearch); setActiveModal('none'); }} 
                             className="w-full p-4 rounded-xl text-left bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] flex items-center justify-between"
                           >
                              <div>
                                 <div className="font-bold text-[#F1F5F9] text-sm">Use Custom Model ID</div>
                                 <div className="text-xs text-[#94A3B8] mt-1 break-all">{modelSearch}</div>
                              </div>
                              <Check size={16} className="text-[#3B82F6]" />
                           </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
