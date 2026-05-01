import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, Conversation, ThemeName } from '../types';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  openRouterKey: string | null;
  theme: ThemeName;
  language: string;
  
  provider: string;
  apiKeys: Record<string, string>;
  ollamaUrl: string;
  model: string;
  personality: string;
  customSystemPrompt: string;
  temperature: number;
  maxTokens: number;
  streaming: boolean;
  contextMemory: number;
  
  addMessage: (message: Message) => void;
  updateMessage: (id: string, partialContent: string, isStreaming?: boolean) => void;
  setOpenRouterKey: (key: string | null) => void;
  createNewConversation: () => string;
  setActiveConversation: (id: string | null) => void;
  deleteConversation: (id: string) => void;
  togglePinConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  setTheme: (theme: ThemeName) => void;
  setLanguage: (lang: string) => void;
  
  setProvider: (provider: string) => void;
  setApiKey: (provider: string, key: string) => void;
  setOllamaUrl: (url: string) => void;
  setModel: (model: string) => void;
  setPersonality: (personality: string) => void;
  setCustomSystemPrompt: (prompt: string) => void;
  setTemperature: (temp: number) => void;
  setMaxTokens: (tokens: number) => void;
  setStreaming: (streaming: boolean) => void;
  setContextMemory: (memory: number) => void;
}

const getSystemLanguage = () => {
  if (typeof navigator === 'undefined') return 'EN';
  const lang = navigator.language.substring(0, 2).toUpperCase();
  const supported = ['EN', 'ID', 'ES', 'JA', 'KO', 'ZH', 'FR', 'AR'];
  return supported.includes(lang) ? lang : 'EN';
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      openRouterKey: null,
      theme: 'cyan-blue',
      language: getSystemLanguage(),
      
      provider: 'openrouter',
      apiKeys: {},
      ollamaUrl: 'http://localhost:11434',
      model: 'meta-llama/llama-3-8b-instruct:free',
      personality: 'default',
      customSystemPrompt: '',
      temperature: 0.7,
      maxTokens: 2048,
      streaming: true,
      contextMemory: 10,
      
      createNewConversation: () => {
        const id = Date.now().toString();
        const newConv: Conversation = {
          id,
          title: 'New Conversation',
          messages: [],
          updatedAt: Date.now()
        };
        set((state) => ({
          conversations: [newConv, ...state.conversations],
          activeConversationId: id
        }));
        return id;
      },
      
      setActiveConversation: (id) => set({ activeConversationId: id }),
      
      deleteConversation: (id) => set((state) => ({
        conversations: state.conversations.filter(c => c.id !== id),
        activeConversationId: state.activeConversationId === id ? null : state.activeConversationId
      })),
      
      togglePinConversation: (id) => set((state) => ({
        conversations: state.conversations.map(c => 
          c.id === id ? { ...c, isPinned: !c.isPinned } : c
        )
      })),

      renameConversation: (id, title) => set((state) => ({
        conversations: state.conversations.map(c => 
          c.id === id ? { ...c, title } : c
        )
      })),
      
      addMessage: (message) => 
        set((state) => {
          let activeId = state.activeConversationId;
          let convs = [...state.conversations];
          
          if (!activeId) {
            activeId = Date.now().toString();
            convs.unshift({
              id: activeId,
              title: message.content.substring(0, 30) + '...',
              messages: [],
              updatedAt: Date.now()
            });
          }
          
          return {
            activeConversationId: activeId,
            conversations: convs.map(c => {
              if (c.id === activeId) {
                const title = c.messages.length === 0 && message.role === 'user' 
                  ? message.content.substring(0, 30) + (message.content.length > 30 ? '...' : '')
                  : c.title;
                return {
                  ...c,
                  title,
                  messages: [...c.messages, message],
                  updatedAt: Date.now()
                };
              }
              return c;
            })
          };
        }),
        
      updateMessage: (id, partialContent, isStreaming = false) => 
        set((state) => ({
          conversations: state.conversations.map(c => {
            if (c.id === state.activeConversationId) {
              return {
                ...c,
                messages: c.messages.map(msg => 
                  msg.id === id 
                    ? { ...msg, content: msg.content + partialContent, isStreaming }
                    : msg
                ),
                updatedAt: Date.now()
              };
            }
            return c;
          })
        })),
        
      setOpenRouterKey: (key) => set({ openRouterKey: key }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (lang) => set({ language: lang }),

      setProvider: (provider) => set({ provider }),
      setApiKey: (provider, key) => set((state) => ({ apiKeys: { ...state.apiKeys, [provider]: key } })),
      setOllamaUrl: (url) => set({ ollamaUrl: url }),
      setModel: (model) => set({ model }),
      setPersonality: (personality) => set({ personality }),
      setCustomSystemPrompt: (prompt) => set({ customSystemPrompt: prompt }),
      setTemperature: (temp) => set({ temperature: temp }),
      setMaxTokens: (tokens) => set({ maxTokens: tokens }),
      setStreaming: (streaming) => set({ streaming }),
      setContextMemory: (memory) => set({ contextMemory: memory }),
    }),
    {
      name: 'openkoma-premium-storage',
    }
  )
);
