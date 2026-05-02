import { GoogleGenAI } from '@google/genai';
import { AIProvider, SendMessageParams, SendMessageCallbacks } from './types';

const geminiApiKey = process.env.GEMINI_API_KEY || '';

export class GeminiProvider implements AIProvider {
  async sendMessageStream(params: SendMessageParams, callbacks: SendMessageCallbacks): Promise<void> {
    const { onChunk, onFinish, onError } = callbacks;
    try {
      // Find last user message index for image attachment
      let lastUserIdx = -1;
      for (let i = params.messages.length - 1; i >= 0; i--) {
        if (params.messages[i].role !== 'model') { lastUserIdx = i; break; }
      }

      const contents = params.messages.map((msg, index) => {
        const parts: any[] = [{ text: msg.content }];
         
        if (params.imageBase64 && index === lastUserIdx) {
          const match = params.imageBase64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
          if (match) {
            parts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2]
              }
            });
          }
        }

        return {
          role: msg.role === 'model' ? 'model' : 'user',
          parts
        };
      });

      let config: any = {};
      if (params.systemInstruction) {
        config.systemInstruction = params.systemInstruction;
      }
      config.temperature = params.temperature;
      config.maxOutputTokens = params.maxTokens;

      const ai = new GoogleGenAI({ apiKey: params.apiKey || geminiApiKey });

      const responseStream = await ai.models.generateContentStream({
        model: params.modelId.includes('gemini') ? params.modelId : 'gemini-2.0-flash',
        contents,
        config
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          onChunk(chunk.text);
        }
      }
      onFinish();
    } catch (error: any) {
      console.error("Gemini Service Error:", error);
      onError(error.message || "An unexpected error occurred.");
    }
  }
}
