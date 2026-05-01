import { Message } from '../types';
import { getProvider } from './providers';

export async function sendMessageStream(
  messages: Message[],
  apiKey: string | null,
  providerId: string,
  modelId: string,
  temperature: number,
  maxTokens: number,
  onChunk: (text: string) => void,
  onFinish: () => void,
  onError: (msg: string) => void,
  systemInstruction?: string,
  imageBase64?: string | null,
  ollamaUrl: string = 'http://localhost:11434'
) {
  try {
    const provider = getProvider(providerId);

    if (!provider) {
      throw new Error(`Provider ${providerId} is not supported.`);
    }

    // Default API keys check logic can be kept if we want generic fallback,
    // but the getProvider handles finding the right provider.
    // If we use gemini and no api key is given, it gracefully falls back to the system's gemini instance
    // in GeminiProvider (using process.env.GEMINI_API_KEY).
    
    // For other providers without an API key, unless it's ollama or huggingface
    // they usually fail, but if we wanted a fallback to Gemini for free models if no key:
    if (!apiKey && providerId !== 'gemini' && providerId !== 'ollama' && providerId !== 'huggingface' && providerId !== 'groq') {
       // Free Fallback if user didn't set key and it's a provider that requires it
       // Let's reroute to GeminiProvider
       const fallbackProvider = getProvider('gemini');
       if (fallbackProvider) {
          console.warn(`No API key provided for ${providerId}, falling back to built-in Gemini proxy.`);
          await fallbackProvider.sendMessageStream({
            messages, apiKey: null, modelId, temperature, maxTokens, systemInstruction, imageBase64, ollamaUrl
          }, { onChunk, onFinish, onError });
          return;
       }
    }

    await provider.sendMessageStream({
      messages,
      apiKey,
      modelId,
      temperature,
      maxTokens,
      systemInstruction,
      imageBase64,
      ollamaUrl
    }, {
      onChunk,
      onFinish,
      onError
    });
  } catch (error: any) {
    console.error("AI Service Error:", error);
    onError(error.message || "An unexpected error occurred.");
  }
}
