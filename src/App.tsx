import { SchemaCanvas } from '@/components/canvas/SchemaCanvas'
import { Toolbar } from '@/components/canvas/Toolbar'
import { PromptBar } from '@/components/chat/PromptBar'
import { LogBar } from '@/components/panels/LogBar'
import { RelationshipEditor } from '@/components/panels/RelationshipEditor'
import { TableEditor } from '@/components/panels/TableEditor'
import { CodeGeneratorPanel } from '@/components/panels/CodeGeneratorPanel'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useShareUrl } from '@/hooks/useShareUrl'
import { useTheme } from '@/hooks/useTheme'
import { ReactFlowProvider } from '@xyflow/react'
import { useState } from 'react'

function AppInner() {
  const [codeGeneratorOpen, setCodeGeneratorOpen] = useState(false)

  useAutoSave()
  useShareUrl()
  useKeyboardShortcuts()

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] supports-[height:1dvh]:h-dvh">
      <div className="relative flex min-h-0 flex-1">
        <div className="flex-1 overflow-hidden">
          <Toolbar
            onCodeGeneratorToggle={() =>
              setCodeGeneratorOpen(!codeGeneratorOpen)
            }
          />
          <SchemaCanvas />
          <PromptBar />
          <TableEditor />
          <RelationshipEditor />
        </div>
        <CodeGeneratorPanel
          isOpen={codeGeneratorOpen}
          onToggle={() => setCodeGeneratorOpen(!codeGeneratorOpen)}
        />
      </div>
      <LogBar />
    </div>
  )
}

function App() {
  const { theme } = useTheme()

  return (
    <TooltipProvider>
      <ReactFlowProvider>
        <AppInner />
        <Toaster position="top-center" richColors theme={theme} />
      </ReactFlowProvider>
    </TooltipProvider>
  )
}

export default App
