import { Message } from '../../types';

export interface SendMessageParams {
  messages: Message[];
  apiKey: string | null;
  modelId: string;
  temperature: number;
  maxTokens: number;
  systemInstruction?: string;
  imageBase64?: string | null;
  ollamaUrl?: string; // specific to Ollama
}

export interface SendMessageCallbacks {
  onChunk: (text: string) => void;
  onFinish: () => void;
  onError: (msg: string) => void;
}

export interface AIProvider {
  sendMessageStream(params: SendMessageParams, callbacks: SendMessageCallbacks): Promise<void>;
}
