export const AI_PROVIDERS = [
  { id: 'openrouter', name: 'OpenRouter', icon: '🌐', desc: 'Access 100+ models. Free & paid models.', free: true },
  { id: 'gemini', name: 'Google Gemini', icon: '🔵', desc: 'Google\'s Gemini 1.5 Pro & Flash.', free: true },
  { id: 'openai', name: 'OpenAI', icon: '🟢', desc: 'GPT-4o, GPT-4o-mini, o1. Requires key.', free: false },
  { id: 'anthropic', name: 'Anthropic', icon: '🟠', desc: 'Claude 3.5 Sonnet, Claude 3 Opus.', free: false },
  { id: 'groq', name: 'Groq', icon: '🔴', desc: 'Ultra-fast inference. Free tier available.', free: true },
  { id: 'ollama', name: 'Ollama (Local)', icon: '🟣', desc: 'Run AI models locally. Completely free.', free: true },
];

export const AI_MODELS: Record<string, { id: string, name: string, type: 'free' | 'premium', desc: string, cost: string }[]> = {
  openrouter: [
    { id: 'meta-llama/llama-3-8b-instruct:free', name: 'Llama 3 8B Instruct', type: 'free', desc: 'Fast & capable for everyday tasks', cost: 'Free' },
    { id: 'google/gemini-flash-1.5-8b', name: 'Gemini Flash 1.5', type: 'free', desc: 'Google\'s lightweight model', cost: 'Free' },
    { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B', type: 'free', desc: 'Great for European languages', cost: 'Free' },
    { id: 'qwen/qwen-2-7b-instruct:free', name: 'Qwen 2 7B', type: 'free', desc: 'Strong multilingual support', cost: 'Free' },
    { id: 'openai/gpt-4o', name: 'GPT-4o', type: 'premium', desc: 'Most capable OpenAI model', cost: '$5.00/1M' },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', type: 'premium', desc: 'Best for writing & analysis', cost: '$3.00/1M' },
    { id: 'google/gemini-1.5-pro', name: 'Gemini 1.5 Pro', type: 'premium', desc: 'Large context window (1M tokens)', cost: '$7.00/1M' },
    { id: 'meta-llama/llama-3.1-405b', name: 'Llama 3.1 405B', type: 'premium', desc: 'Largest open-source model', cost: '$3.00/1M' },
  ],
  gemini: [
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', type: 'premium', desc: 'Google\'s most capable model', cost: 'Free quota' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', type: 'free', desc: 'Fast and versatile', cost: 'Free quota' },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', type: 'premium', desc: 'Most capable OpenAI model', cost: 'Paid' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', type: 'premium', desc: 'Fast and affordable', cost: 'Paid' },
  ],
  anthropic: [
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', type: 'premium', desc: 'Fast and capable', cost: 'Paid' },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', type: 'premium', desc: 'Powerful and detailed', cost: 'Paid' },
  ],
  groq: [
    { id: 'llama3-8b-8192', name: 'Llama 3 8B', type: 'free', desc: 'Ultra-fast inference', cost: 'Free' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', type: 'free', desc: 'Fast MoE model', cost: 'Free' },
  ],
  ollama: [
    { id: 'llama3', name: 'Llama 3', type: 'free', desc: 'Local Llama 3 8B', cost: 'Free' },
    { id: 'mistral', name: 'Mistral', type: 'free', desc: 'Local Mistral 7B', cost: 'Free' },
  ]
};

export function getProviderName(providerId: string): string {
  return AI_PROVIDERS.find(p => p.id === providerId)?.name || 'Unknown';
}

export function isProviderFree(providerId: string): boolean {
  return AI_PROVIDERS.find(p => p.id === providerId)?.free || false;
}
