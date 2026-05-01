import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Paperclip, Terminal, Square, FileDown, Copy, Check } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { sendMessageStream } from '../services/aiService';
import { getThemeGradient, getThemeColor } from '../utils/theme';
import { MarkdownRenderer, highlightText } from '../components/MarkdownRenderer';
import { OpenKomaLogo } from '../components/OpenKomaLogo';
import { ChatHeader } from '../components/ChatHeader';
import { ChatInputBar } from '../components/ChatInputBar';
import { exportToPDF } from '../utils/exportPdf';

export function ChatScreen({ onBack, onNavigateSettings }: { onBack: () => void, onNavigateSettings: () => void }) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [extractedPdfText, setExtractedPdfText] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Search state
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Rename state
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameText, setRenameText] = useState('');

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { conversations, activeConversationId, theme, apiKeys, addMessage, updateMessage, togglePinConversation, renameConversation, deleteConversation } = useChatStore();
  const { t } = useLanguageStore();
  const themeGradient = getThemeGradient(theme);
  const themeColor = getThemeColor(theme);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  // Filter messages based on search query
  const searchMatchCount = messages.filter(m => searchQuery && m.content.toLowerCase().includes(searchQuery.toLowerCase())).length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, messages[messages.length - 1]?.isStreaming]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
      alert("Please select a PDF or Image file.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setAttachedFile(file);

    if (file.type === 'application/pdf') {
      setIsProcessingFile(true);
      try {
        const { extractTextFromPDF } = await import('../utils/pdfParser');
        const text = await extractTextFromPDF(file);
        setExtractedPdfText(text);
      } catch (err) {
        console.error(err);
        alert("Failed to extract text from PDF.");
        setAttachedFile(null);
      } finally {
        setIsProcessingFile(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } else {
      // It's an image, no processing needed right now just show it attached
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const compressImageToBase64 = (file: File, maxSize = 1024, quality = 0.75): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onerror = error => reject(error);
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Scale down if larger than maxSize
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG for smaller payload
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = reader.result as string;
    };
  });

  const handleSend = async (text: string = input) => {
    if ((!text.trim() && !extractedPdfText && !attachedFile) || isLoading || isProcessingFile) return;

    let finalPrompt = text.trim();
    let imageBase64: string | null = null;
    if (extractedPdfText) {
       finalPrompt = `${finalPrompt}\n\n[Attached Context from ${attachedFile?.name}]:\n${extractedPdfText}`;
    } else if (attachedFile && attachedFile.type.startsWith('image/')) {
       imageBase64 = await compressImageToBase64(attachedFile);
       finalPrompt = finalPrompt ? `${finalPrompt}\n\n[Attached Image: ${attachedFile.name}]` : `Describe or analyze this image.`;
    }
    
    if (!finalPrompt.trim() && extractedPdfText) {
       finalPrompt = `Please summarize or analyze this document:\n\n[Attached Context from ${attachedFile?.name}]:\n${extractedPdfText}`;
    }

    // Capture the current attached file info if we want to show it in user message UI later, but for now we just send the text
    const attachedFileName = attachedFile ? attachedFile.name : null;

    setInput('');
    setIsLoading(true);
    setAttachedFile(null);
    setExtractedPdfText('');

    const userMessageId = Date.now().toString();
    addMessage({ id: userMessageId, role: 'user', content: finalPrompt.trim() });

    const botMessageId = (Date.now() + 1).toString();
    addMessage({ id: botMessageId, role: 'model', content: '', isStreaming: true });

    const state = useChatStore.getState();
    const currentActiveConv = state.conversations.find(c => c.id === state.activeConversationId);
    if (!currentActiveConv) return;
    
    const history = currentActiveConv.messages.slice(0, -1);
    
    // We get the actual provider and key from state to send using our aiService (not fully implemented yet here but we pass it as params if needed)
    // Actually our aiService is hardcoded to OpenRouter in logic right now as per the placeholder

    // Construct system prompt based on personality
    let systemInstruction = "You are OpenKoma, an advanced AI Agent Workspace designed with sleek mobile-first principles.";
    if (state.personality === 'custom' && state.customSystemPrompt) {
      systemInstruction = state.customSystemPrompt;
    } else if (state.personality === 'coder') {
      systemInstruction = "You are OpenKoma, an expert software engineer. Provide concise answers and always format code blocks correctly.";
    } else if (state.personality === 'bahasa') {
      systemInstruction = "Kamu adalah OpenKoma, asisten AI yang pintar. Selalu jawab menggunakan Bahasa Indonesia yang santai tapi profesional.";
    }

    await sendMessageStream(
      history,
      apiKeys['openrouter'] || state.openRouterKey, // Fallback for legacy
      state.model || 'meta-llama/llama-3-8b-instruct:free',
      state.temperature || 0.7,
      state.maxTokens || 2048,
      (chunk) => {
        updateMessage(botMessageId, chunk, true);
      },
      () => {
        updateMessage(botMessageId, '', false);
        setIsLoading(false);
      },
      (errorMsg) => {
        updateMessage(botMessageId, `\n\n**Error:** ${errorMsg}`, false);
        setIsLoading(false);
      },
      systemInstruction,
      imageBase64
    );
  };

  const isNewChat = messages.length === 0;

  return (
    <div className="flex-1 flex flex-col bg-[#070B14] relative h-full w-full overflow-hidden">
      <ChatHeader 
        onBack={onBack} 
        onNavigateSettings={onNavigateSettings} 
        isGenerating={isLoading} 
        isSearchMode={isSearchMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchMatchCount={searchMatchCount}
        onOpenSearch={() => setIsSearchMode(true)}
        onCloseSearch={() => { setIsSearchMode(false); setSearchQuery(''); }}
        currentChatTitle={activeConversation?.title}
        isChatPinned={activeConversation?.isPinned}
        onPinChat={() => {
          if (activeConversationId) togglePinConversation(activeConversationId);
        }}
        onRenameRequest={() => {
          setRenameText(activeConversation?.title || '');
          setIsRenaming(true);
        }}
        onDeleteRequest={() => setShowDeleteConfirm(true)}
        onExportRequest={() => {
          if (!activeConversation) return;
          const content = activeConversation.messages.map(m => `[${m.role.toUpperCase()}]\n${m.content}`).join('\n\n---\n\n');
          const blob = new Blob([content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${activeConversation.title}.txt`;
          a.click();
          URL.revokeObjectURL(url);
        }}
        onShareRequest={() => {
          if (!activeConversation) return;
          const preview = activeConversation.messages.length > 0 ? activeConversation.messages[0].content.substring(0, 100) : '';
          navigator.clipboard.writeText(`Check out this chat: "${activeConversation.title}"\n${preview}...`);
        }}
      />

      <AnimatePresence>
        {isRenaming && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-[72px] left-0 right-0 z-40 px-6 py-3 bg-[#0F172A] border-b border-white/10 flex items-center gap-3 shadow-lg"
          >
            <input
              autoFocus
              value={renameText}
              onChange={e => setRenameText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (activeConversationId) renameConversation(activeConversationId, renameText || t('home_new_chat'));
                  setIsRenaming(false);
                } else if (e.key === 'Escape') {
                  setIsRenaming(false);
                }
              }}
              className="flex-1 bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-white text-[14px] outline-none focus:border-cyan-500/50"
            />
            <button 
              onClick={() => setIsRenaming(false)}
              className="px-3 py-2 text-[13px] text-[#94A3B8] hover:text-white"
            >
              {t('menu_cancel')}
            </button>
            <button 
              onClick={() => {
                if (activeConversationId) renameConversation(activeConversationId, renameText || t('home_new_chat'));
                setIsRenaming(false);
              }}
              className="px-3 py-2 text-[13px] bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-medium"
            >
              {t('general_save')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1E293B] border border-white/10 rounded-2xl p-6 w-full max-w-[320px] shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-2">{t('menu_delete_title')}</h3>
              <p className="text-[14px] text-[#94A3B8] mb-6 leading-relaxed">
                {t('menu_delete_body')}
              </p>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg border border-white/10 text-[#E2E8F0] text-[14px] font-medium hover:bg-white/5 transition-colors"
                >
                  {t('menu_cancel')}
                </button>
                <button 
                  onClick={() => {
                    if (activeConversationId) {
                      deleteConversation(activeConversationId);
                      onBack();
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-[#F43F5E] hover:bg-[#E11D48] text-white text-[14px] font-medium transition-colors"
                >
                  {t('menu_delete_confirm')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto px-6 py-2 scroll-smooth scrollbar-none relative z-10">
        {isNewChat ? (
          <div className="h-full flex flex-col items-center justify-center -mt-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center w-full">
              <div className="mb-2">
                 <OpenKomaLogo size={42} className="text-[#F1F5F9] drop-shadow-[0_8px_16px_rgba(106,196,184,0.15)]" />
              </div>
              <h3 className="text-[24px] font-bold text-white mb-1.5 text-center leading-tight whitespace-pre-wrap">{t('chat_hello')}</h3>
              <p className="text-[#94A3B8] text-[11px] font-medium text-center mb-6">{t('chat_last_update')} 12.02.26</p>
              
              <div className="flex flex-col items-center gap-3 w-full max-w-sm">
                
                <div className="w-8 h-8 rounded-full bg-[#A855F7] flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)] relative z-10 mb-1">
                   <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                
                <motion.button whileTap={{ scale: 0.98 }} onClick={() => handleSend(t('chat_suggestion_1'))} className="w-full text-center bg-[#131A2A] rounded-full py-3 px-4 border border-[#1E293B] text-[13px] font-semibold text-[#F1F5F9] hover:bg-[#1E293B] transition-colors relative z-20">
                  <span className="text-[#A855F7] mr-2">•</span> {t('chat_suggestion_1')}
                </motion.button>
                <motion.button whileTap={{ scale: 0.98 }} onClick={() => handleSend(t('chat_suggestion_2'))} className="w-full text-center bg-[#131A2A] rounded-full py-3 px-4 border border-[#1E293B] text-[13px] font-semibold text-[#F1F5F9] hover:bg-[#1E293B] transition-colors relative z-20">
                  <span className="text-[#A855F7] mr-2">•</span> "{t('chat_suggestion_2')}"
                </motion.button>

                <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] relative z-10 mt-2 mb-1">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.5 19c2.485 0 4.5-2.015 4.5-4.5 0-2.433-1.921-4.414-4.335-4.496C17.069 5.86 13.518 2.5 9 2.5c-4.97 0-9 4.03-9 9s4.03 9 9 9h8.5z"/></svg>
                </div>

                <motion.button whileTap={{ scale: 0.98 }} onClick={() => handleSend(t('chat_suggestion_3'))} className="w-full text-center bg-[#131A2A] rounded-full py-3 px-4 border border-[#1E293B] text-[13px] font-semibold text-[#F1F5F9] hover:bg-[#1E293B] transition-colors relative z-20">
                  <span className="text-[#10B981] mr-2">•</span> {t('chat_suggestion_3')}
                </motion.button>

              </div>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-6 pb-4 flex flex-col">
            <AnimatePresence initial={false}>
              {messages.map((message) => {
                const isUser = message.role === 'user';
                const hasMatch = searchQuery && message.content.toLowerCase().includes(searchQuery.toLowerCase());
                const isDimmed = searchQuery && !hasMatch;

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isDimmed ? 0.3 : 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex flex-col w-full ${isUser ? 'items-end' : 'items-start gap-2'} transition-opacity`}
                  >
                    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start gap-4'}`}>
                      {!isUser && (
                        <div className="w-10 h-10 rounded-[14px] border border-white/5 bg-[#131A2A] shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-center shrink-0 mt-1">
                          <OpenKomaLogo size={22} className="text-[#F1F5F9]" />
                        </div>
                      )}
                      
                      {isUser ? (
                        <div className="flex items-center gap-3 bg-[#3B82F6] text-white px-5 py-3 rounded-[24px] rounded-br-[8px] shadow-[0_4px_16px_rgba(59,130,246,0.3)] max-w-[85%]">
                          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=David&backgroundColor=131A2A" alt="User" className="w-6 h-6 rounded-full shrink-0 bg-black/20" />
                          <p className="whitespace-pre-wrap text-[15px] leading-relaxed break-words">
                            {highlightText(message.content, searchQuery)}
                          </p>
                        </div>
                      ) : (
                        <div className="w-full max-w-[90%] text-[#F1F5F9] pt-1">
                          <div className="markdown-body dark break-words text-[15px] leading-relaxed max-w-full overflow-hidden w-full">
                            {message.content ? (
                              <MarkdownRenderer content={message.content} searchQuery={searchQuery} />
                            ) : (
                              <div className="flex gap-1.5 items-center h-5 px-1 py-1">
                                <motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full"></motion.span>
                                <motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full"></motion.span>
                                <motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full"></motion.span>
                              </div>
                            )}
                          </div>
                          {/* Action bar: Copy & PDF Export */}
                          {message.content && !message.isStreaming && (
                            <div className="flex items-center gap-2 mt-2 ml-0">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  navigator.clipboard.writeText(message.content);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#94A3B8] hover:text-white hover:bg-white/[0.08] transition-colors text-[11px] font-medium"
                              >
                                <Copy size={12} />
                                Copy
                              </motion.button>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  const chatTitle = activeConversation?.title || 'OpenKoma Response';
                                  exportToPDF(message.content, chatTitle);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#94A3B8] hover:text-white hover:bg-white/[0.08] transition-colors text-[11px] font-medium"
                              >
                                <FileDown size={12} />
                                PDF
                              </motion.button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} className="h-1" />
          </div>
        )}
      </main>

      <div className="shrink-0 relative z-20 w-full pb-0 flex flex-col">
        <AnimatePresence>
          {attachedFile && (
            <motion.div 
               initial={{ opacity: 0, y: 10, height: 0 }}
               animate={{ opacity: 1, y: 0, height: 'auto' }}
               exit={{ opacity: 0, y: 10, height: 0 }}
               className="mb-2 mx-4 px-3 py-2 bg-[#1E293B] border border-white/10 rounded-xl flex items-center justify-between"
            >
               <div className="flex items-center gap-3 overflow-hidden">
                 <div className="w-8 h-8 flex items-center justify-center bg-blue-500/20 text-blue-400 rounded-lg shrink-0">
                    <Paperclip size={16} />
                 </div>
                 <div className="flex flex-col min-w-0">
                   <span className="text-sm font-medium text-white truncate w-full pr-2">{attachedFile.name}</span>
                   <span className="text-xs text-[#94A3B8]">
                     {isProcessingFile ? t('chat_extracting') : t('chat_ready_send')}
                   </span>
                 </div>
               </div>
               {!isProcessingFile && (
                 <button onClick={() => { setAttachedFile(null); setExtractedPdfText(''); }} className="p-1.5 text-[#94A3B8] hover:text-white rounded-full hover:bg-white/10 transition-colors">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                 </button>
               )}
            </motion.div>
          )}
        </AnimatePresence>

        <ChatInputBar
          input={input}
          setInput={setInput}
          onSend={() => handleSend()}
          isLoading={isLoading}
          onStop={() => setIsLoading(false)}
          onAttachmentClick={() => fileInputRef.current?.click()}
          onImageClick={() => fileInputRef.current?.click()}
          onMicClick={() => alert("Microphone not available in preview yet.")}
        />
        <input type="file" accept="application/pdf,image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      </div>
    </div>
  );
}
