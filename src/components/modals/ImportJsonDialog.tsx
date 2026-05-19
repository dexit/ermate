import { useState, useRef } from 'react'
import { Upload, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { parseJsonPayload, type ParsedTable } from '@/services/json-parser'
import { useSchemaStore } from '@/hooks/useSchemaStore'

interface ImportJsonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportJsonDialog({
  open,
  onOpenChange,
}: ImportJsonDialogProps) {
  const { addTable } = useSchemaStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [jsonText, setJsonText] = useState('')
  const [tableName, setTableName] = useState('')
  const [parsedTable, setParsedTable] = useState<ParsedTable | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'input' | 'upload'>('input')

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError('')

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const name = file.name.replace('.json', '')
        setJsonText(content)
        setTableName(name)

        const parsed = parseJsonPayload(content, name)
        setParsedTable(parsed)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to parse JSON file'
        )
        setParsedTable(null)
      } finally {
        setIsLoading(false)
      }
    }

    reader.onerror = () => {
      setError('Failed to read file')
      setIsLoading(false)
    }

    reader.readAsText(file)
  }

  const handlePasteJson = () => {
    if (!jsonText.trim()) {
      setError('Please paste JSON content')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const name = tableName || 'imported_table'
      const parsed = parseJsonPayload(jsonText, name)
      setParsedTable(parsed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse JSON')
      setParsedTable(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = () => {
    if (!parsedTable) {
      setError('No table data to import')
      return
    }

    try {
      addTable(parsedTable)
      setError('')
      setJsonText('')
      setTableName('')
      setParsedTable(null)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import table')
    }
  }

  const handleClear = () => {
    setJsonText('')
    setTableName('')
    setParsedTable(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Import Table from JSON</DialogTitle>
          <DialogDescription>
            Import table schema and data from JSON payload or file
          </DialogDescription>
        </DialogHeader>

        {/* Mode Toggle */}
        <div className="flex gap-2 border-b">
          <Button
            variant={mode === 'input' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('input')}
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent"
          >
            Paste JSON
          </Button>
          <Button
            variant={mode === 'upload' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('upload')}
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent"
          >
            Upload File
          </Button>
        </div>

        {/* Paste JSON Mode */}
        {mode === 'input' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tableName">Table Name</Label>
              <Input
                id="tableName"
                placeholder="Enter table name (optional)"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jsonInput">JSON Data</Label>
              <textarea
                id="jsonInput"
                placeholder={
                  'Paste JSON array or object here\n\nExample:\n[\n  { "id": 1, "name": "John", "age": 30 },\n  { "id": 2, "name": "Jane", "age": 25 }\n]'
                }
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="bg-background text-foreground h-64 w-full rounded-md border p-3 font-mono text-sm"
              />
            </div>

            <Button
              onClick={handlePasteJson}
              disabled={!jsonText.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? 'Parsing...' : 'Parse JSON'}
            </Button>
          </div>
        )}

        {/* Upload File Mode */}
        {mode === 'upload' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="jsonFile">JSON File</Label>
              <div className="rounded-lg border-2 border-dashed p-8 text-center">
                <Upload className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                <p className="text-muted-foreground mb-4 text-sm">
                  Drag and drop your JSON file here or click to browse
                </p>
                <Input
                  ref={fileInputRef}
                  id="jsonFile"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  Choose File
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border-destructive text-destructive rounded-md border p-3 text-sm">
            {error}
          </div>
        )}

        {/* Preview */}
        {parsedTable && (
          <div className="bg-muted/50 space-y-3 rounded-lg border p-4">
            <div>
              <h3 className="mb-2 text-sm font-semibold">Preview</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Table Name:</span>{' '}
                  <span className="font-mono">{parsedTable.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Columns:</span>{' '}
                  <span className="font-mono">
                    {parsedTable.columns.length}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Rows:</span>{' '}
                  <span className="font-mono">{parsedTable.rows}</span>
                </div>
              </div>
            </div>

            {/* Column Preview */}
            <div>
              <h4 className="text-muted-foreground mb-2 text-xs font-semibold">
                Detected Columns:
              </h4>
              <div className="max-h-24 space-y-1 overflow-y-auto">
                {parsedTable.columns.map((col) => (
                  <div
                    key={col.id}
                    className="bg-background flex items-center justify-between rounded px-2 py-1 text-xs"
                  >
                    <span>
                      <span className="font-mono">{col.name}</span>
                      {col.isPrimaryKey && (
                        <span className="bg-primary text-primary-foreground ml-2 rounded px-1.5 text-xs">
                          PK
                        </span>
                      )}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {col.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          {(parsedTable || jsonText) && (
            <Button variant="outline" onClick={handleClear} className="mr-auto">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!parsedTable}>
            Import Table
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
