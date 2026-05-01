import { BaseOpenAIProvider } from './BaseOpenAIProvider';
import { SendMessageParams } from './types';

// Vision model used to describe images for non-vision models
const VISION_FALLBACK_MODEL = 'google/gemini-2.0-flash-lite-preview-02-05:free';

/**
 * Use a free vision model on OpenRouter to describe/OCR an image,
 * so that any text-only model can still "read" the image content.
 */
async function describeImageViaVision(
  imageBase64: string,
  userPrompt: string,
  apiKey: string
): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
      'X-Title': 'OpenKoma',
    },
    body: JSON.stringify({
      model: VISION_FALLBACK_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Please carefully look at this image and provide a detailed description of ALL text, numbers, mathematical formulas, symbols, tables, and visual content you see. Be extremely precise with any math notation — use LaTeX format. Also describe the overall layout.\n\nUser's question about this image: "${userPrompt}"`
            },
            {
              type: 'image_url',
              image_url: { url: imageBase64 }
            }
          ]
        }
      ],
      temperature: 0.2,
      max_tokens: 2048,
      stream: false,
    })
  });

  if (!response.ok) {
    let errorText = response.statusText;
    try {
      const errData = await response.json();
      errorText = errData.error?.message || JSON.stringify(errData);
    } catch (e) { /* fallback */ }
    throw new Error(`Vision fallback error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '[Could not describe image]';
}

export class OpenRouterProvider extends BaseOpenAIProvider {
  constructor() {
    super('openrouter');
  }

  protected getBaseUrl(params: SendMessageParams): string {
    if (!params.apiKey) {
      throw new Error("OpenRouter requires an API Key. Please add one in Settings.");
    }
    return 'https://openrouter.ai/api/v1/chat/completions';
  }

  protected async handleFailedResponse(
    response: Response,
    params: SendMessageParams,
    baseUrl: string,
    headers: Record<string, string>
  ): Promise<Response> {
    const useVisionFormat = !!params.imageBase64;
    
    // If model doesn't support image, fallback: describe image then retry as text
    if (!response.ok && useVisionFormat) {
      let errorText = '';
      try {
        const errClone = response.clone();
        const errData = await errClone.json();
        errorText = errData.error?.message || '';
      } catch (e) { /* ignore */ }

      const isImageUnsupported =
        response.status === 404 ||
        errorText.toLowerCase().includes('image') ||
        errorText.toLowerCase().includes('vision') ||
        errorText.toLowerCase().includes('endpoint');

      if (isImageUnsupported && params.imageBase64) {
        
        let lastUserMsgIndex = -1;
        for (let i = params.messages.length - 1; i >= 0; i--) {
          if (params.messages[i].role !== 'model') { lastUserMsgIndex = i; break; }
        }
        const lastUserMsg = params.messages[lastUserMsgIndex];
        
        // Let's use the describe fallback
        const imageDescription = await describeImageViaVision(
          params.imageBase64,
          lastUserMsg?.content || 'Describe this image',
          params.apiKey || ''
        );

        // Rebuild messages as text-only, injecting the image description
        let mappedMessages = params.messages.map((m, index) => {
          let content = m.content;
          if (index === lastUserMsgIndex) {
            content = `${m.content}\n\n[Image Analysis from Vision AI]:\n${imageDescription}`;
          }
          return {
            role: m.role === 'model' ? 'assistant' : 'user',
            content
          };
        });

        if (params.systemInstruction) {
          mappedMessages.unshift({ role: 'system', content: params.systemInstruction });
        }

        // Retry with text-only payload
        return await fetch(baseUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: params.modelId,
            messages: mappedMessages,
            temperature: params.temperature,
            max_tokens: params.maxTokens,
            stream: true,
          })
        });
      }
    }
    return response;
  }
}
