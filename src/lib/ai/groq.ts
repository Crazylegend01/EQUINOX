import Groq from 'groq-sdk';
import type { Attachment, AIModel } from '@/types';

export const AVAILABLE_MODELS: { id: AIModel; name: string; contextWindow: number }[] = [
  { id: 'llama3-70b-8192',   name: 'Llama 3 70B',       contextWindow: 8192  },
  { id: 'llama3-8b-8192',    name: 'Llama 3 8B (Fast)',  contextWindow: 8192  },
  { id: 'mixtral-8x7b-32768',name: 'Mixtral 8x7B',       contextWindow: 32768 },
  { id: 'gemma-7b-it',       name: 'Gemma 7B',           contextWindow: 8192  },
];

export const SYSTEM_PROMPT = `You are EQUINOX, a sophisticated and powerful AI assistant. You are helpful, precise, and knowledgeable. Format responses in Markdown. Use fenced code blocks with language identifiers for code. Be concise yet thorough.`;

function getClient() {
  return new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true,
  });
}

export interface GroqMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function streamChat(
  messages: GroqMessage[],
  model: AIModel,
  attachments: Attachment[],
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (err: Error) => void
) {
  const groq = getClient();
  const imageAtts = attachments.filter(a => a.type === 'image');
  const fileAtts  = attachments.filter(a => a.type !== 'image');
  const fileNote  = fileAtts.length ? `\n\n[Attached files: ${fileAtts.map(f => f.name).join(', ')}]` : '';

  type Part = Groq.Chat.ChatCompletionContentPartText | Groq.Chat.ChatCompletionContentPartImage;

  const groqMessages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.slice(0, -1).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  ];

  const lastMsg = messages[messages.length - 1];

  if (imageAtts.length > 0) {
    const parts: Part[] = [
      { type: 'text', text: (lastMsg.content || 'Describe this image.') + fileNote },
      ...imageAtts.map((img): Part => ({
        type: 'image_url',
        image_url: { url: img.url },
      })),
    ];
    groqMessages.push({ role: 'user', content: parts });
  } else {
    groqMessages.push({ role: 'user', content: lastMsg.content + fileNote });
  }

  try {
    const actualModel = imageAtts.length > 0 ? 'llava-v1.5-7b-4096-preview' : model;
    const stream = await groq.chat.completions.create({
      model: actualModel,
      messages: groqMessages,
      stream: true,
      max_tokens: 4096,
      temperature: 0.7,
    });

    let full = '';
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? '';
      full += delta;
      onChunk(full);
    }
    onDone(full);
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}
