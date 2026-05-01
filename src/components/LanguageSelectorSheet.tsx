import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useLanguageStore } from '../store/useLanguageStore';
import { LanguageCode } from '../i18n';

interface LanguageSelectorSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'jp', name: 'Japanese', flag: '🇯🇵', comingSoon: true },
  { code: 'kr', name: 'Korean', flag: '🇰🇷', comingSoon: true },
  { code: 'cn', name: 'Chinese', flag: '🇨🇳', comingSoon: true },
] as const;

export function LanguageSelectorSheet({ isOpen, onClose }: LanguageSelectorSheetProps) {
  const { locale, setLocale, t } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const handleSelect = (code: string, comingSoon?: boolean) => {
    if (comingSoon) return;
    setLocale(code as LanguageCode);
    const langMsg = code === 'en' ? 'English 🇺🇸' : 'Bahasa Indonesia 🇮🇩';
    // Let parent or global toast handle it, or we just rely on instant re-rendering
    onClose();
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
      />

      {/* Bottom Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-[101] flex justify-center w-full"
      >
         <div className="w-full max-w-2xl bg-[#0F172A] rounded-t-[24px] border-t border-white/[0.08] shadow-2xl overflow-hidden pb-8">
            <div className="flex justify-center pt-3 pb-4">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>
            
            <div className="px-6 pb-4">
               <h2 className="text-lg font-bold text-white tracking-tight">{t('lang_title')}</h2>
            </div>

            <div className="flex flex-col max-h-[60vh] overflow-y-auto px-4 scrollbar-none">
              {LANGUAGES.map((lang) => {
                const isActive = locale === lang.code;
                
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang.code, lang.comingSoon)}
                    disabled={lang.comingSoon}
                    className={`flex items-center justify-between p-4 mb-2 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-[#1E293B] border border-cyan-500/30' 
                        : 'bg-transparent hover:bg-white/[0.04]'
                    } ${lang.comingSoon ? 'opacity-40 cursor-not-allowed' : ''} relative overflow-hidden`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-cyan-400" />
                    )}
                    <div className="flex items-center gap-4 pl-1">
                      <span className="text-2xl">{lang.flag}</span>
                      <span className={`text-[15px] ${isActive ? 'font-bold text-white' : 'font-medium text-[#E2E8F0]'}`}>
                        {lang.name}
                      </span>
                    </div>
                    {isActive && (
                      <Check size={20} className="text-cyan-400" strokeWidth={3} />
                    )}
                    {lang.comingSoon && (
                      <div className="px-2 py-1 rounded bg-white/10 border border-white/5">
                        <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">{t('lang_coming_soon')}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
         </div>
      </motion.div>
    </>
    , document.body
  );
}
