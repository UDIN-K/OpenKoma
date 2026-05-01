import { motion } from 'motion/react';
import { Settings, Image as ImageIcon, AlignLeft, Terminal, Play, Globe, FileUser, PenLine, FileText, Edit3, Code, MessageCircle, ChevronDown } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { OpenKomaLogo } from '../components/OpenKomaLogo';
import { LanguageSelectorSheet } from '../components/LanguageSelectorSheet';
import { useState } from 'react';

export function HomeScreen({ onNavigateChat, onNavigateSettings }: { onNavigateChat: (id: string | null) => void, onNavigateSettings: () => void }) {
  const { theme, conversations } = useChatStore();
  const { t, locale } = useLanguageStore();
  const [isLangOpen, setIsLangOpen] = useState(false);
  
  const recentChats = conversations.filter(c => c.messages.length > 0).slice(0, 4);

  return (
    <div className="flex-1 flex flex-col bg-[#070B14] relative h-full overflow-hidden">
      
      {/* Header Info */}
      <div className="px-6 pt-12 pb-2 flex justify-between items-center w-full">
         <div className="flex items-center gap-2">
           <OpenKomaLogo size={20} className="text-[#F1F5F9]" />
           <span className="text-[#F1F5F9] font-bold tracking-tight text-[15px]">OpenKoma</span>
         </div>
         <div className="flex items-center gap-3">
           <button 
             onClick={() => setIsLangOpen(true)}
             className="flex items-center gap-1.5 bg-white/[0.06] border border-white/10 rounded-full px-3 py-1.5 hover:bg-white/[0.1] transition-colors"
           >
             <Globe size={14} className="text-[#00D4FF]" />
             <span className="text-[12px] font-bold text-[#F1F5F9] uppercase tracking-wide leading-none pt-[1px]">{locale}</span>
             <ChevronDown size={12} className="text-[#64748B]" strokeWidth={2.5} />
           </button>
           <button onClick={onNavigateSettings} className="w-8 h-8 rounded-full overflow-hidden border border-white/10 flex items-center justify-center bg-[#131A2A] text-[#94A3B8] hover:text-white transition-colors">
             <Settings size={18} />
           </button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full scrollbar-none pb-6">
        
        {/* Welcome Section */}
        <div className="flex flex-col items-center mt-6 px-6">
          <div className="mb-6 flex items-center justify-center drop-shadow-[0_8px_24px_rgba(106,196,184,0.15)]">
            <OpenKomaLogo size={88} className="text-[#F1F5F9]" />
          </div>
          <h1 className="text-3xl font-bold text-center leading-tight mb-8 text-[#F1F5F9] tracking-tight whitespace-pre-wrap">
            {t('home_welcome')}
          </h1>
        </div>

        {/* Input Bar */}
        <div className="px-6 mb-6">
          <div 
            onClick={() => onNavigateChat(null)}
            className="w-full bg-[#131A2A] rounded-[24px] flex items-center px-5 py-4 border border-[#1E293B] shadow-lg cursor-text"
          >
            <span className="flex-1 text-[#4A5568] text-sm font-medium">{t('home_search_placeholder')}</span>
            <div className="flex items-center gap-3">
              <button className="text-[#94A3B8] hover:text-white"><ImageIcon size={20} /></button>
              <button className="text-[#94A3B8] hover:text-white"><Play size={20} className="fill-current -rotate-90" /></button>
            </div>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex px-6 mb-4">
          <div className="flex gap-[10px] overflow-x-auto pb-2 scrollbar-none snap-x items-center w-full min-w-0 mask-image-fade-edges">
            <motion.button 
              whileTap={{ scale: 0.95, opacity: 0.8 }}
              onClick={() => onNavigateChat(null)} 
              className="snap-start flex-shrink-0 flex items-center gap-2 bg-white/[0.05] border border-white/[0.10] rounded-full px-[10px] py-[8px]"
            >
              <AlignLeft size={18} className="text-[#00D4FF]" strokeWidth={1.5} />
              <span className="font-medium text-[14px] text-[#F1F5F9]">{t('action_content')}</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95, opacity: 0.8 }}
              onClick={() => onNavigateChat(null)} 
              className="snap-start flex-shrink-0 flex items-center gap-2 bg-white/[0.05] border border-white/[0.10] rounded-full px-[10px] py-[8px]"
            >
              <ImageIcon size={18} className="text-[#A78BFA]" strokeWidth={1.5} />
              <span className="font-medium text-[14px] text-[#F1F5F9]">{t('action_image')}</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95, opacity: 0.8 }}
              onClick={() => onNavigateChat(null)} 
              className="snap-start flex-shrink-0 flex items-center gap-2 bg-white/[0.05] border border-white/[0.10] rounded-full px-[10px] py-[8px]"
            >
              <Code size={18} className="text-[#34D399]" strokeWidth={1.5} />
              <span className="font-medium text-[14px] text-[#F1F5F9]">{t('action_code')}</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95, opacity: 0.8 }}
              onClick={() => onNavigateChat(null)} 
              className="snap-start flex-shrink-0 flex items-center gap-2 bg-white/[0.05] border border-white/[0.10] rounded-full px-[10px] py-[8px]"
            >
              <Globe size={18} className="text-[#FFB800]" strokeWidth={1.5} />
              <span className="font-medium text-[14px] text-[#F1F5F9]">{t('action_translate')}</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95, opacity: 0.8 }}
              onClick={() => onNavigateChat(null)} 
              className="snap-start flex-shrink-0 flex items-center gap-2 bg-white/[0.05] border border-white/[0.10] rounded-full px-[10px] py-[8px]"
            >
              <FileText size={18} className="text-[#F43F5E]" strokeWidth={1.5} />
              <span className="font-medium text-[14px] text-[#F1F5F9]">{t('action_pdf')}</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95, opacity: 0.8 }}
              onClick={() => onNavigateChat(null)} 
              className="snap-start flex-shrink-0 flex items-center gap-2 bg-white/[0.05] border border-white/[0.10] rounded-full px-[10px] py-[8px]"
            >
              <Edit3 size={18} className="text-[#38BDF8]" strokeWidth={1.5} />
              <span className="font-medium text-[14px] text-[#F1F5F9]">{t('action_write')}</span>
            </motion.button>
          </div>
        </div>

        {/* RECENT Section */}
        {recentChats.length > 0 && (
          <div className="px-6 mt-4">
            <h2 className="text-[11px] font-bold text-[#64748B] tracking-widest uppercase mb-4">{t('home_recent')}</h2>
            <div className="grid grid-cols-2 gap-3 pb-8">
              {recentChats.map((chat, idx) => {
                const lastMessage = chat.messages[chat.messages.length - 1];
                const stripMarkdown = (text: string) => text?.replace(/(\*\*|__|\*|_|~~|`|#+)/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim() || '';
                
                const cardGradients = [
                  'from-blue-500/10 to-[#1C212E]',
                  'from-purple-500/10 to-[#1C212E]',
                  'from-emerald-500/10 to-[#1C212E]',
                  'from-rose-500/10 to-[#1C212E]'
                ];
                const bgGradient = cardGradients[idx % cardGradients.length];

                return (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    key={chat.id}
                    onClick={() => onNavigateChat(chat.id)}
                    className={`bg-gradient-to-br ${bgGradient} p-4 rounded-[20px] border border-white/5 flex flex-col aspect-square relative overflow-hidden text-left shadow-lg`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                       <MessageCircle size={14} className="text-white/50" />
                       <span className="text-[10px] text-white/50 font-medium">{t('general_chat')}</span>
                    </div>
                    <p className="text-[14px] font-bold text-[#F1F5F9] leading-snug mb-2 line-clamp-3">
                      {chat.title}
                    </p>
                    
                    <div className="flex-1"></div>

                    {lastMessage && (
                      <div className="bg-black/20 backdrop-blur-sm rounded-xl p-2.5 w-full border border-white/5">
                         <p className="text-[10px] text-[#cbd5e1] line-clamp-2 leading-tight">
                           {stripMarkdown(lastMessage.content) || 'Empty message...'}
                         </p>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

      </div>
      
      <LanguageSelectorSheet isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />
    </div>
  );
}
