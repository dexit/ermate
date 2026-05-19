import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CodeHighlighter } from '@/components/CodeHighlighter'
import { useCodeGenerator } from '@/hooks/useCodeGenerator'
import { ChevronRightIcon, ChevronLeftIcon } from 'lucide-react'
import { useSchemaStore } from '@/hooks/useSchemaStore'
import { downloadLaravelProject } from '@/services/phpProjectGenerator'
import type { CodeLanguage } from '@/services/codeGenerator'

interface CodeGeneratorPanelProps {
  isOpen: boolean
  onToggle: () => void
}

const LANGUAGES: { value: CodeLanguage; label: string }[] = [
  { value: 'sql', label: 'SQL' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'go', label: 'Go' },
  { value: 'laravel', label: 'Laravel' },
  { value: 'json', label: 'JSON' },
]

export function CodeGeneratorPanel({
  isOpen,
  onToggle,
}: CodeGeneratorPanelProps) {
  const [activeTab, setActiveTab] = useState<CodeLanguage>('sql')
  const { generatedCode, hasCode } = useCodeGenerator()
  const schema = useSchemaStore((s) => s.schema)

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        size="icon"
        variant="ghost"
        className="border-border absolute top-1/2 right-0 -translate-y-1/2 rounded-l-lg border border-r-0"
        title="Open code generator"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <div className="border-border bg-background flex h-full w-96 flex-col border-l">
      <div className="border-border flex items-center justify-between border-b px-4 py-3">
        <h2 className="font-semibold">Code Generator</h2>
        <Button onClick={onToggle} size="icon" variant="ghost">
          <ChevronRightIcon className="h-5 w-5" />
        </Button>
      </div>

      {hasCode ? (
        <>
          <div className="border-border flex gap-1 border-b px-2 py-2">
            {LANGUAGES.map(({ value, label }) => (
              <Button
                key={value}
                size="sm"
                variant={activeTab === value ? 'default' : 'ghost'}
                onClick={() => setActiveTab(value)}
                className="h-8 text-xs"
              >
                {label}
              </Button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-4">
            {generatedCode && (
              <CodeHighlighter
                code={generatedCode[activeTab].code}
                language={generatedCode[activeTab].language}
                fileName={generatedCode[activeTab].fileName}
                onDownloadZip={
                  activeTab === 'laravel'
                    ? async () =>
                        downloadLaravelProject(schema.tables, 'laravel-app')
                    : undefined
                }
              />
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center px-4 text-center">
          <div className="text-muted-foreground text-sm">
            <p className="font-medium">No tables yet</p>
            <p className="text-xs">Create tables to generate code</p>
          </div>
        </div>
      )}
    </div>
  )
}
