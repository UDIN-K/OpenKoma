import React, { useRef, useEffect } from 'react';
import { Plus, Image as ImageIcon, Mic, ArrowUp, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguageStore } from '../store/useLanguageStore';

interface ChatInputBarProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  onStop: () => void;
  onAttachmentClick: () => void;
  onImageClick: () => void;
  onMicClick: () => void;
}

export function ChatInputBar({
  input,
  setInput,
  onSend,
  isLoading,
  onStop,
  onAttachmentClick,
  onImageClick,
  onMicClick
}: ChatInputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useLanguageStore();
  
  const hasText = input.trim().length > 0;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px'; // Reset height
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(Math.max(scrollHeight, 44), 120) + 'px';
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="bg-[#0F172A]/95 backdrop-blur-md border-t border-white/[0.08] px-2 pt-2 flex items-end gap-2 shrink-0 w-full" style={{ paddingBottom: 'calc(8px + var(--sab, 0px))' }}>
      
      {/* Left Attachment Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onAttachmentClick}
        className="w-10 h-10 rounded-[20px] bg-white/[0.06] flex items-center justify-center shrink-0 mb-[2px]"
      >
        <Plus size={22} className="text-[#94A3B8]" strokeWidth={2} />
      </motion.button>

      {/* Text Input Container */}
      <div className="flex-1 bg-white/[0.06] border border-white/[0.10] rounded-[24px] flex items-end px-2 min-h-[44px]">
        
        {/* Left Icons inside input */}
        <div className="flex items-center gap-1.5 shrink-0 mb-[12px] pl-1">
          <button onClick={onImageClick} className="text-[#64748B] hover:text-[#94A3B8] transition-colors">
            <ImageIcon size={20} strokeWidth={2} />
          </button>
          <button onClick={onMicClick} className="text-[#64748B] hover:text-[#94A3B8] transition-colors">
            <Mic size={20} strokeWidth={2} />
          </button>
        </div>

        {/* TextInput */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('chat_placeholder')}
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-[#F1F5F9] text-[15px] placeholder:text-[#475569] placeholder:font-medium resize-none px-2 py-3 overflow-y-auto scrollbar-none self-center max-h-[120px]"
          disabled={isLoading}
          rows={1}
        />

        {/* Send Button */}
        <div className="shrink-0 mb-[4px] ml-1.5 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.button
                key="stop"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileTap={{ scale: 0.9 }}
                onClick={onStop}
                className="w-9 h-9 rounded-full bg-[#F43F5E] flex items-center justify-center shadow-lg"
              >
                <div className="w-3.5 h-3.5 bg-white rounded-[2px]" />
              </motion.button>
            ) : hasText ? (
              <motion.button
                key="send"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileTap={{ scale: 0.85 }}
                onClick={onSend}
                className="w-9 h-9 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7B61FF] flex items-center justify-center shadow-lg"
              >
                <ArrowUp size={20} className="text-white" strokeWidth={2.5} />
              </motion.button>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-9 h-9 rounded-full bg-transparent flex items-center justify-center"
              >
                 <ArrowUp size={20} className="text-[#475569]" strokeWidth={2.5} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
