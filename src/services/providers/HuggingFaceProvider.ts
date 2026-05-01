import { BaseOpenAIProvider } from './BaseOpenAIProvider';
import { SendMessageParams } from './types';

export class HuggingFaceProvider extends BaseOpenAIProvider {
  constructor() {
    super('huggingface');
  }

  protected getBaseUrl(params: SendMessageParams): string {
    if (!params.apiKey) {
      throw new Error("Hugging Face API requires an API Key. Please add one in Settings.");
    }
    return `https://api-inference.huggingface.co/models/${params.modelId}/v1/chat/completions`;
  }
}
