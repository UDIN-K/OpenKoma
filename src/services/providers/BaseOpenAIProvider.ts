import { AIProvider, SendMessageParams, SendMessageCallbacks } from './types';

export class BaseOpenAIProvider implements AIProvider {
  protected providerId: string;

  constructor(providerId: string) {
    this.providerId = providerId;
  }

  // Override this in subclasses if needed
  protected getBaseUrl(params: SendMessageParams): string {
    return '';
  }

  protected getHeaders(params: SendMessageParams): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
      'X-Title': 'OpenKoma',
    };
    if (params.apiKey) {
      headers['Authorization'] = `Bearer ${params.apiKey}`;
    }
    return headers;
  }

  protected mapMessages(params: SendMessageParams): any[] {
    let lastUserMsgIndex = -1;
    for (let i = params.messages.length - 1; i >= 0; i--) {
      if (params.messages[i].role !== 'model') { lastUserMsgIndex = i; break; }
    }

    const useVisionFormat = !!params.imageBase64;

    let mappedMessages = params.messages.map((m, index) => {
      if (useVisionFormat && index === lastUserMsgIndex) {
        return {
          role: 'user',
          content: [
            { type: 'text', text: m.content },
            { type: 'image_url', image_url: { url: params.imageBase64 } }
          ]
        };
      }
      return {
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.content
      };
    });

    if (params.systemInstruction) {
      mappedMessages.unshift({ role: 'system', content: params.systemInstruction });
    }

    return mappedMessages;
  }

  async sendMessageStream(params: SendMessageParams, callbacks: SendMessageCallbacks): Promise<void> {
    const { onChunk, onFinish, onError } = callbacks;

    try {
      const baseUrl = this.getBaseUrl(params);
      const headers = this.getHeaders(params);
      const messages = this.mapMessages(params);

      let response = await fetch(baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: params.modelId,
          messages,
          temperature: params.temperature,
          max_tokens: params.maxTokens,
          stream: true,
        })
      });

      response = await this.handleFailedResponse(response, params, baseUrl, headers);

      if (!response.ok) {
        let errorText = response.statusText;
        try {
          const errData = await response.json();
          if (errData.error && errData.error.message) {
            errorText = errData.error.message;
          } else {
            errorText = JSON.stringify(errData);
          }
        } catch (e) {
          // fallback to statusText if not json
        }
        throw new Error(`API Error (${this.providerId}): ${response.status} - ${errorText}`);
      }

      await this.streamResponse(response, onChunk, onFinish);
    } catch (error: any) {
      console.error(`${this.providerId} Service Error:`, error);
      onError(error.message || "An unexpected error occurred.");
    }
  }

  protected async handleFailedResponse(
    response: Response, 
    params: SendMessageParams,
    baseUrl: string,
    headers: Record<string, string>
  ): Promise<Response> {
    // Override in subclass (e.g. OpenRouter) to handle vision fallback
    return response;
  }

  private async streamResponse(response: Response, onChunk: (text: string) => void, onFinish: () => void) {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    if (!reader) throw new Error("No reader available");

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // keep incomplete line
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === 'data: [DONE]') {
          onFinish();
          return;
        }
        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
              onChunk(data.choices[0].delta.content);
            }
          } catch (e) {
            // ignore parse errors for partial JSON chunks
          }
        }
      }
    }
    onFinish();
  }
}
