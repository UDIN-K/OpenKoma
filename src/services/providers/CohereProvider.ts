import { BaseOpenAIProvider } from './BaseOpenAIProvider';
import { SendMessageParams } from './types';

export class CohereProvider extends BaseOpenAIProvider {
  constructor() {
    super('cohere');
  }

  protected getBaseUrl(params: SendMessageParams): string {
    if (!params.apiKey) {
      throw new Error("Cohere requires an API Key. Please add one in Settings.");
    }
    const rawUrl = 'https://api.cohere.com/v1/chat/completions';
    return `https://corsproxy.io/?url=${encodeURIComponent(rawUrl)}`;
  }
}
