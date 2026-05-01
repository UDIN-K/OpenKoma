import { BaseOpenAIProvider } from './BaseOpenAIProvider';
import { SendMessageParams } from './types';

export class OpenAIProvider extends BaseOpenAIProvider {
  constructor() {
    super('openai');
  }

  protected getBaseUrl(params: SendMessageParams): string {
    return 'https://api.openai.com/v1/chat/completions';
  }
}
