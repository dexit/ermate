export const AI_PROVIDERS = {
  GEMINI: 'gemini',
  OPENROUTER: 'openrouter',
  CLAUDE: 'claude',
  OPENAI: 'openai',
} as const

export type AIProvider = (typeof AI_PROVIDERS)[keyof typeof AI_PROVIDERS]

export interface AIProviderConfig {
  id: AIProvider
  name: string
  description: string
  models: string[]
  defaultModel: string
  apiKeyPlaceholder: string
  docsUrl: string
}

export const AI_PROVIDER_CONFIGS: Record<AIProvider, AIProviderConfig> = {
  [AI_PROVIDERS.GEMINI]: {
    id: AI_PROVIDERS.GEMINI,
    name: 'Google Gemini',
    description: 'Google&apos;s advanced AI model with multimodal capabilities',
    models: [
      'gemini-2.0-flash',
      'gemini-2.0-flash-thinking-exp',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
    ],
    defaultModel: 'gemini-2.0-flash',
    apiKeyPlaceholder: 'Enter your Google Gemini API key',
    docsUrl: 'https://ai.google.dev/docs',
  },
  [AI_PROVIDERS.OPENROUTER]: {
    id: AI_PROVIDERS.OPENROUTER,
    name: 'OpenRouter (Free)',
    description: 'Access multiple models including free tier options',
    models: [
      'openrouter/auto',
      'meta-llama/llama-2-7b-chat',
      'meta-llama/llama-3-8b-instruct',
      'meta-llama/llama-3.1-8b-instruct',
      'mistralai/mistral-7b-instruct',
      'google/gemma-7b-it',
      'nvidia/llama-3-8b-instruct',
    ],
    defaultModel: 'openrouter/auto',
    apiKeyPlaceholder: 'Enter your OpenRouter API key',
    docsUrl: 'https://openrouter.ai/docs',
  },
  [AI_PROVIDERS.CLAUDE]: {
    id: AI_PROVIDERS.CLAUDE,
    name: 'Anthropic Claude',
    description: 'Claude family of models with strong reasoning capabilities',
    models: [
      'claude-opus-4-1',
      'claude-opus',
      'claude-sonnet-4-20250514',
      'claude-sonnet',
      'claude-haiku-3-5',
      'claude-haiku',
    ],
    defaultModel: 'claude-opus-4-1',
    apiKeyPlaceholder: 'Enter your Anthropic API key',
    docsUrl: 'https://docs.anthropic.com',
  },
  [AI_PROVIDERS.OPENAI]: {
    id: AI_PROVIDERS.OPENAI,
    name: 'OpenAI',
    description: 'OpenAI&apos;s GPT models and other advanced AI systems',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'gpt-4o-mini'],
    defaultModel: 'gpt-4o',
    apiKeyPlaceholder: 'Enter your OpenAI API key',
    docsUrl: 'https://platform.openai.com/docs',
  },
}

export const PROVIDER_OPTIONS = Object.values(AI_PROVIDER_CONFIGS).map(
  (config) => ({
    value: config.id,
    label: config.name,
  })
)
