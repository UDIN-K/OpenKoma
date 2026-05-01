import { GoogleGenAI } from '@google/genai';
import { Message } from '../types';

const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: geminiApiKey || '' });

// Vision model used to describe images for non-vision models
const VISION_FALLBACK_MODEL = 'google/gemma-4-31b-it:free';

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

export async function sendMessageStream(
  messages: Message[],
  openRouterKey: string | null,
  modelId: string,
  temperature: number,
  maxTokens: number,
  onChunk: (text: string) => void,
  onFinish: () => void,
  onError: (msg: string) => void,
  systemInstruction?: string,
  imageBase64?: string | null
) {
  try {
    if (openRouterKey) {
      // -----------------------------------------------------
      // Premium / BYOK (OpenRouter API)
      // -----------------------------------------------------

      // Find the index of the last user message to attach the image to
      let lastUserMsgIndex = -1;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role !== 'model') { lastUserMsgIndex = i; break; }
      }

      // Prepare messages — try vision format first
      let mappedMessages: any[];
      let useVisionFormat = !!imageBase64;

      if (useVisionFormat) {
        mappedMessages = messages.map((m, index) => {
          if (index === lastUserMsgIndex) {
            return {
              role: 'user',
              content: [
                { type: "text", text: m.content },
                { type: "image_url", image_url: { url: imageBase64 } }
              ]
            };
          }
          return {
            role: m.role === 'model' ? 'assistant' : 'user',
            content: m.content
          };
        });
      } else {
        mappedMessages = messages.map(m => ({
          role: m.role === 'model' ? 'assistant' : 'user',
          content: m.content
        }));
      }

      if (systemInstruction) {
        mappedMessages.unshift({ role: 'system', content: systemInstruction });
      }

      // First attempt
      let response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'OpenKoma',
        },
        body: JSON.stringify({
          model: modelId,
          messages: mappedMessages,
          temperature,
          max_tokens: maxTokens,
          stream: true,
        })
      });

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

        if (isImageUnsupported && imageBase64) {
          // Use vision fallback model to describe the image
          const lastUserMsg = messages[lastUserMsgIndex];
          const imageDescription = await describeImageViaVision(
            imageBase64,
            lastUserMsg?.content || 'Describe this image',
            openRouterKey
          );

          // Rebuild messages as text-only, injecting the image description
          mappedMessages = messages.map((m, index) => {
            let content = m.content;
            if (index === lastUserMsgIndex) {
              content = `${m.content}\n\n[Image Analysis from Vision AI]:\n${imageDescription}`;
            }
            return {
              role: m.role === 'model' ? 'assistant' : 'user',
              content
            };
          });

          if (systemInstruction) {
            mappedMessages.unshift({ role: 'system', content: systemInstruction });
          }

          // Retry with text-only payload
          response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openRouterKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
              'X-Title': 'OpenKoma',
            },
            body: JSON.stringify({
              model: modelId,
              messages: mappedMessages,
              temperature,
              max_tokens: maxTokens,
              stream: true,
            })
          });
        }
      }

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
        throw new Error(`OpenRouter Error: ${response.status} - ${errorText}`);
      }

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

    } else {
      // -----------------------------------------------------
      // Free Fallback (Gemini API via Backend/Proxy simulation)
      // -----------------------------------------------------
      // Find last user message index for image attachment
      let lastUserIdx = -1;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role !== 'model') { lastUserIdx = i; break; }
      }

      const contents = messages.map((msg, index) => {
         const parts: any[] = [{ text: msg.content }];
         
         if (imageBase64 && index === lastUserIdx) {
            const match = imageBase64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
            if (match) {
               parts.push({
                 inlineData: {
                   mimeType: match[1],
                   data: match[2]
                 }
               });
            }
         }

         return {
           role: msg.role === 'model' ? 'model' : 'user',
           parts
         };
      });

      let config: any = {};
      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }

      const responseStream = await ai.models.generateContentStream({
        model: modelId.includes('gemini') ? 'gemini-1.5-flash' : 'gemini-1.5-flash',
        contents,
        config: { ...config, temperature, maxOutputTokens: maxTokens }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          onChunk(chunk.text);
        }
      }
      onFinish();
    }
  } catch (error: any) {
    console.error("AI Service Error:", error);
    onError(error.message || "An unexpected error occurred.");
  }
}
