import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { Button } from '@/components/ui/button'
import { CopyIcon, DownloadIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface CodeHighlighterProps {
  code: string
  language: string
  fileName?: string
  className?: string
}

export function CodeHighlighter({
  code,
  language,
  fileName = 'code',
  className = '',
}: CodeHighlighterProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([code], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = fileName
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success('Downloaded')
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground font-mono text-xs">
          {language.toUpperCase()}
        </span>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-8 w-8 p-0"
            title="Copy code"
          >
            <CopyIcon className={`h-4 w-4 ${copied ? 'text-green-500' : ''}`} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            className="h-8 w-8 p-0"
            title="Download code"
          >
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="border-border bg-background overflow-auto rounded border">
        <SyntaxHighlighter
          language={language}
          style={atomOneDark}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            backgroundColor: 'transparent',
          }}
          wrapLines
          wrapLongLines
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
