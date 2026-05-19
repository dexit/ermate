import type { Table } from '@/types/schema'
import { ColumnConstraint } from '@/types/schema'
import JSZip from 'jszip'

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

function mapLaravelType(columnType: string): string {
  const colType = columnType.toLowerCase()

  if (colType.includes('string') || colType.includes('varchar')) {
    return 'string'
  } else if (colType.includes('text')) {
    return 'text'
  } else if (colType.includes('integer') || colType.includes('int')) {
    return 'integer'
  } else if (colType.includes('boolean')) {
    return 'boolean'
  } else if (colType.includes('date') && !colType.includes('time')) {
    return 'date'
  } else if (colType.includes('timestamp') || colType.includes('datetime')) {
    return 'dateTime'
  } else if (colType.includes('decimal') || colType.includes('float')) {
    return 'decimal'
  }
  return 'string'
}

function generateMigration(table: Table): string {
  let code = `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('${table.name}', function (Blueprint $table) {
            $table->id();
`

  table.columns.forEach((col, index) => {
    if (index === 0) return // Skip id column

    const colName = toSnakeCase(col.name)
    const colType = mapLaravelType(col.type)

    let laravelType = `$table->${colType}('${colName}')`

    const constraints = col.constraints || []
    if (constraints.includes(ColumnConstraint.UNIQUE)) {
      laravelType += '->unique()'
    }
    if (constraints.includes(ColumnConstraint.NOT_NULL)) {
      laravelType += '->nullable(false)'
    } else {
      laravelType += '->nullable()'
    }

    code += `            ${laravelType};\n`
  })

  code += `            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('${table.name}');
    }
};
`

  return code
}

function generateModel(table: Table): string {
  const modelName = toPascalCase(table.name)

  let code = `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;

class ${modelName} extends Model
{
    use HasFactory;

    protected $table = '${toSnakeCase(table.name)}';

    protected $fillable = [
`

  table.columns.forEach((col, index) => {
    if (index === 0) return
    const colName = toSnakeCase(col.name)
    code += `        '${colName}',\n`
  })

  code += `    ];

    protected $casts = [
`

  table.columns.forEach((col, index) => {
    if (index === 0) return
    const colName = toSnakeCase(col.name)
    const colType = col.type.toLowerCase()

    if (colType.includes('boolean')) {
      code += `        '${colName}' => 'boolean',\n`
    } else if (colType.includes('date') && !colType.includes('time')) {
      code += `        '${colName}' => 'date',\n`
    } else if (colType.includes('timestamp') || colType.includes('datetime')) {
      code += `        '${colName}' => 'datetime',\n`
    } else if (colType.includes('json')) {
      code += `        '${colName}' => 'array',\n`
    }
  })

  code += `    ];
}
`

  return code
}

function generateController(table: Table): string {
  const modelName = toPascalCase(table.name)
  const controllerName = `${modelName}Controller`
  const variable = toCamelCase(table.name)

  const code = `<?php

namespace App\\Http\\Controllers;

use App\\Models\\${modelName};
use Illuminate\\Http\\Request;

class ${controllerName} extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $${variable}s = ${modelName}::paginate(15);
        return response()->json($${variable}s);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
`

  let validation = code
  table.columns.forEach((col, index) => {
    if (index === 0) return
    const colName = toSnakeCase(col.name)
    const isNullable = !col.constraints?.includes(ColumnConstraint.NOT_NULL)
    const rule = isNullable ? 'nullable' : 'required'
    validation += `            '${colName}' => '${rule}',\n`
  })

  validation += `        ]);

        $${variable} = ${modelName}::create($validated);
        return response()->json($${variable}, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(${modelName} $${variable})
    {
        return response()->json($${variable});
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ${modelName} $${variable})
    {
        $validated = $request->validate([
`

  table.columns.forEach((col, index) => {
    if (index === 0) return
    const colName = toSnakeCase(col.name)
    validation += `            '${colName}' => 'sometimes',\n`
  })

  validation += `        ]);

        $${variable}->update($validated);
        return response()->json($${variable});
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(${modelName} $${variable})
    {
        $${variable}->delete();
        return response()->json(null, 204);
    }
}
`

  return validation
}

function generateRoutes(tables: Table[]): string {
  let code = `<?php

use Illuminate\\Support\\Facades\\Route;
use App\\Http\\Controllers\\*;

// API Routes
Route::prefix('api')->group(function () {
`

  tables.forEach((table) => {
    const modelName = toPascalCase(table.name)
    const controllerName = `${modelName}Controller`
    const resourceName = toSnakeCase(table.name)

    code += `    Route::apiResource('${resourceName}', ${controllerName}::class);\n`
  })

  code += `});
`

  return code
}

