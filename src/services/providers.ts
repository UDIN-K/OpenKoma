import { GoogleGenAI } from '@google/genai';
import { Message } from '../types';

export interface ProviderResponse {
  onChunk: (text: string) => void;
  onFinish: () => void;
  onError: (msg: string) => void;
}

export interface ProviderRequest {
  messages: Message[];
  apiKey: string | null;
  modelId: string;
  temperature: number;
  maxTokens: number;
  systemInstruction?: string;
  imageBase64?: string | null;
  ollamaUrl?: string;
}

export interface AIProvider {
  sendMessageStream: (req: ProviderRequest, res: ProviderResponse) => Promise<void>;
}

export function getProvider(providerId: string): AIProvider | null {
  if (providerId === 'openrouter') {
    return {
      sendMessageStream: async (req, res) => {
        try {
          const mappedMessages = req.messages.map(m => ({
            role: m.role === 'model' ? 'assistant' : 'user',
            content: m.content
          }));
          if (req.systemInstruction) {
            mappedMessages.unshift({ role: 'system', content: req.systemInstruction });
          }
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${req.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: req.modelId,
              messages: mappedMessages,
              temperature: req.temperature,
              max_tokens: req.maxTokens,
              stream: true,
            })
          });
          if (!response.ok) throw new Error(`OpenRouter Error: ${response.status}`);
          const reader = response.body?.getReader();
          const decoder = new TextDecoder("utf-8");
          if (!reader) throw new Error("No reader");
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed === 'data: [DONE]') { res.onFinish(); return; }
              if (trimmed.startsWith('data: ')) {
                try {
                  const data = JSON.parse(trimmed.slice(6));
                  if (data.choices?.[0]?.delta?.content) res.onChunk(data.choices[0].delta.content);
                } catch (e) {}
              }
            }
          }
          res.onFinish();
        } catch (e: any) { res.onError(e.message); }
      }
    };
  }
  
  if (providerId === 'gemini') {
    return {
      sendMessageStream: async (req, res) => {
         try {
            const ai = new GoogleGenAI({ apiKey: req.apiKey || process.env.GEMINI_API_KEY || '' });
            const contents = req.messages.map(msg => ({
              role: msg.role === 'model' ? 'model' : 'user',
              parts: [{ text: msg.content }]
            }));
            const config: any = { temperature: req.temperature, maxOutputTokens: req.maxTokens };
            if (req.systemInstruction) config.systemInstruction = req.systemInstruction;
            
            const responseStream = await ai.models.generateContentStream({
              model: req.modelId,
              contents,
              config
            });
            for await (const chunk of responseStream) {
              if (chunk.text) res.onChunk(chunk.text);
            }
            res.onFinish();
         } catch (e: any) { res.onError(e.message); }
      }
    };
  }
  
  // Dummy fallback for other providers
  return {
    sendMessageStream: async (req, res) => {
      try {
        if (!req.apiKey && providerId !== 'ollama') {
           throw new Error(`API key required for ${providerId}`);
        }
        res.onChunk(`[Simulated Response from ${providerId}]\nMessage received.`);
        res.onFinish();
      } catch (e: any) {
        res.onError(e.message);
      }
    }
  };
}
