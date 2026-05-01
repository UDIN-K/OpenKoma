import { BaseOpenAIProvider } from './BaseOpenAIProvider';
import { SendMessageParams } from './types';

export class GroqProvider extends BaseOpenAIProvider {
  constructor() {
    super('groq');
  }

  protected getBaseUrl(params: SendMessageParams): string {
    return 'https://api.groq.com/openai/v1/chat/completions';
  }
}
