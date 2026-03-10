# Fix Database Connection Issue

## Problem
The diagnostic shows: `Access denied for user 'root'@'localhost' (using password: NO)`

This means the `.env` file credentials are not being read properly.

## Solution

### Step 1: Verify .env File
Check that your `.env` file exists and has the correct format:

```bash
cat /home/zhpebukm/public_html/apps/SouthRingAutos/.env
```

It should contain:
```
DB_HOST=localhost
DB_NAME=zhpebukm_southringautos
DB_USER=zhpebukm_southringautos
DB_PASS=southringautos@2025
DB_PORT=3306
```

### Step 2: Test Environment Loading
Upload `test-env.php` and access it:
```
https://okjtech.co.ke/apps/SouthRingAutos/test-env.php
```

This will show you:
- What values are being read from `.env`
- Whether they're in `$_ENV` or `getenv()`
- The exact connection attempt

### Step 3: Common Issues

#### Issue 1: .env File Format
Make sure there are **no spaces** around the `=` sign:
```
✅ Correct: DB_PASS=southringautos@2025
❌ Wrong:   DB_PASS = southringautos@2025
```

#### Issue 2: Special Characters in Password
The password contains `@` which should work, but if it doesn't, try quoting it:
```
DB_PASS="southringautos@2025"
```

#### Issue 3: File Permissions
Make sure `.env` is readable:
```bash
chmod 644 .env
```

#### Issue 4: Line Endings
If the file was created on Windows, it might have Windows line endings (`\r\n`). Convert to Unix:
```bash
dos2unix .env
# Or
sed -i 's/\r$//' .env
```

### Step 4: Manual Test
Create a simple test file `test-db.php`:

```php
<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

// Load .env manually
$envFile = file_get_contents(__DIR__ . '/.env');
$lines = explode("\n", $envFile);
foreach ($lines as $line) {
    $line = trim($line);
    if (empty($line) || strpos($line, '#') === 0) continue;
    if (strpos($line, '=') !== false) {
        $pos = strpos($line, '=');
        $key = trim(substr($line, 0, $pos));
        $value = trim(substr($line, $pos + 1));
        $_ENV[$key] = $value;
        putenv("$key=$value");
    }
}

$host = $_ENV['DB_HOST'] ?? 'localhost';
$dbname = $_ENV['DB_NAME'] ?? 'south_ring_autos';
$username = $_ENV['DB_USER'] ?? 'root';
$password = $_ENV['DB_PASS'] ?? '';

echo "Host: $host<br>";
echo "Database: $dbname<br>";
echo "User: $username<br>";
echo "Password: " . (strlen($password) > 0 ? 'SET (' . strlen($password) . ' chars)' : 'EMPTY') . "<br><br>";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    echo "✓ Connection successful!";
} catch (PDOException $e) {
    echo "✗ Connection failed: " . $e->getMessage();
}
?>
```

### Step 5: Verify Database Credentials
Make sure the database credentials are correct:
- Database: `zhpebukm_southringautos`
- User: `zhpebukm_southringautos`
- Password: `southringautos@2025`
- Host: `localhost`

You can test this in cPanel's phpMyAdmin or MySQL command line.

### Step 6: After Fixing
1. Upload the updated files:
   - `src/Database/Database.php` (now checks both `$_ENV` and `getenv()`)
   - `config/app.php` (improved .env parsing)
   - `test-env.php` (diagnostic tool)

2. Test the connection:
   ```
   https://okjtech.co.ke/apps/SouthRingAutos/test-env.php
   ```

3. Once working, test the homepage:
   ```
   https://okjtech.co.ke/apps/SouthRingAutos/
   ```

4. Remove test files after confirming:
   ```bash
   rm test-env.php test-db.php diagnose-500.php test.php
   ```

---

**Most Likely Fix:**
The `.env` file might not be loading. After uploading the updated `config/app.php` and `src/Database/Database.php`, the system will:
1. Try to load via Dotenv (if available)
2. Fall back to manual parsing
3. Check both `$_ENV` and `getenv()` for values

This should resolve the connection issue.

