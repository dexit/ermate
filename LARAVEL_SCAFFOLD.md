# Laravel Project Scaffold Generator

The ermate code generator now supports full Laravel project scaffold generation with a complete directory structure and all necessary files.

## Features

### Full Project Structure
When generating Laravel code, the Code Generator creates a complete Laravel project scaffold including:

- **Migrations** - Database migration files for each table
- **Models** - Eloquent models with fillable properties and proper casting
- **Controllers** - RESTful API controllers with CRUD operations
- **Routes** - API routes configuration
- **Configuration** - composer.json, .env.example, and README

### Generated Files

#### Migrations
- Auto-generated migration files with proper timestamps
- Column type mapping from ermate schema to Laravel blueprint
- Automatic constraint handling (unique, nullable)

```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('email')->unique()->nullable(false);
    $table->text('bio')->nullable();
    $table->timestamps();
});
```

#### Models
- Eloquent models for each table
- Automatic fillable property configuration
- Type casting for boolean, date, and JSON fields

```php
class User extends Model {
    use HasFactory;
    protected $table = 'users';
    protected $fillable = ['email', 'bio'];
    protected $casts = [
        'created_at' => 'datetime',
    ];
}
```

#### Controllers
- RESTful CRUD controllers for each resource
- Request validation with fillable fields
- JSON responses for API endpoints

```php
Route::apiResource('users', UserController::class);

GET    /api/users              # List all users
POST   /api/users              # Create user
GET    /api/users/{id}         # Get user
PUT    /api/users/{id}         # Update user
DELETE /api/users/{id}         # Delete user
```

## Usage

1. **Design your database schema** in ermate canvas
2. **Click Code Generator** in the toolbar
3. **Select Laravel tab**
4. **Click the ZIP download button** (third download icon) to download the complete project

## Downloaded Project

The downloaded ZIP contains:

```
laravel-app/
├── app/
│   ├── Models/
│   │   ├── User.php
│   │   ├── Post.php
│   │   └── ...
│   └── Http/Controllers/
│       ├── UserController.php
│       ├── PostController.php
│       └── ...
├── database/
│   ├── migrations/
│   │   ├── 2024_01_01_000000_create_users_table.php
│   │   ├── 2024_01_01_000001_create_posts_table.php
│   │   └── ...
│   ├── factories/
│   └── seeders/
├── routes/
│   └── api.php
├── config/
├── resources/
├── storage/
├── tests/
├── composer.json
├── .env.example
└── README.md
```

## Quick Start

After downloading and extracting:

```bash
cd laravel-app
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

## Features by Column Type

The generator intelligently maps ermate column types to Laravel schema methods:

| ermate Type | Laravel Method |
|-------------|----------------|
| string      | `$table->string()` |
| text        | `$table->text()` |
| integer     | `$table->integer()` |
| boolean     | `$table->boolean()` |
| date        | `$table->date()` |
| timestamp   | `$table->timestamp()` |
| decimal     | `$table->decimal()` |
| json        | `$table->json()` |

## Constraints Handling

Column constraints are automatically applied:

- **NOT_NULL** → `->nullable(false)`
- **UNIQUE** → `->unique()`
- **PRIMARY_KEY** → Auto-handled with `->id()`

## API Validation

Controllers automatically validate required/optional fields based on your schema:

```php
// Required field (NOT_NULL constraint)
'email' => 'required'

// Optional field
'bio' => 'sometimes'
```

## Customization

The generated project is a standard Laravel application. After extraction, you can:

- Add authentication with Laravel Breeze or Sanctum
- Install additional packages
- Modify migrations and models
- Add middleware and policies
- Configure database and other services

All files follow Laravel conventions and best practices.
