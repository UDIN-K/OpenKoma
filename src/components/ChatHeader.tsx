import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Search, MoreVertical, ChevronDown, X } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { AI_MODELS, isProviderFree } from '../utils/models';
import { ModelSelectorSheet } from './ModelSelectorSheet';
import { ChatMenuPopup } from './ChatMenuPopup';

export function ChatHeader({ 
  onBack, 
  onNavigateSettings,
  isGenerating,
  searchQuery,
  setSearchQuery,
  onOpenSearch,
  onCloseSearch,
  isSearchMode,
  currentChatTitle,
  isChatPinned,
  onPinChat,
  onRenameRequest,
  onDeleteRequest,
  onExportRequest,
  onShareRequest
}: { 
  onBack: () => void, 
  onNavigateSettings: () => void,
  isGenerating: boolean,
  searchQuery?: string,
  setSearchQuery?: (q: string) => void,
  searchMatchCount?: number,
  onOpenSearch?: () => void,
  onCloseSearch?: () => void,
  isSearchMode?: boolean,
  currentChatTitle?: string,
  isChatPinned?: boolean,
  onPinChat?: () => void,
  onRenameRequest?: () => void,
  onDeleteRequest?: () => void,
  onExportRequest?: () => void,
  onShareRequest?: () => void
}) {
  const { provider, model, apiKeys, setModel } = useChatStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const modelInfo = AI_MODELS[provider]?.find(m => m.id === model) || AI_MODELS[provider]?.[0];
  const modelName = modelInfo?.name || 'Select Model';
  
  const hasKey = !!apiKeys[provider] || provider === 'ollama';
  const isFree = provider === 'ollama' || (modelInfo && modelInfo.type === 'free');
  
  const getDotColor = () => {
    if (!hasKey && !isProviderFree(provider)) return 'bg-red-500'; // Missing required key
    if (isFree) return 'bg-emerald-400';
    return 'bg-amber-400';
  };

  const getSubtext = () => {
    if (provider === 'ollama') return { text: 'Local', color: 'text-purple-400' };
    if (!hasKey && !isProviderFree(provider)) return { text: 'Missing API Key', color: 'text-red-400' };
    if (isFree) return { text: 'Free tier', color: 'text-emerald-400' };
    return { text: 'Premium', color: 'text-amber-400' };
  };

  const subtextInfo = getSubtext();

  const handleModelSelect = (modelId: string, modelName: string) => {
    setModel(modelId);
    setIsSheetOpen(false);
    
    // Show toast
    const typeIndicator = AI_MODELS[provider]?.find(m => m.id === modelId)?.type === 'free' ? '⚡' : '👑';
    setToastMsg(`Switched to ${modelName} ${typeIndicator}`);
  };

  // Auto-hide toast
  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  const menuRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Auto-focus search input when opening
  useEffect(() => {
    if (isSearchMode && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchMode]);

  return (
    <div className="shrink-0 bg-[#070B14] relative z-50">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-0 right-0 flex justify-center z-50 pointer-events-none"
          >
            <div className="bg-[#1E293B] border border-white/10 text-[#F1F5F9] px-4 py-2 rounded-full shadow-lg text-sm font-medium">
              {toastMsg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-6 pt-6 pb-3 h-[72px] relative overflow-hidden">
        
        <AnimatePresence mode="popLayout" initial={false}>
          {!isSearchMode ? (
            <motion.div 
              key="default-header"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between h-full w-full absolute inset-0 px-6 pt-6 pb-3"
            >
              {/* Left: Back Button */}
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={onBack}
                className="w-10 h-10 shrink-0 flex items-center justify-center -ml-2 text-[#F1F5F9] hover:text-white transition-colors"
              >
                <ChevronLeft size={24} strokeWidth={2.5} />
              </motion.button>

              {/* Center: Model Selector Chip */}
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSheetOpen(true)}
                className="flex flex-col items-center justify-center px-4 py-1.5 bg-white/[0.06] border border-white/[0.1] rounded-full max-w-[180px] hover:bg-white/[0.08] transition-colors shadow-sm"
              >
                <div className="flex items-center gap-1.5 w-full justify-center">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${getDotColor()} shadow-[0_0_8px_currentColor] opacity-80`} />
                  <span className="text-[13px] font-bold text-white truncate max-w-[120px] leading-none">{modelName}</span>
                  <ChevronDown size={14} className="text-[#94A3B8] shrink-0" strokeWidth={2.5} />
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider mt-1 leading-none ${subtextInfo.color}`}>{subtextInfo.text}</span>
              </motion.button>

              {/* Right: Actions */}
              <div className="flex items-center gap-1 w-10 justify-end">
                 <button 
                   onClick={onOpenSearch} 
                   className="w-8 h-8 flex items-center justify-center text-[#F1F5F9] hover:text-white transition-colors"
                 >
                   <Search size={20} strokeWidth={2} />
                 </button>
                 <button 
                   ref={menuRef}
                   onClick={() => setIsMenuOpen(true)}
                   className="w-8 h-8 flex items-center justify-center text-[#F1F5F9] hover:text-white transition-colors -mr-2"
                 >
                   <MoreVertical size={20} strokeWidth={2} />
                 </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="search-header"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 h-full w-full absolute inset-0 px-6 pt-6 pb-3"
            >
               <motion.button 
                 whileTap={{ scale: 0.9 }}
                 onClick={() => {
                   if (onCloseSearch) onCloseSearch();
                   if (setSearchQuery) setSearchQuery('');
                 }}
                 className="w-10 h-10 shrink-0 flex items-center justify-center -ml-2 text-[#94A3B8] hover:text-white transition-colors"
               >
                 <X size={24} strokeWidth={2.5} />
               </motion.button>
               
               <div className="flex-1 flex items-center bg-white/[0.06] border border-white/[0.08] rounded-[12px] px-3 h-10 w-full relative">
                 <input 
                   ref={searchInputRef}
                   value={searchQuery || ''}
                   onChange={(e) => setSearchQuery?.(e.target.value)}
                   placeholder={t('chat_search_placeholder')}
                   className="w-full bg-transparent border-none outline-none text-white text-[14px] placeholder:text-[#475569] placeholder:font-medium pr-16"
                 />
                 {searchQuery && searchQuery.length > 0 && (
                   <div className="absolute right-3 flex items-center gap-2">
                     <span className="text-[11px] font-medium text-[#94A3B8]">
                        {searchMatchCount} {searchMatchCount === 1 ? 'match' : 'matches'}
                     </span>
                     <button 
                       onClick={() => {
                         setSearchQuery?.('');
                         searchInputRef.current?.focus();
                       }}
                       className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 text-[#94A3B8] hover:text-white transition-colors"
                     >
                       <X size={12} strokeWidth={3} />
                     </button>
                   </div>
                 )}
               </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Animated Gradient Line */}
      <div className="w-full h-[2px] bg-[#1E293B] relative overflow-hidden">
         {isGenerating ? (
           <motion.div 
             initial={{ x: '-100%' }}
             animate={{ x: '100%' }}
             transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
             className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_rgba(34,211,238,0.8)]"
           />
         ) : !hasKey && !isProviderFree(provider) ? (
           <motion.div 
             animate={{ opacity: [0.3, 1, 0.3] }}
             transition={{ repeat: Infinity, duration: 2 }}
             className="absolute inset-0 bg-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
           />
         ) : (
           <div className="absolute inset-0 bg-gradient-to-r from-[#070B14] via-cyan-900/20 to-[#070B14]" />
         )}
      </div>

      {/* Sheet Modal */}
      <ModelSelectorSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
        onNavigateSettings={onNavigateSettings}
        onModelSelect={handleModelSelect}
      />
      
      <ChatMenuPopup 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isPinned={!!isChatPinned}
        onPin={() => { onPinChat?.(); setToastMsg(isChatPinned ? "Chat unpinned" : "Chat pinned"); }}
        onRename={() => onRenameRequest?.()}
        onExport={() => onExportRequest?.()}
        onShare={() => onShareRequest?.()}
        onDelete={() => onDeleteRequest?.()}
        anchorRect={menuRef.current?.getBoundingClientRect() || null}
      />
    </div>
  );
}
