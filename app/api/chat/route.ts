import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { SYSTEM_PROMPT } from '@/lib/ai/groq';
import { Attachment } from '@/types';

export const runtime = 'nodejs';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages, model = 'llama3-70b-8192', attachments = [] } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    // Build message content — include attachment context
    const lastUserMsg = messages[messages.length - 1];
    const imageAttachments = (attachments as Attachment[]).filter((a) => a.type === 'image');
    const fileAttachments = (attachments as Attachment[]).filter((a) => a.type !== 'image');

    // Build context for non-image files
    let fileContext = '';
    if (fileAttachments.length > 0) {
      fileContext = `\n\n[User attached: ${fileAttachments.map((a) => `${a.name} (${a.type})`).join(', ')}]`;
    }

    // Construct messages for Groq
    const groqMessages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.slice(0, -1).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    // For image attachments, use vision-capable approach
    if (imageAttachments.length > 0) {
      const contentParts: Groq.Chat.ChatCompletionContentPart[] = [
        { type: 'text', text: (lastUserMsg.content || 'Describe this image') + fileContext },
        ...imageAttachments.map((img): Groq.Chat.ChatCompletionContentPart => ({
          type: 'image_url',
          image_url: { url: img.url },
        })),
      ];
      groqMessages.push({ role: 'user', content: contentParts });
    } else {
      groqMessages.push({
        role: 'user',
        content: lastUserMsg.content + fileContext,
      });
    }

    const stream = await groq.chat.completions.create({
      model: imageAttachments.length > 0 ? 'llava-v1.5-7b-4096-preview' : model,
      messages: groqMessages,
      stream: true,
      max_tokens: 4096,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const data = JSON.stringify(chunk);
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