function generateComposerJson(): string {
  return JSON.stringify(
    {
      name: 'ermate/laravel-scaffold',
      description: 'Laravel scaffold generated from ermate database schema',
      require: {
        php: '^8.2',
        'laravel/framework': '^11.0',
        'laravel/tinker': '^2.9',
      },
      'require-dev': {
        'laravel/pint': '^1.13',
        'laravel/sail': '^1.26',
        'mockery/mockery': '^1.6',
        'nunomaduro/collision': '^8.1',
        'phpunit/phpunit': '^11.0',
        'spatie/laravel-ignition': '^2.4',
      },
      autoload: {
        psr4: {
          'App\\': 'app/',
          'Database\\Factories\\': 'database/factories/',
          'Database\\Seeders\\': 'database/seeders/',
        },
      },
      scripts: {
        post_create_project_cmd: ['@php artisan key:generate --ansi'],
      },
    },
    null,
    2
  )
}

function generateEnvExample(): string {
  return `APP_NAME="Ermate Laravel"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_TIMEZONE=UTC
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ermate_app
DB_USERNAME=root
DB_PASSWORD=

CACHE_STORE=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120
`
}

function generateReadme(tables: Table[]): string {
  const tableList = tables.map((t) => `- ${toPascalCase(t.name)}`).join('\n')

  return `# Ermate Laravel Scaffold

Auto-generated Laravel project from Ermate database schema.

## Installation

\`\`\`bash
cd laravel-app
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve
\`\`\`

## Generated Models

${tableList}

## API Endpoints

All endpoints are available under \`/api/\` prefix with standard REST operations.

### Examples

\`\`\`bash
GET    /api/table-name              # List all records
POST   /api/table-name              # Create new record
GET    /api/table-name/{id}         # Get specific record
PUT    /api/table-name/{id}         # Update record
DELETE /api/table-name/{id}         # Delete record
\`\`\`

## Project Structure

\`\`\`
laravel-app/
├── app/
│   ├── Models/              # Eloquent Models
│   └── Http/
│       └── Controllers/     # API Controllers
├── database/
│   ├── migrations/          # Database migrations
│   ├── factories/           # Model factories
│   └── seeders/             # Database seeders
├── routes/
│   └── api.php              # API routes
└── ...
\`\`\`

## Generated by Ermate

This project was generated using [Ermate](https://github.com/ermate/ermate).
`
}

export async function generateLaravelProject(
  tables: Table[],
  projectName: string = 'laravel-app'
): Promise<Blob> {
  const zip = new JSZip()

  // Create directory structure
  const appDir = zip.folder(projectName)!

  // Database
  const dbDir = appDir.folder('database')!
  const migrationsDir = dbDir.folder('migrations')!
  const timestamp = Date.now()

  tables.forEach((table, index) => {
    const migrationCode = generateMigration(table)
    const migrationName = `${timestamp + index}_create_${toSnakeCase(table.name)}_table.php`
    migrationsDir.file(migrationName, migrationCode)
  })

  dbDir.folder('factories')
  dbDir.folder('seeders')

  // App
  const appModelsDir = appDir.folder('app')!.folder('Models')!

  tables.forEach((table) => {
    const modelCode = generateModel(table)
    const modelName = `${toPascalCase(table.name)}.php`
    appModelsDir.file(modelName, modelCode)
  })

  // Controllers
  const controllersDir = appDir
    .folder('app')!
    .folder('Http')!
    .folder('Controllers')!

  tables.forEach((table) => {
    const controllerCode = generateController(table)
    const controllerName = `${toPascalCase(table.name)}Controller.php`
    controllersDir.file(controllerName, controllerCode)
  })

  // Routes
  const routesDir = appDir.folder('routes')!
  routesDir.file('api.php', generateRoutes(tables))

  // Config Files
  appDir.file('composer.json', generateComposerJson())
  appDir.file('.env.example', generateEnvExample())
  appDir.file('README.md', generateReadme(tables))

  // Additional directories
  appDir.folder('config')
  appDir.folder('resources')
  appDir.folder('storage')
  appDir.folder('tests')

  // Generate ZIP file
  const blob = await zip.generateAsync({ type: 'blob' })
  return blob
}

export async function downloadLaravelProject(
  tables: Table[],
  projectName: string = 'laravel-app'
): Promise<void> {
  const blob = await generateLaravelProject(tables, projectName)

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${projectName}.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
