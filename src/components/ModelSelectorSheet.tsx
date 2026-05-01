import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Lock, Check } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { AI_MODELS, AI_PROVIDERS } from '../utils/models';

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
  const [searchQuery, setSearchQuery] = useState('');
  
  const currentProviderName = AI_PROVIDERS.find(p => p.id === provider)?.name || 'Unknown';
  const hasKey = !!apiKeys[provider] || provider === 'ollama';
  const isFreeProvider = AI_PROVIDERS.find(p => p.id === provider)?.free;

  const currentModels = AI_MODELS[provider] || [];
  
  const filteredModels = currentModels.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

              <div className="px-6 pb-4 shrink-0">
                 <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                   <input 
                     type="text" 
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                     placeholder="Search models..."
                     className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-[#F1F5F9] focus:outline-none focus:border-white/20 transition-colors"
                   />
                 </div>
              </div>

            <div className="overflow-y-auto px-6 pb-8 custom-scrollbar space-y-6">
              {freeModels.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">⚡ Free Models</h4>
                  </div>
                  <div className="space-y-2">
                    {freeModels.map(m => {
                      const initial = m.name.charAt(0);
                      return (
                        <button 
                          key={m.id} 
                          onClick={() => onModelSelect(m.id, m.name)} 
                          className={`w-full p-4 rounded-[20px] text-left border flex items-center gap-4 transition-all ${model === m.id ? 'bg-white/[0.08] border-white/[0.15]' : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05]'}`}
                        >
                          <div className={`w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center font-bold text-[#F1F5F9] border border-white/10 shadow-inner ${initial === 'M' ? 'bg-blue-600' : initial === 'G' ? 'bg-emerald-600' : initial === 'Q' ? 'bg-purple-600' : 'bg-slate-700'}`}>
                            {initial}
                          </div>
                          <div className="flex flex-col flex-1 min-w-0 pr-2">
                            <span className={`font-bold text-[15px] truncate ${model === m.id ? 'text-[#F1F5F9]' : 'text-[#E2E8F0]'}`}>{m.name}</span>
                            <span className="text-xs text-[#94A3B8] truncate">{m.desc}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-black tracking-widest uppercase origin-right scale-90">FREE</span>
                            {model === m.id && <Check size={18} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {premiumModels.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 mt-4">
                    <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider">👑 Premium Models</h4>
                  </div>
                  <div className="space-y-2">
                    {premiumModels.map(m => {
                      const isDisabled = !hasKey && !isFreeProvider;
                      const initial = m.name.charAt(0);
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
                          className={`w-full p-4 rounded-[20px] text-left border flex items-center gap-4 transition-all ${model === m.id ? 'bg-white/[0.08] border-white/[0.15]' : 'bg-white/[0.02] border-white/[0.04]'} ${isDisabled ? 'opacity-50' : 'hover:bg-white/[0.05]'}`}
                        >
                          <div className={`w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center font-bold text-[#F1F5F9] border border-white/10 shadow-inner relative overflow-hidden ${initial === 'C' ? 'bg-orange-600' : initial === 'G' ? 'bg-emerald-600' : initial === 'D' ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                            {isDisabled && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Lock size={14} className="text-white/80" /></div>}
                            {!isDisabled && initial}
                          </div>
                          <div className="flex flex-col flex-1 min-w-0 pr-2">
                            <span className={`font-bold text-[15px] truncate ${model === m.id ? 'text-[#F1F5F9]' : 'text-[#E2E8F0]'}`}>{m.name}</span>
                            <span className="text-xs text-[#94A3B8] truncate">{m.desc}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[10px] bg-white/5 text-[#94A3B8] px-2 py-0.5 rounded font-mono origin-right scale-90">{m.cost}</span>
                            {model === m.id && <Check size={18} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
