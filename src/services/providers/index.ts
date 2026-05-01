import { AIProvider } from './types';
import { OpenRouterProvider } from './OpenRouterProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { GroqProvider } from './GroqProvider';
import { HuggingFaceProvider } from './HuggingFaceProvider';
import { OllamaProvider } from './OllamaProvider';
import { GeminiProvider } from './GeminiProvider';
import { CohereProvider } from './CohereProvider';
import { GithubProvider } from './GithubProvider';
import { GithubCopilotProvider } from './GithubCopilotProvider';

export function getProvider(providerId: string): AIProvider | null {
  switch (providerId) {
    case 'openrouter': return new OpenRouterProvider();
    case 'openai': return new OpenAIProvider();
    case 'groq': return new GroqProvider();
    case 'huggingface': return new HuggingFaceProvider();
    case 'ollama': return new OllamaProvider();
    case 'gemini': return new GeminiProvider();
    case 'cohere': return new CohereProvider();
    case 'github': return new GithubProvider();
    case 'github_copilot': return new GithubCopilotProvider();
    default:
      // Try fallback to something reasonable
      return new OpenRouterProvider();
  }
}
