import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, Edit2, Download, Share, Trash2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useLanguageStore } from '../store/useLanguageStore';

interface ChatMenuPopupProps {
  isOpen: boolean;
  onClose: () => void;
  isPinned: boolean;
  onPin: () => void;
  onRename: () => void;
  onExport: () => void;
  onShare: () => void;
  onDelete: () => void;
  anchorRect: DOMRect | null;
}

export function ChatMenuPopup({
  isOpen,
  onClose,
  isPinned,
  onPin,
  onRename,
  onExport,
  onShare,
  onDelete,
  anchorRect
}: ChatMenuPopupProps) {
  const { t } = useLanguageStore();
  if (!isOpen || !anchorRect) return null;

  // Position it right below the 3-dot button
  const top = anchorRect.bottom + 8;
  const right = window.innerWidth - anchorRect.right;

  return createPortal(
    <>
      <div 
        className="fixed inset-0 z-[100]" 
        onClick={onClose}
      />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{ top, right }}
          className="fixed z-[101] w-[220px] bg-[#1E293B] border border-white/10 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.4)] overflow-hidden"
        >
          <div className="flex flex-col py-1">
            <button 
              onClick={() => { onPin(); onClose(); }}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/[0.06] transition-colors text-left"
            >
              <Bookmark size={18} className="text-[#94A3B8]" />
              <span className="text-[15px] text-[#E2E8F0] font-medium flex-1">
                {isPinned ? t('menu_unpin') : t('menu_pin')}
              </span>
              <div className={`w-2 h-2 rounded-full ${isPinned ? 'bg-cyan-400' : 'bg-transparent'}`} />
            </button>

            <button 
              onClick={() => { onRename(); onClose(); }}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/[0.06] transition-colors text-left"
            >
              <Edit2 size={18} className="text-[#94A3B8]" />
              <span className="text-[15px] text-[#E2E8F0] font-medium">{t('menu_rename')}</span>
            </button>

            <button 
              onClick={() => { onExport(); onClose(); }}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/[0.06] transition-colors text-left"
            >
              <Download size={18} className="text-[#94A3B8]" />
              <span className="text-[15px] text-[#E2E8F0] font-medium">{t('menu_export')}</span>
            </button>

            <button 
              onClick={() => { onShare(); onClose(); }}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/[0.06] transition-colors text-left"
            >
              <Share size={18} className="text-[#94A3B8]" />
              <span className="text-[15px] text-[#E2E8F0] font-medium">{t('menu_share')}</span>
            </button>

            <div className="w-full h-[1px] bg-white/[0.08] my-1" />

            <button 
              onClick={() => { onDelete(); onClose(); }}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/[0.06] transition-colors text-left"
            >
              <Trash2 size={18} className="text-[#F43F5E]" />
              <span className="text-[15px] text-[#F43F5E] font-medium">{t('menu_delete')}</span>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>,
    document.body
  );
}
