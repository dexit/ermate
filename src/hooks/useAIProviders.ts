import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AIProvider } from '@/constants/ai-providers'

export interface AIProviderState {
  provider: AIProvider | null
  apiKey: string
  model: string
  setProvider: (provider: AIProvider) => void
  setApiKey: (apiKey: string) => void
  setModel: (model: string) => void
  clearProvider: () => void
  getApiKey: () => string | null
}

export const useAIProviderStore = create<AIProviderState>()(
  persist(
    (set, get) => ({
      provider: null,
      apiKey: '',
      model: '',
      setProvider: (provider) => set({ provider }),
      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
      clearProvider: () => set({ provider: null, apiKey: '', model: '' }),
      getApiKey: () => {
        const state = get()
        return state.apiKey || null
      },
    }),
    {
      name: 'ai-provider-store',
      partialize: (state) => ({
        provider: state.provider,
        apiKey: state.apiKey,
        model: state.model,
      }),
    }
  )
)

export const useAIProviders = () => {
  const store = useAIProviderStore()
  return {
    provider: store.provider,
    apiKey: store.apiKey,
    model: store.model,
    setProvider: store.setProvider,
    setApiKey: store.setApiKey,
    setModel: store.setModel,
    clearProvider: store.clearProvider,
    hasValidProvider: () =>
      store.provider !== null && store.apiKey.trim() !== '',
    getApiKey: store.getApiKey,
  }
}
