import type { Column, Table } from '@/types/schema'

export type ColumnType = 'string' | 'number' | 'boolean' | 'date' | 'text'

interface ParsedColumn extends Omit<Column, 'type'> {
  type: ColumnType
}

interface ParsedTable extends Omit<Table, 'columns'> {
  columns: ParsedColumn[]
}

/**
 * Detect the appropriate column type based on sample values
 */
export function detectColumnType(values: unknown[]): ColumnType {
  if (values.length === 0) return 'string'

  const nonNullValues = values.filter((v) => v !== null && v !== undefined)

  if (nonNullValues.length === 0) return 'string'

  // Check if all values are booleans
  if (nonNullValues.every((v) => typeof v === 'boolean')) {
    return 'boolean'
  }

  // Check if all values are numbers
  if (nonNullValues.every((v) => typeof v === 'number')) {
    return 'number'
  }

  // Check if all values are dates or date-like strings
  if (
    nonNullValues.every((v) => {
      if (typeof v === 'string') {
        const date = new Date(v)
        return !isNaN(date.getTime())
      }
      if (v instanceof Date) return true
      return false
    })
  ) {
    return 'date'
  }

  // Check if strings are very long (potential text fields)
  const avgLength =
    nonNullValues
      .filter((v) => typeof v === 'string')
      .reduce((sum, v) => sum + (v as string).length, 0) / nonNullValues.length

  if (avgLength > 100) {
    return 'text'
  }

  return 'string'
}

/**
 * Parse array of objects (JSON records) into table schema
 */
export function parseJsonToTable(
  data: unknown[],
  tableName: string = 'imported_table'
): ParsedTable {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Input must be a non-empty array of objects')
  }

  // Normalize all records to objects
  const records = data.map((record) => {
    if (typeof record !== 'object' || record === null) {
      throw new Error(
        'All array elements must be objects. Received: ' + typeof record
      )
    }
    return record as Record<string, unknown>
  })

  // Extract all unique column names
  const columnNames = new Set<string>()
  records.forEach((record) => {
    Object.keys(record).forEach((key) => columnNames.add(key))
  })

  if (columnNames.size === 0) {
    throw new Error('No columns found in the JSON data')
  }

  // Sample values from each column to detect types
  const columnData = new Map<string, unknown[]>()
  columnNames.forEach((name) => {
    const values = records
      .map((r) => r[name])
      .filter((v) => v !== null && v !== undefined)
      .slice(0, 10) // Sample first 10 non-null values
    columnData.set(name, values)
  })

  // Create columns with detected types
  const columns: ParsedColumn[] = Array.from(columnNames).map(
    (name, index) => ({
      id: `col_${Date.now()}_${index}`,
      name,
      type: detectColumnType(columnData.get(name) || []),
      isPrimaryKey: index === 0, // First column as primary key by default
      isNullable: true,
      defaultValue: null,
      comment: '',
      constraints: [],
    })
  )

  return {
    id: `table_${Date.now()}`,
    name: tableName,
    columns,
    rows: records.length,
    comment: `Imported from JSON on ${new Date().toLocaleString()}`,
  }
}

/**
 * Flatten nested JSON objects (one level deep)
 */
export function flattenJson(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const flattened: Record<string, unknown> = {}

  Object.entries(obj).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      flattened[key] = value
    } else if (
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      // Flatten nested object
      Object.entries(value as Record<string, unknown>).forEach(
        ([nestedKey, nestedValue]) => {
          flattened[`${key}_${nestedKey}`] = nestedValue
        }
      )
    } else if (Array.isArray(value)) {
      // Convert arrays to JSON string
      flattened[key] = JSON.stringify(value)
    } else {
      flattened[key] = value
    }
  })

  return flattened
}

/**
 * Parse JSON string or array and convert to table schema
 */
export function parseJsonPayload(
  payload: string | unknown,
  tableName?: string
): ParsedTable {
  let data: unknown

  if (typeof payload === 'string') {
    try {
      data = JSON.parse(payload)
    } catch (error) {
      throw new Error(
        'Invalid JSON: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      )
    }
  } else {
    data = payload
  }

  // Handle single object - wrap in array
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    data = [data]
  }

  // Flatten nested objects
  if (Array.isArray(data)) {
    data = data.map((item) => {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        return flattenJson(item as Record<string, unknown>)
      }
      return item
    })
  }

  return parseJsonToTable(data, tableName || 'imported_table')
}
