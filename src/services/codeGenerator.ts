import type { Table } from '@/types/schema'
import { ColumnConstraint } from '@/types/schema'

export type CodeLanguage =
  | 'sql'
  | 'json'
  | 'typescript'
  | 'python'
  | 'go'
  | 'laravel'

export interface GeneratedCode {
  language: CodeLanguage
  code: string
  fileName: string
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
}

function toPascalCase(str: string): string {
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

function mapSqlType(columnType: string): string {
  const typeMap: Record<string, string> = {
    string: 'VARCHAR(255)',
    varchar: 'VARCHAR(255)',
    text: 'TEXT',
    integer: 'INTEGER',
    int: 'INTEGER',
    bigint: 'BIGINT',
    smallint: 'SMALLINT',
    number: 'DECIMAL(10, 2)',
    decimal: 'DECIMAL(10, 2)',
    float: 'FLOAT',
    double: 'DOUBLE PRECISION',
    boolean: 'BOOLEAN',
    date: 'DATE',
    datetime: 'TIMESTAMP',
    timestamp: 'TIMESTAMP',
    json: 'JSON',
    uuid: 'UUID',
  }
  return typeMap[columnType.toLowerCase()] || 'VARCHAR(255)'
}

function mapTypeScriptType(columnType: string): string {
  const typeMap: Record<string, string> = {
    string: 'string',
    varchar: 'string',
    text: 'string',
    integer: 'number',
    int: 'number',
    bigint: 'bigint',
    smallint: 'number',
    number: 'number',
    decimal: 'number',
    float: 'number',
    double: 'number',
    boolean: 'boolean',
    date: 'Date',
    datetime: 'Date',
    timestamp: 'Date',
    json: 'Record<string, any>',
    uuid: 'string',
  }
  return typeMap[columnType.toLowerCase()] || 'string'
}

function mapPythonType(columnType: string): string {
  const typeMap: Record<string, string> = {
    string: 'str',
    varchar: 'str',
    text: 'str',
    integer: 'int',
    int: 'int',
    bigint: 'int',
    smallint: 'int',
    number: 'float',
    decimal: 'float',
    float: 'float',
    double: 'float',
    boolean: 'bool',
    date: 'datetime.date',
    datetime: 'datetime.datetime',
    timestamp: 'datetime.datetime',
    json: 'dict',
    uuid: 'str',
  }
  return typeMap[columnType.toLowerCase()] || 'str'
}

function mapGoType(columnType: string): string {
  const typeMap: Record<string, string> = {
    string: 'string',
    varchar: 'string',
    text: 'string',
    integer: 'int',
    int: 'int',
    bigint: 'int64',
    smallint: 'int16',
    number: 'float64',
    decimal: 'float64',
    float: 'float32',
    double: 'float64',
    boolean: 'bool',
    date: 'time.Time',
    datetime: 'time.Time',
    timestamp: 'time.Time',
    json: 'map[string]interface{}',
    uuid: 'string',
  }
  return typeMap[columnType.toLowerCase()] || 'string'
}

export function generateSQL(
  tables: Table[],
  dialect: 'PostgreSQL' | 'MySQL' | 'SQLite' = 'PostgreSQL'
): GeneratedCode {
  let sql = ''

  if (dialect === 'MySQL') {
    sql = 'SET CHARSET utf8mb4;\n\n'
  }

  tables.forEach((table) => {
    sql += `CREATE TABLE ${table.name} (\n`

    table.columns.forEach((col, index) => {
      sql += `  ${col.name} ${mapSqlType(col.type)}`

      const constraints = col.constraints || []
      if (constraints.includes(ColumnConstraint.PRIMARY_KEY)) {
        sql += ' PRIMARY KEY'
      }
      if (constraints.includes(ColumnConstraint.NOT_NULL)) {
        sql += ' NOT NULL'
      }
      if (constraints.includes(ColumnConstraint.UNIQUE)) {
        sql += ' UNIQUE'
      }

      if (index < table.columns.length - 1) {
        sql += ',\n'
      } else {
        sql += '\n'
      }
    })

    sql += ');\n\n'
  })

  return {
    language: 'sql',
    code: sql,
    fileName: `schema_${dialect.toLowerCase()}.sql`,
  }
}

export function generateTypeScript(tables: Table[]): GeneratedCode {
  let code = '// Database Types\n\n'

  tables.forEach((table) => {
    const interfaceName = toPascalCase(table.name)
    code += `export interface ${interfaceName} {\n`

    table.columns.forEach((col) => {
      const fieldName = toCamelCase(col.name)
      const fieldType = mapTypeScriptType(col.type)
      const isOptional = !col.constraints?.includes(ColumnConstraint.NOT_NULL)
        ? '?'
        : ''
      code += `  ${fieldName}${isOptional}: ${fieldType}\n`
    })

    code += `}\n\n`
  })

  return {
    language: 'typescript',
    code: code.trim(),
    fileName: 'types.ts',
  }
}

export function generatePython(tables: Table[]): GeneratedCode {
  let code =
    'from typing import Optional\nfrom datetime import datetime, date\nfrom pydantic import BaseModel\n\n'

  tables.forEach((table) => {
    const className = toPascalCase(table.name)
    code += `class ${className}(BaseModel):\n`

    if (table.columns.length === 0) {
      code += '    pass\n\n'
    } else {
      table.columns.forEach((col) => {
        const fieldName = toSnakeCase(col.name)
        const fieldType = mapPythonType(col.type)
        const isOptional = !col.constraints?.includes(ColumnConstraint.NOT_NULL)
        const typeAnnotation = isOptional
          ? `Optional[${fieldType}] = None`
          : fieldType
        code += `    ${fieldName}: ${typeAnnotation}\n`
      })
      code += '\n'
    }
  })

  return {
    language: 'python',
    code: code.trim(),
    fileName: 'models.py',
  }
}

export function generateGo(tables: Table[]): GeneratedCode {
  let code = 'package models\n\nimport "time"\n\n'

  tables.forEach((table) => {
    const structName = toPascalCase(table.name)
    code += `type ${structName} struct {\n`

    table.columns.forEach((col) => {
      const fieldName = toPascalCase(col.name)
      const fieldType = mapGoType(col.type)
      code += `\t${fieldName} ${fieldType} \`json:"${toSnakeCase(col.name)}"\`\n`
    })

    code += `}\n\n`
  })

  return {
    language: 'go',
    code: code.trim(),
    fileName: 'models.go',
  }
}

export function generateJSON(tables: Table[]): GeneratedCode {
  const schema = {
    version: '1.0',
    tables: tables.map((table) => ({
      name: table.name,
      columns: table.columns.map((col) => ({
        name: col.name,
        type: col.type,
        constraints: col.constraints || [],
      })),
    })),
  }

  return {
    language: 'json',
    code: JSON.stringify(schema, null, 2),
    fileName: 'schema.json',
  }
}

export function generateLaravel(tables: Table[]): GeneratedCode {
  let code = '<?php\n\n// Laravel Migration Files\n\n'

  tables.forEach((table) => {
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const migrationName = `create_${toSnakeCase(table.name)}_table`

    code += `// File: database/migrations/${timestamp}_000000_${migrationName}.php\n\n`
    code += `use Illuminate\\Database\\Migrations\\Migration;\n`
    code += `use Illuminate\\Database\\Schema\\Blueprint;\n`
    code += `use Illuminate\\Support\\Facades\\Schema;\n\n`
    code += `return new class extends Migration {\n`
    code += `    public function up(): void {\n`
    code += `        Schema::create('${toSnakeCase(table.name)}', function (Blueprint $table) {\n`

    table.columns.forEach((col) => {
      const colName = toSnakeCase(col.name)
      const colType = col.type.toLowerCase()

      let laravelType = '$table->id()'
      if (colType.includes('string') || colType.includes('varchar')) {
        laravelType = `$table->string('${colName}')`
      } else if (colType.includes('text')) {
        laravelType = `$table->text('${colName}')`
      } else if (colType.includes('integer') || colType.includes('int')) {
        laravelType = `$table->integer('${colName}')`
      } else if (colType.includes('boolean')) {
        laravelType = `$table->boolean('${colName}')`
      } else if (colType.includes('date')) {
        laravelType = `$table->date('${colName}')`
      } else if (
        colType.includes('timestamp') ||
        colType.includes('datetime')
      ) {
        laravelType = `$table->timestamp('${colName}')`
      }

      if (col.constraints?.includes(ColumnConstraint.UNIQUE)) {
        laravelType += '->unique()'
      }

      code += `            ${laravelType};\n`
    })

    code += `            $table->timestamps();\n`
    code += `        });\n`
    code += `    }\n\n`
    code += `    public function down(): void {\n`
    code += `        Schema::dropIfExists('${toSnakeCase(table.name)}');\n`
    code += `    }\n`
    code += `};\n\n`
  })

  return {
    language: 'laravel',
    code: code.trim(),
    fileName: 'migrations.php',
  }
}

export function generateAllCode(tables: Table[]) {
  return {
    sql: generateSQL(tables, 'PostgreSQL'),
    typescript: generateTypeScript(tables),
    python: generatePython(tables),
    go: generateGo(tables),
    json: generateJSON(tables),
    laravel: generateLaravel(tables),
  }
}
