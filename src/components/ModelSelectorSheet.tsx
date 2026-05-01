import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Lock, Check } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { AI_MODELS, AI_PROVIDERS } from '../utils/models';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useLanguageStore } from '../store/useLanguageStore';

export function ModelSelectorSheet({ 
  isOpen, 
  onClose, 
  onNavigateSettings,
  onModelSelect
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onNavigateSettings: () => void,
  onModelSelect: (modelId: string, modelName: string) => void
}) {
  const { provider, model, apiKeys } = useChatStore();
  const { t } = useLanguageStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilter, setModelFilter] = useState<'all' | 'free' | 'vision' | 'code'>('all');
  const [dynamicModels, setDynamicModels] = useState<{id: string, name: string, type: 'free'|'premium', desc: string, cost: string}[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Reset dynamic models when provider changes
    setDynamicModels([]);
    setSearchQuery('');
  }, [provider]);

  useEffect(() => {
    // Fetch dynamic models when opening model selector for specific providers
    if (isOpen && (provider === 'openrouter' || provider === 'huggingface')) {
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
  }, [isOpen, provider]);
  
  const currentProviderName = AI_PROVIDERS.find(p => p.id === provider)?.name || 'Unknown';
  const isGooglePro = (provider === 'gemini' && user);
  const hasKey = !!apiKeys[provider] || provider === 'ollama' || isGooglePro;
  const isFreeProvider = AI_PROVIDERS.find(p => p.id === provider)?.free;

  const currentModels = dynamicModels.length > 0 ? dynamicModels : AI_MODELS[provider] || [];
  
  const filteredModels = currentModels.filter(m => {
    if (modelFilter === 'free' && m.type !== 'free') return false;
    
    const desc = m.desc.toLowerCase();
    const id = m.id.toLowerCase();
    const isMultimodal = desc.includes('multimodal') || desc.includes('vision') || id.includes('vl') || id.includes('gemini') || id.includes('claude') || id.includes('gpt-4');
    const isCode = desc.includes('code') || id.includes('coder');

    if (modelFilter === 'vision' && !isMultimodal) return false;
    if (modelFilter === 'code' && !isCode) return false;

    return m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
           m.desc.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const freeModels = filteredModels.filter(m => m.type === 'free');
  const premiumModels = filteredModels.filter(m => m.type === 'premium');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[100]" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
            onClick={(e) => e.stopPropagation()}
            className="fixed bottom-0 left-0 right-0 max-h-[85%] bg-[#0A0E1A] border-t border-white/10 rounded-t-[32px] flex flex-col shadow-[0_-8px_40px_rgba(0,0,0,0.5)] z-[110]"
          >
            {/* Drag Handle */}
              <div className="w-full flex justify-center pt-3 pb-1 shrink-0" onClick={onClose}>
                <div className="w-12 h-1.5 bg-white/20 rounded-full cursor-pointer hover:bg-white/40 transition-colors"></div>
              </div>

              <div className="px-6 py-3 flex justify-between items-center shrink-0">
                <div className="flex flex-col">
                  <h3 className="font-bold text-[22px] text-white tracking-tight">Switch Model</h3>
                  <span className="text-xs text-[#94A3B8]">Current provider: {currentProviderName}</span>
                </div>
                <button 
                  onClick={() => { onClose(); onNavigateSettings(); }} 
                  className="p-2 -mr-2 text-[#94A3B8] hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Added a prompt below header to link to full settings so it's visible */}
              <div className="px-6 pb-4 shrink-0 flex items-center justify-between">
                 <button 
                   onClick={() => { onClose(); onNavigateSettings(); }} 
                   className="text-xs font-semibold text-[#3B82F6] hover:text-[#60A5FA] transition-colors flex items-center"
                 >
                   Manage Providers & Settings <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                 </button>
              </div>

              <div className="px-6 pb-3 shrink-0 space-y-3">
                 <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
                   <input 
                     type="text" 
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                     placeholder="Search models (coder, reasoning, etc)..."
                     className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-[#F1F5F9] focus:outline-none focus:border-white/20 transition-colors"
                   />
                 </div>
                 <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                   <button onClick={()=>setModelFilter('all')} className={`text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors ${modelFilter==='all' ? 'bg-white/20 text-white': 'bg-white/5 text-[#94A3B8] hover:bg-white/10'}`}>All</button>
                   <button onClick={()=>setModelFilter('free')} className={`text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors ${modelFilter==='free' ? 'bg-emerald-500/20 text-emerald-400': 'bg-white/5 text-[#94A3B8] hover:bg-white/10'}`}>Free</button>
                   <button onClick={()=>setModelFilter('vision')} className={`text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors ${modelFilter==='vision' ? 'bg-blue-500/20 text-blue-400': 'bg-white/5 text-[#94A3B8] hover:bg-white/10'}`}>Vision / Image</button>
                   <button onClick={()=>setModelFilter('code')} className={`text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors ${modelFilter==='code' ? 'bg-purple-500/20 text-purple-400': 'bg-white/5 text-[#94A3B8] hover:bg-white/10'}`}>Code</button>
                 </div>
              </div>

            <div className="overflow-y-auto px-6 pb-8 custom-scrollbar">
              {isFetchingModels && <div className="text-center text-xs text-[#94A3B8] py-4">Loading models...</div>}

              {freeModels.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 tracking-widest uppercase">FREE</span>
                    <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">AVAILABLE MODELS</h4>
                  </div>
                  <div className="space-y-2">
                    {freeModels.map(m => {
                      const isMultimodal = m.desc.toLowerCase().includes('multimodal') || m.desc.toLowerCase().includes('vision') || m.id.includes('vl') || m.id.includes('gemini') || m.id.includes('claude') || m.id.includes('gpt-4');
                      const isVideo = m.id.includes('gemini-2') || m.id.includes('gemini-1.5');
                      
                      return (
                        <button 
                          key={m.id} 
                          onClick={() => onModelSelect(m.id, m.name)} 
                          className={`w-full py-3 px-1 text-left border-b flex items-center justify-between transition-all ${model === m.id ? 'border-white/20 bg-white/[0.03] rounded-lg' : 'border-white/[0.04] hover:bg-white/[0.05] rounded-lg'}`}
                        >
                          <div className="flex flex-col pr-4 pl-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-bold text-sm ${model === m.id ? 'text-[#F1F5F9]' : 'text-[#E2E8F0]'}`}>{m.name}</span>
                            </div>
                            <span className="text-[11px] text-[#94A3B8] truncate max-w-[220px] sm:max-w-md mb-1">{m.desc}</span>
                            <div className="flex gap-1.5 mt-0.5">
                              <span className="text-[9px] bg-white/[0.06] text-white/70 px-1.5 py-0.5 rounded border border-white/5">Text</span>
                              {isMultimodal && <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">Image</span>}
                              {isVideo && <span className="text-[9px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20">Video</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[10px] bg-black/20 px-2 py-1 rounded text-[#94A3B8] font-mono shrink-0 mr-1">{m.cost}</span>
                            {model === m.id && <Check size={16} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] mr-2" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {premiumModels.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mt-4 mb-3">
                    <span className="text-amber-400 text-sm">👑</span>
                    <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">PREMIUM MODELS</h4>
                  </div>
                  <div className="space-y-2">
                    {premiumModels.map(m => {
                      const isDisabled = !hasKey && !isFreeProvider;
                      const isMultimodal = m.desc.toLowerCase().includes('multimodal') || m.desc.toLowerCase().includes('vision') || m.id.includes('vl') || m.id.includes('gemini') || m.id.includes('claude') || m.id.includes('gpt-4');
                      const isVideo = m.id.includes('gemini-2') || m.id.includes('gemini-1.5');
                      
                      return (
                        <button 
                          key={m.id} 
                          disabled={isDisabled}
                          onClick={() => {
                            if (isDisabled) {
                              alert("Enter your API key in Settings to unlock premium models");
                            } else {
                              onModelSelect(m.id, m.name);
                            }
                          }} 
                          className={`w-full py-3 px-1 text-left border-b flex items-center justify-between transition-all ${model === m.id ? 'border-white/20 bg-white/[0.03] rounded-lg' : 'border-white/[0.04] hover:bg-white/[0.05] rounded-lg'} ${isDisabled ? 'opacity-50' : ''}`}
                        >
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
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[10px] bg-black/20 px-2 py-1 rounded text-[#94A3B8] font-mono shrink-0 mr-1">{m.cost}</span>
                            {model === m.id && <Check size={16} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] mr-2" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Allow custom model ID if nothing matches exactly */}
              {searchQuery && !currentModels.find(m => m.id === searchQuery) && (
                <div className="mt-4 pt-4 border-t border-white/10">
                   <button 
                     onClick={() => onModelSelect(searchQuery, searchQuery)} 
                     className="w-full p-4 rounded-xl text-left bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] flex items-center justify-between"
                   >
                      <div>
                         <div className="font-bold text-[#F1F5F9] text-sm">Use Custom Model ID</div>
                         <div className="text-xs text-[#94A3B8] mt-1 break-all">{searchQuery}</div>
                      </div>
                      <Check size={16} className="text-[#3B82F6]" />
                   </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
