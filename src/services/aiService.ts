import { GoogleGenAI } from '@google/genai';
import { Message } from '../types';

const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: geminiApiKey || '' });

export async function sendMessageStream(
  messages: Message[],
  openRouterKey: string | null,
  onChunk: (text: string) => void,
  onFinish: () => void,
  onError: (msg: string) => void,
  systemInstruction?: string
) {
  try {
    if (openRouterKey) {
      // -----------------------------------------------------
      // Premium / BYOK (OpenRouter API)
      // -----------------------------------------------------
      const mappedMessages = messages.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.content
      }));

      if (systemInstruction) {
        mappedMessages.unshift({ role: 'system', content: systemInstruction });
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'OpenKoma',
        },
        body: JSON.stringify({
          model: 'openrouter/auto', // Will choose the best model automatically based on user's OpenRouter setting
          messages: mappedMessages,
          stream: true,
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter Error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      if (!reader) throw new Error("No reader available");

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // keep incomplete line
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed === 'data: [DONE]') {
            onFinish();
            return;
          }
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                onChunk(data.choices[0].delta.content);
              }
            } catch (e) {
              // ignore parse errors for partial JSON chunks
            }
          }
        }
      }
      onFinish();

    } else {
      // -----------------------------------------------------
      // Free Fallback (Gemini API via Backend/Proxy simulation)
      // -----------------------------------------------------
      const contents = messages.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      let config: any = {};
      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents,
        config
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          onChunk(chunk.text);
        }
      }
      onFinish();
    }
  } catch (error: any) {
    console.error("AI Service Error:", error);
    onError(error.message || "An unexpected error occurred.");
  }
}
