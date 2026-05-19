import { useState } from 'react'
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
import { CodeHighlighter } from '@/components/CodeHighlighter'
import { useCodeGenerator } from '@/hooks/useCodeGenerator'
import type { CodeLanguage } from '@/services/codeGenerator'

interface CodePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenPanel?: () => void
}

export function CodePreviewDialog({
  open,
  onOpenChange,
  onOpenPanel,
}: CodePreviewDialogProps) {
  const [language, setLanguage] = useState<CodeLanguage>('sql')
  const { getCode } = useCodeGenerator()

  const code = getCode(language)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Code Preview</DialogTitle>
          <DialogDescription>
            Preview generated code in different languages and frameworks.
          </DialogDescription>
        </DialogHeader>

        {code ? (
          <div className="flex flex-col gap-4">
            <Select
              value={language}
              onValueChange={(val) => setLanguage(val as CodeLanguage)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sql">SQL</SelectItem>
                <SelectItem value="json">JSON Schema</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="python">Python (Pydantic)</SelectItem>
                <SelectItem value="go">Go</SelectItem>
                <SelectItem value="laravel">Laravel</SelectItem>
              </SelectContent>
            </Select>

            <div className="max-h-[400px] overflow-auto">
              <CodeHighlighter
                code={code.code}
                language={code.language}
                fileName={code.fileName}
              />
            </div>

            {onOpenPanel && (
              <Button
                onClick={onOpenPanel}
                variant="outline"
                className="w-full"
              >
                Open Full Editor
              </Button>
            )}
          </div>
        ) : (
          <div className="text-muted-foreground text-center text-sm">
            <p>
              No tables in your schema. Create some tables to generate code.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
