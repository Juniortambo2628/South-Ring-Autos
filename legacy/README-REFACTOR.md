# Code Refactoring & Architecture Documentation

## Overview

The codebase has been refactored to follow modern PHP best practices with:
- ✅ Composer dependency management
- ✅ PSR-4 Autoloading
- ✅ Central configuration system
- ✅ Error handling & logging
- ✅ Email notifications
- ✅ Input validation
- ✅ PHPUnit testing setup

## New Architecture

### Directory Structure

```
South-Ring-Autos/
├── src/                    # Source code (PSR-4)
│   ├── Config/
│   ├── Database/
│   ├── Utils/
│   └── ...
├── config/                 # Configuration files
│   ├── app.php            # Main config loader
│   ├── paths.php          # Path constants
│   ├── constants.php      # Application constants
│   └── database.php       # Legacy DB (backward compatible)
├── api/                    # API endpoints
├── admin/                  # Admin interface
├── tests/                  # PHPUnit tests
├── vendor/                 # Composer dependencies
├── storage/                # Logs, cache, etc.
│   └── logs/
├── bootstrap.php           # Application bootstrap
├── composer.json           # Composer config
└── .env                    # Environment variables
```

### Key Components

#### 1. Configuration System (`config/`)

- **`config/app.php`** - Main configuration loader
- **`config/paths.php`** - All file paths as constants
- **`config/constants.php`** - Application constants
- **`src/Config/Config.php`** - Config accessor class

Usage:
```php
use SouthRingAutos\Config\Config;

$appName = Config::get('app.name');
$dbPath = Config::get('paths.storage');
```

#### 2. Database Layer (`src/Database/`)

- **`src/Database/Database.php`** - Singleton database manager
- Automatic table creation
- Logging integration
- Connection pooling

Usage:
```php
use SouthRingAutos\Database\Database;

$db = Database::getInstance();
$pdo = $db->getConnection();
```

#### 3. Utilities (`src/Utils/`)

- **`ErrorHandler.php`** - Centralized error handling
- **`Email.php`** - Email sending utility
- **`Notification.php`** - Notification manager
- **`Validator.php`** - Input validation

#### 4. Environment Configuration

Create `.env` file from `.env.example`:

```env
APP_ENV=development
DEBUG_MODE=true

DB_HOST=localhost
DB_NAME=south_ring_autos
DB_USER=root
DB_PASS=

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
```

## Dependencies Installed

### Production
- **vlucas/phpdotenv** - Environment variable management
- **monolog/monolog** - Logging
- **symfony/mailer** - Email sending
- **symfony/console** - CLI commands
- **doctrine/dbal** - Database abstraction
- **respect/validation** - Input validation

### Development
- **phpunit/phpunit** - Unit testing
- **phpstan/phpstan** - Static analysis

## Usage Examples

### Initializing Application

```php
require_once __DIR__ . '/bootstrap.php';

use SouthRingAutos\Database\Database;
use SouthRingAutos\Utils\Notification;

// Database is auto-initialized
$db = Database::getInstance();

// Send notification
$notification = new Notification();
$notification->notifyBooking($bookingData);
```

### Validating Input

```php
use SouthRingAutos\Utils\Validator;

$result = Validator::validateBooking($_POST);
if (!$result['valid']) {
    // Handle errors
    foreach ($result['errors'] as $error) {
        echo $error . "\n";
    }
}
```

### Sending Email

```php
use SouthRingAutos\Utils\Email;

$email = new Email();
$email->send(
    'customer@example.com',
    'Booking Confirmation',
    '<h1>Your booking is confirmed!</h1>'
);
```

### Configuration Access

```php
use SouthRingAutos\Config\Config;

// Get configuration
$appName = Config::get('app.name');
$companyEmail = Config::get('company.email');

// Check if config exists
if (Config::has('app.debug')) {
    // ...
}
```

## Running Tests

```bash
# Run all tests
composer test

# Run specific test suite
vendor/bin/phpunit tests/Unit
vendor/bin/phpunit tests/Integration

# With coverage
vendor/bin/phpunit --coverage-html coverage/
```

## Code Quality

### Static Analysis
```bash
composer phpstan
```

### Auto-loading

All classes follow PSR-4 standards:
- Namespace: `SouthRingAutos\`
- Base path: `src/`
- Autoloaded via Composer

## Migration from Old Code

Old code using `require_once '../config/database.php'` will still work due to backward compatibility in `config/database.php`. However, new code should use:

```php
require_once __DIR__ . '/../bootstrap.php';
use SouthRingAutos\Database\Database;
$db = Database::getInstance();
```

## Error Handling

All errors are:
- Logged to `storage/logs/errors.log`
- Displayed in debug mode
- Hidden in production (with user-friendly messages)

## Logging

Logs are stored in `storage/logs/`:
- `errors.log` - Error messages
- `debug.log` - Debug information
- `database.log` - Database operations
- `email.log` - Email sending
- `notifications.log` - Notification events

## Email Configuration

Set up SMTP in `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=southringautos@gmail.com
```

For Gmail, you'll need an "App Password" instead of your regular password.

## Next Steps

1. ✅ Create `.env` file from `.env.example`
2. ✅ Update email SMTP settings in `.env`
3. ✅ Test booking form with notifications
4. ✅ Run PHPUnit tests: `composer test`
5. ✅ Add more test cases in `tests/`

## Troubleshooting

### Composer Issues
If composer install fails:
```bash
rm -rf vendor/ composer.lock
composer install
```

### Autoload Issues
Regenerate autoloader:
```bash
composer dump-autoload
```

### Database Connection
Check `.env` file has correct database credentials:
```env
DB_HOST=localhost
DB_NAME=south_ring_autos
DB_USER=root
DB_PASS=
```

---

**All refactoring complete!** The codebase is now:
- ✅ DRY (Don't Repeat Yourself)
- ✅ Well-organized with clear separation of concerns
- ✅ Testable with PHPUnit
- ✅ Production-ready with proper error handling
- ✅ Maintainable with centralized configuration


