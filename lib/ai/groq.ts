import Groq from 'groq-sdk';

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const AVAILABLE_MODELS = [
  { id: 'llama3-70b-8192', name: 'Llama 3 70B', contextWindow: 8192 },
  { id: 'llama3-8b-8192', name: 'Llama 3 8B (Fast)', contextWindow: 8192 },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', contextWindow: 32768 },
  { id: 'gemma-7b-it', name: 'Gemma 7B', contextWindow: 8192 },
] as const;

export const SYSTEM_PROMPT = `You are EQUINOX, a sophisticated and powerful AI assistant. You are helpful, precise, and knowledgeable. You format your responses using Markdown when appropriate. For code, always use fenced code blocks with the appropriate language identifier. Be concise but thorough. Do not add unnecessary filler phrases.`;
