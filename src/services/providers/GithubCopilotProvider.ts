import { BaseOpenAIProvider } from './BaseOpenAIProvider';
import { SendMessageParams, SendMessageCallbacks } from './types';

export class GithubCopilotProvider extends BaseOpenAIProvider {
  constructor() {
    super('github_copilot');
  }

  protected getBaseUrl(params: SendMessageParams): string {
    return 'https://api.githubcopilot.com/chat/completions';
  }
}
