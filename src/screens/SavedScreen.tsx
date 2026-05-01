import { useState } from 'react';
import { Search, Settings, X, Pin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useChatStore } from '../store/useChatStore';
import { OpenKomaLogo } from '../components/OpenKomaLogo';

export function SavedScreen({ onNavigateSettings, onNavigateChat }: { onNavigateSettings: () => void, onNavigateChat: (id: string | null) => void }) {
  const { conversations } = useChatStore();
  const [activeFilter, setActiveFilter] = useState('Chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const pinnedConversations = conversations.filter(c => c.isPinned);
  const filteredPinned = pinnedConversations.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col bg-[#070B14] relative h-full w-full overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex flex-col shrink-0">
        <div className="flex items-center justify-between mb-6">
           <AnimatePresence mode="wait">
             {!isSearching ? (
               <motion.div 
                  key="title"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center justify-between w-full"
               >
                 <h1 className="font-bold text-3xl tracking-tight text-[#F1F5F9] mt-2">Saved</h1>
                 <button 
                   onClick={onNavigateSettings}
                   className="w-8 h-8 rounded-full overflow-hidden border border-white/10 flex items-center justify-center bg-[#131A2A] text-[#94A3B8] hover:text-white transition-colors"
                 >
                   <Settings size={18} />
                 </button>
               </motion.div>
             ) : (
               <motion.div 
                 key="searchbar"
                 initial={{ opacity: 0, width: "80%" }}
                 animate={{ opacity: 1, width: "100%" }}
                 exit={{ opacity: 0, width: "80%" }}
                 className="flex items-center gap-2 w-full mt-2"
               >
                 <div className="flex-1 flex items-center bg-[#131A2A] rounded-full px-4 py-2 border border-[#1E293B]">
                   <Search size={16} className="text-[#4A5568] mr-2" />
                   <input 
                     type="text" 
                     autoFocus
                     placeholder="Search saved..." 
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

        {/* Filter Chips & Search Action */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              {['Chat', 'Image', 'Code'].map(filter => (
                <button 
                  key={filter} 
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeFilter === filter ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'}`}
                >
                  {filter}
                </button>
              ))}
           </div>
           {!isSearching && (
             <button 
               onClick={() => setIsSearching(true)}
               className="w-10 h-10 flex items-center justify-end text-[#94A3B8] hover:text-white transition-colors"
             >
               <Search size={22} />
             </button>
           )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-none pb-24">
        
        {activeFilter === 'Chat' && (
          <div className="space-y-4">
             {filteredPinned.length === 0 ? (
                <div className="text-center py-10 mt-10">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Pin size={24} className="text-[#94A3B8]" />
                  </div>
                  <h3 className="text-[#F1F5F9] font-medium mb-1">No saved chats</h3>
                  <p className="text-sm text-[#94A3B8]">Chats you pin will appear here.</p>
                </div>
             ) : (
                filteredPinned.map((conv) => (
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
                        {conv.messages[conv.messages.length - 1]?.content || 'Empty session...'}
                      </p>
                    </div>
                  </button>
                ))
             )}
          </div>
        )}

        {/* Keeping original mock data for Image/Code if not chat, as they might want it for design */}
        {activeFilter !== 'Chat' && (
          <div className="text-center py-10 mt-10">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-[#94A3B8]" />
            </div>
            <h3 className="text-[#F1F5F9] font-medium mb-1">No saved {activeFilter.toLowerCase()}s</h3>
            <p className="text-sm text-[#94A3B8]">Items you save will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
