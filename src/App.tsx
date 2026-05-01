import { useState, useEffect } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { ChatScreen } from './screens/ChatScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ConversationsScreen } from './screens/ConversationsScreen';
import { SavedScreen } from './screens/SavedScreen';
import { SplashScreen } from './screens/SplashScreen';
import { useChatStore } from './store/useChatStore';
import { motion, AnimatePresence } from 'motion/react';
import { Home, MessageCircle, Bookmark } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentTab, setCurrentTab] = useState<'home' | 'conversations' | 'saved'>('home');
  const [activeScreen, setActiveScreen] = useState<'main' | 'chat' | 'settings'>('main');
  
  const { setActiveConversation } = useChatStore();

  useEffect(() => {
    document.body.style.backgroundColor = '#070B14';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  const navigateToChat = (id: string | null) => {
    setActiveConversation(id);
    setActiveScreen('chat');
  };

  const navigateToSettings = () => {
    setActiveScreen('settings');
  };

  const closeModals = () => {
    setActiveScreen('main');
  };

  if (showSplash) {
    return (
      <div className="min-h-[100dvh] bg-[#070B14] flex items-center justify-center font-sans sm:p-4 text-[#F1F5F9]">
        <div className="w-full h-[100dvh] sm:h-[850px] max-w-[400px] bg-[#070B14] flex flex-col relative sm:border-[8px] sm:border-[#131A2A] sm:rounded-[40px] overflow-hidden shadow-2xl">
          <SplashScreen onComplete={() => setShowSplash(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#070B14] flex items-center justify-center font-sans sm:p-4 text-[#F1F5F9]">
      <div className="w-full h-[100dvh] sm:h-[850px] max-w-[400px] bg-[#070B14] flex flex-col relative sm:border-[8px] sm:border-[#131A2A] sm:rounded-[40px] overflow-hidden shadow-2xl">
        
        <AnimatePresence mode="wait">
          {activeScreen === 'main' && (
            <motion.div 
              key="main" 
              initial={{ x: -20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              exit={{ x: -20, opacity: 0 }} 
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="flex-1 flex flex-col h-full absolute inset-0 z-0"
            >
              <div className="flex-1 overflow-hidden relative">
                {currentTab === 'home' && <HomeScreen onNavigateChat={navigateToChat} onNavigateSettings={navigateToSettings} />}
                {currentTab === 'conversations' && <ConversationsScreen onNavigateChat={navigateToChat} onNavigateSettings={navigateToSettings} />}
                {currentTab === 'saved' && <SavedScreen onNavigateSettings={navigateToSettings} onNavigateChat={navigateToChat} />}
              </div>

              {/* Bottom Navigation */}
              <div className="h-[80px] bg-[#0A0E1A] border-t border-white/[0.06] absolute bottom-0 left-0 right-0 flex items-center justify-around px-8 pb-4 pt-4 shrink-0 z-10">
                <button 
                  onClick={() => setCurrentTab('home')}
                  className="flex flex-col items-center gap-1.5 min-w-[48px]"
                >
                  <Home size={24} strokeWidth={2} className={`transition-colors duration-300 ${currentTab === 'home' ? 'text-[#00D4FF]' : 'text-[#64748B]'}`} />
                  {currentTab === 'home' && <div className="w-[3px] h-[3px] rounded-full bg-[#00D4FF]"></div>}
                  {currentTab !== 'home' && <div className="w-[3px] h-[3px] rounded-full bg-transparent"></div>}
                </button>
                <button 
                  onClick={() => setCurrentTab('conversations')}
                  className="flex flex-col items-center gap-1.5 min-w-[48px]"
                >
                  <MessageCircle size={24} strokeWidth={2} className={`transition-colors duration-300 ${currentTab === 'conversations' ? 'text-[#00D4FF]' : 'text-[#64748B]'}`} />
                  {currentTab === 'conversations' && <div className="w-[3px] h-[3px] rounded-full bg-[#00D4FF]"></div>}
                  {currentTab !== 'conversations' && <div className="w-[3px] h-[3px] rounded-full bg-transparent"></div>}
                </button>
                <button 
                  onClick={() => setCurrentTab('saved')}
                  className="flex flex-col items-center gap-1.5 min-w-[48px]"
                >
                  <Bookmark size={24} strokeWidth={2} className={`transition-colors duration-300 ${currentTab === 'saved' ? 'text-[#00D4FF]' : 'text-[#64748B]'}`} />
                  {currentTab === 'saved' && <div className="w-[3px] h-[3px] rounded-full bg-[#00D4FF]"></div>}
                  {currentTab !== 'saved' && <div className="w-[3px] h-[3px] rounded-full bg-transparent"></div>}
                </button>
              </div>
            </motion.div>
          )}

          {activeScreen === 'chat' && (
            <motion.div 
              key="chat" 
              initial={{ x: '100%', opacity: 1 }} 
              animate={{ x: 0, opacity: 1 }} 
              exit={{ x: '100%', opacity: 1 }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="flex-1 flex flex-col h-full absolute inset-0 bg-[#070B14] z-20"
            >
              <ChatScreen onBack={closeModals} onNavigateSettings={navigateToSettings} />
            </motion.div>
          )}

          {activeScreen === 'settings' && (
            <motion.div 
              key="settings" 
              initial={{ y: '100%', opacity: 1 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: '100%', opacity: 1 }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="flex-1 flex flex-col h-full absolute inset-0 bg-[#070B14] z-30"
            >
              <SettingsScreen onBack={closeModals} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="hidden sm:flex absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/20 rounded-full z-50 pointer-events-none" />
      </div>
    </div>
  );
}
