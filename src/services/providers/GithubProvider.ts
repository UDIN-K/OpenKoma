import { BaseOpenAIProvider } from './BaseOpenAIProvider';
import { SendMessageParams } from './types';

export class GithubProvider extends BaseOpenAIProvider {
  constructor() {
    super('github');
  }

  protected getBaseUrl(params: SendMessageParams): string {
    return 'https://models.inference.ai.azure.com/chat/completions';
  }
}
