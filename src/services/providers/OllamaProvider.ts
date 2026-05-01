import { BaseOpenAIProvider } from './BaseOpenAIProvider';
import { SendMessageParams } from './types';

export class OllamaProvider extends BaseOpenAIProvider {
  constructor() {
    super('ollama');
  }

  protected getBaseUrl(params: SendMessageParams): string {
    const url = params.ollamaUrl || 'http://localhost:11434';
    return `${url.replace(/\/$/, '')}/v1/chat/completions`;
  }
}
