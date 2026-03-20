# Testing Guide

## Running Tests

This project uses PHPUnit for unit and integration testing.

### Prerequisites

1. Install dependencies:
```bash
composer install
```

2. Ensure your database is set up. Tests will use the database specified in your `.env` file or the default `south_ring_autos`.

### Running Tests

Run all tests:
```bash
php vendor/bin/phpunit
```

Run only unit tests:
```bash
php vendor/bin/phpunit tests/Unit
```

Run only integration tests:
```bash
php vendor/bin/phpunit tests/Integration
```

Run a specific test file:
```bash
php vendor/bin/phpunit tests/Unit/DatabaseTest.php
```

Run a specific test method:
```bash
php vendor/bin/phpunit --filter testDatabaseConnection
```

### Test Structure

- `tests/Unit/` - Unit tests for individual components
  - `DatabaseTest.php` - Database connection and table structure tests
  - `ValidatorTest.php` - Input validation tests
  - `HelperTest.php` - Utility function tests
  - `ConfigTest.php` - Configuration tests

- `tests/Integration/` - Integration tests for workflows
  - `ApiTest.php` - End-to-end API and database workflow tests

### Test Configuration

Test configuration is in `phpunit.xml`. The test environment uses:
- Environment: `testing`
- Database: Uses same database as application (tests clean up after themselves)

### Writing Tests

When writing new tests:
1. Extend `PHPUnit\Framework\TestCase`
2. Use `setUp()` to initialize test data
3. Use `tearDown()` or cleanup in each test to remove test data
4. Follow the naming convention: `test directionsMethodName`

### Notes

- Tests create real database records but clean them up after execution
- Tests should be independent and not rely on other tests
- Use meaningful test data that clearly identifies test records

