import { useMemo } from 'react'
import { useSchemaStore } from '@/hooks/useSchemaStore'
import { generateAllCode, type CodeLanguage } from '@/services/codeGenerator'

export function useCodeGenerator() {
  const schema = useSchemaStore((s) => s.schema)
  const tables = schema.tables

  const generatedCode = useMemo(() => {
    if (!tables || tables.length === 0) {
      return null
    }
    return generateAllCode(tables)
  }, [tables])

  const getCode = (language: CodeLanguage) => {
    if (!generatedCode) return null

    const codeMap: Record<
      CodeLanguage,
      (typeof generatedCode)[keyof typeof generatedCode]
    > = {
      sql: generatedCode.sql,
      json: generatedCode.json,
      typescript: generatedCode.typescript,
      python: generatedCode.python,
      go: generatedCode.go,
      laravel: generatedCode.laravel,
    }

    return codeMap[language]
  }

  return {
    generatedCode,
    getCode,
    hasCode: !!generatedCode,
  }
}
