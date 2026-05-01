import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Palette, Cpu, Check, Github, BookOpen, Globe, ChevronDown, Key, Box, Smile, Settings2, X, Lock, Heart } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { ThemeName } from '../types';
import { getThemeGradient } from '../utils/theme';
import { LanguageSelectorSheet } from '../components/LanguageSelectorSheet';

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
    contextMemory, setContextMemory
  } = useChatStore();
  
  const { t, locale } = useLanguageStore();

  const [activeModal, setActiveModal] = useState<'none' | 'provider' | 'model'>('none');
  const [localApiKeyInput, setLocalApiKeyInput] = useState(apiKeys[provider] || (provider === 'openrouter' ? openRouterKey || '' : ''));
  const [showKey, setShowKey] = useState(false);
  const [isAdvOpen, setIsAdvOpen] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');

  const [isLangSheetOpen, setIsLangSheetOpen] = useState(false);
  
  const themeGradient = getThemeGradient(theme);

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
               <span className="text-2xl">{AI_PROVIDERS.find(p => p.id === provider)?.icon}</span>
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
                 {AI_PROVIDERS.find(p => p.id === provider)?.name} {provider === 'ollama' ? 'URL' : 'API Key'}
              </label>
            </div>
            {provider !== 'ollama' && (
              <p className="text-xs text-[#94A3B8] mb-4 font-medium">{t('settings_api_key_desc')}</p>
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
                    placeholder={provider === 'openrouter' ? "sk-or-v1-..." : "sk-..."}
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
              <span className="text-sm font-mono text-[#94A3B8]">2.0.0-PRO</span>
            </div>
            <a href="https://github.com/ud1nk" target="_blank" rel="noreferrer" className="p-4 border-b border-white/[0.06] flex items-center justify-between hover:bg-white/[0.02] transition-colors">
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
                  <button key={p.id} onClick={() => { setProvider(p.id); setModel(AI_MODELS[p.id]?.[0]?.id || ''); setActiveModal('none'); }} className={`w-full p-4 rounded-[20px] flex items-center gap-4 text-left border transition-all ${provider === p.id ? 'bg-white/[0.08] border-white/[0.15]' : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05]'}`}>
                     <div className="text-3xl shrink-0">{p.icon}</div>
                     <div className="flex flex-col flex-1 min-w-0 pr-2">
                       <div className="flex items-center gap-2 mb-1">
                         <span className="font-bold text-[#F1F5F9]">{p.name}</span>
                         <div className={`w-2 h-2 rounded-full ${p.free ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                       </div>
                       <span className="text-xs text-[#94A3B8] leading-snug truncate">{p.desc}</span>
                     </div>
                     {provider === p.id && <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${themeGradient} flex items-center justify-center shrink-0`}>
                        <Check size={14} className="text-white" />
                     </div>}
                  </button>
                ))}

                {activeModal === 'model' && Object.entries(
                   (AI_MODELS[provider] || []).reduce((acc, m) => {
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
                        const hasKey = !!localApiKeyInput;
                        const isDisabled = isPremium && !hasKey && !AI_PROVIDERS.find(p=>p.id === provider)?.free;
                        return (
                          <button key={m.id} disabled={isDisabled} onClick={() => { setModel(m.id); setActiveModal('none'); }} className={`w-full p-4 rounded-[16px] text-left border flex items-center justify-between transition-all ${model === m.id ? 'bg-white/[0.08] border-white/[0.15]' : 'bg-white/[0.02] border-white/[0.04]'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/[0.05]'}`}>
                            <div className="flex flex-col pr-4">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-bold ${model === m.id ? 'text-[#F1F5F9]' : 'text-[#E2E8F0]'}`}>{m.name}</span>
                                {isDisabled && <Lock size={12} className="text-[#94A3B8]" />}
                              </div>
                              <span className="text-xs text-[#94A3B8] truncate">{m.desc}</span>
                            </div>
                            <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-[#94A3B8] font-mono shrink-0">{m.cost}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
