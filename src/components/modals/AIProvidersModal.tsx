import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AI_PROVIDER_CONFIGS,
  PROVIDER_OPTIONS,
  type AIProvider,
} from '@/constants/ai-providers'
import { useAIProviders } from '@/hooks/useAIProviders'

interface AIProvidersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AIProvidersModal({
  open,
  onOpenChange,
}: AIProvidersModalProps) {
  const { provider, apiKey, model, setProvider, setApiKey, setModel } =
    useAIProviders()

  const [showApiKey, setShowApiKey] = useState(false)
  const [tempApiKey, setTempApiKey] = useState(apiKey)
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(
    provider
  )
  const [selectedModel, setSelectedModel] = useState(
    model || (provider ? AI_PROVIDER_CONFIGS[provider].defaultModel : '')
  )

  const currentConfig = selectedProvider
    ? AI_PROVIDER_CONFIGS[selectedProvider]
    : null

  const handleProviderChange = (value: string) => {
    const newProvider = value as AIProvider
    setSelectedProvider(newProvider)
    setSelectedModel(AI_PROVIDER_CONFIGS[newProvider].defaultModel)
  }

  const handleSave = () => {
    if (!selectedProvider || !tempApiKey.trim()) {
      alert('Please select a provider and enter an API key')
      return
    }

    setProvider(selectedProvider)
    setApiKey(tempApiKey)
    setModel(selectedModel)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setTempApiKey(apiKey)
    setSelectedProvider(provider)
    setSelectedModel(
      model || (provider ? AI_PROVIDER_CONFIGS[provider].defaultModel : '')
    )
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>AI Provider Configuration</DialogTitle>
          <DialogDescription>
            Configure your AI provider and API credentials to enable AI features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">AI Provider</Label>
            <Select
              value={selectedProvider || ''}
              onValueChange={handleProviderChange}
            >
              <SelectTrigger id="provider">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {PROVIDER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentConfig && (
              <p className="text-muted-foreground text-xs">
                {currentConfig.description}
              </p>
            )}
          </div>

          {/* Model Selection */}
          {currentConfig && (
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {currentConfig.models.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* API Key Input */}
          {currentConfig && (
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  placeholder={currentConfig.apiKeyPlaceholder}
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                  aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-muted-foreground text-xs">
                Your API key is stored securely in your browser&apos;s local
                storage
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!selectedProvider}>
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
