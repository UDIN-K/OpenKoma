export type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  isStreaming?: boolean;
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  isPinned?: boolean;
};

export type ThemeName = 'cyan-blue' | 'rose-orange' | 'emerald-teal' | 'purple-pink';
