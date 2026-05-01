import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Settings, X, Pin } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { getThemeGradient } from '../utils/theme';

const stripMarkdown = (text: string) => {
  if (!text) return '';
  return text.replace(/(\*\*|__|\*|_|~~|`|#+)/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
};

export function ConversationsScreen({ onNavigateChat, onNavigateSettings }: { onNavigateChat: (id: string | null) => void, onNavigateSettings: () => void }) {
  const { conversations, theme } = useChatStore();
  const themeGradient = getThemeGradient(theme);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const filteredConversations = conversations.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pinnedConversations = filteredConversations.filter(c => c.isPinned);
  const unpinnedConversations = filteredConversations.filter(c => !c.isPinned);

  return (
    <div className="flex-1 flex flex-col bg-[#070B14] relative h-full w-full overflow-hidden">
      
      {/* Header */}
      <header className="px-6 pb-4 flex items-center justify-between shrink-0" style={{ paddingTop: 'calc(16px + var(--sat, 0px))' }}>
        <h1 className="font-bold text-2xl tracking-tight text-[#F1F5F9]">Conversations</h1>
        <button 
          onClick={onNavigateSettings}
          className="w-8 h-8 rounded-full overflow-hidden border border-white/10 flex items-center justify-center bg-[#131A2A] text-[#94A3B8] hover:text-white transition-colors"
        >
          <Settings size={18} />
        </button>
      </header>

      {/* Actions */}
      <div className="px-6 py-2 shrink-0">
        <AnimatePresence mode="wait">
          {!isSearching ? (
            <motion.div 
              key="actions"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center justify-between"
            >
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigateChat(null)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r ${themeGradient} text-white font-semibold text-sm shadow-[0_4px_16px_rgba(59,130,246,0.3)]`}
              >
                <Plus size={16} />
                New chat
              </motion.button>
              <button 
                onClick={() => setIsSearching(true)}
                className="w-10 h-10 flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors"
              >
                <Search size={22} />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="search"
              initial={{ opacity: 0, width: "80%" }}
              animate={{ opacity: 1, width: "100%" }}
              exit={{ opacity: 0, width: "80%" }}
              className="flex items-center gap-2 w-full"
            >
              <div className="flex-1 flex items-center bg-[#131A2A] rounded-full px-4 py-2 border border-[#1E293B]">
                <Search size={16} className="text-[#4A5568] mr-2" />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Search messages..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-[#F1F5F9] text-sm w-full"
                />
              </div>
              <button 
                onClick={() => {
                  setIsSearching(false);
                  setSearchQuery('');
                }}
                className="text-[#94A3B8] hover:text-white p-2"
              >
                <X size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-none pb-8">
        
        {/* PIN CHAT */}
        {pinnedConversations.length > 0 && (
          <div>
            <h2 className="text-[11px] font-bold text-[#4A5568] tracking-widest uppercase mb-3">PIN CHAT</h2>
            <div className="space-y-4">
              {pinnedConversations.map(conv => (
                <button key={conv.id} onClick={() => onNavigateChat(conv.id)} className="w-full flex items-start gap-4 text-left group">
                  <div className="w-11 h-11 rounded-[16px] bg-[#161C2A] flex items-center justify-center shrink-0 text-[20px] border border-white/[0.08] shadow-md group-hover:bg-[#1E293B] transition-colors text-white">
                     <Pin size={20} className="text-amber-400 rotate-45" />
                  </div>
                  <div className="flex-1 min-w-0 border-b border-white/5 pb-4 group-last:border-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-semibold text-[15px] text-[#F1F5F9] truncate pr-2">{conv.title || 'Conversation'}</h3>
                      <span className="text-xs text-[#64748B] shrink-0 font-medium">
                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#94A3B8] truncate">
                      {stripMarkdown(conv.messages[conv.messages.length - 1]?.content) || 'Empty session...'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ALL CHAT */}
        {unpinnedConversations.length > 0 && (
          <div>
            <h2 className="text-[11px] font-bold text-[#4A5568] tracking-widest uppercase mb-3">ALL CHAT</h2>
            <div className="space-y-4">
              {unpinnedConversations.map((conv) => (
                <button key={conv.id} onClick={() => onNavigateChat(conv.id)} className="w-full flex items-start gap-4 text-left group">
                  <div className="w-11 h-11 rounded-[16px] bg-[#161C2A] flex items-center justify-center shrink-0 border border-white/[0.08] shadow-md group-hover:bg-[#1E293B] transition-colors text-white">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4C2.89543 4 2 4.89543 2 6V16C2 17.1046 2.89543 18 4 18H7V21.1716C7 21.617 7.53857 21.8401 7.85355 21.5251L11.3787 18H20C21.1046 18 22 17.1046 22 16V6C22 4.89543 21.1046 4 20 4H4Z"/>
                      <circle cx="8" cy="11" r="1.5" fill="#161C2A" className="group-hover:fill-[#1E293B] transition-colors"/>
                      <circle cx="12" cy="11" r="1.5" fill="#161C2A" className="group-hover:fill-[#1E293B] transition-colors"/>
                      <circle cx="16" cy="11" r="1.5" fill="#161C2A" className="group-hover:fill-[#1E293B] transition-colors"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0 border-b border-white/5 pb-4 group-last:border-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-semibold text-[15px] text-[#F1F5F9] truncate pr-2">{conv.title || 'Conversation'}</h3>
                      <span className="text-xs text-[#64748B] shrink-0 font-medium">
                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#94A3B8] truncate">
                      {stripMarkdown(conv.messages[conv.messages.length - 1]?.content) || 'Empty session...'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
