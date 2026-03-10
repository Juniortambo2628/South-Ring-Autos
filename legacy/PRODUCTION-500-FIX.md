# Production 500 Error - Troubleshooting Guide

## Quick Fixes

### 1. Check Error Logs
The most important step is to check your server's error logs:
```bash
# Common locations:
tail -f /home/zhpebukm/public_html/apps/SouthRingAutos/storage/logs/app.log
tail -f /var/log/apache2/error.log
tail -f /var/log/nginx/error.log
# Or check cPanel error logs
```

### 2. Upload Diagnostic Scripts
Upload these files to your production server:
- `test.php` - Basic PHP test
- `diagnose-500.php` - Comprehensive diagnostic

Access them via:
- `https://okjtech.co.ke/apps/SouthRingAutos/test.php`
- `https://okjtech.co.ke/apps/SouthRingAutos/diagnose-500.php`

### 3. Common Issues and Fixes

#### Issue: Missing Composer Dependencies
**Symptom:** Error about missing classes or autoloader
**Fix:**
```bash
cd /home/zhpebukm/public_html/apps/SouthRingAutos
composer install --no-dev --optimize-autoloader
```

#### Issue: Missing .env File
**Symptom:** Database connection errors or undefined constants
**Fix:**
```bash
cd /home/zhpebukm/public_html/apps/SouthRingAutos
cp .env-production .env
chmod 600 .env
# Edit .env with correct credentials
```

#### Issue: Missing Storage Directories
**Symptom:** Errors about missing log files or directories
**Fix:**
```bash
cd /home/zhpebukm/public_html/apps/SouthRingAutos
mkdir -p storage/logs storage/uploads storage/cache
chmod -R 755 storage/
```

#### Issue: File Permissions
**Symptom:** Cannot write to files or directories
**Fix:**
```bash
cd /home/zhpebukm/public_html/apps/SouthRingAutos
chmod 644 .env
chmod -R 755 storage/
chmod -R 755 vendor/
```

#### Issue: Database Connection
**Symptom:** Database connection errors
**Fix:**
1. Verify database credentials in `.env`
2. Check database exists: `zhpebukm_southringautos`
3. Verify user has permissions: `zhpebukm_southringautos`
4. Test connection manually

#### Issue: PHP Version
**Symptom:** Syntax errors or missing features
**Fix:**
- Ensure PHP 8.2+ is active
- Check in cPanel or run: `php -v`

### 4. Step-by-Step Recovery

1. **Upload test.php and diagnose-500.php**
   - These will help identify the exact issue

2. **Check if vendor directory exists**
   ```bash
   ls -la /home/zhpebukm/public_html/apps/SouthRingAutos/vendor/
   ```
   - If missing, run `composer install --no-dev --optimize-autoloader`

3. **Check if .env exists**
   ```bash
   ls -la /home/zhpebukm/public_html/apps/SouthRingAutos/.env
   ```
   - If missing, copy from `.env-production` and configure

4. **Check storage directories**
   ```bash
   ls -la /home/zhpebukm/public_html/apps/SouthRingAutos/storage/
   ```
   - Create if missing: `mkdir -p storage/{logs,uploads,cache}`

5. **Check file permissions**
   ```bash
   chmod 600 .env
   chmod -R 755 storage/
   ```

6. **Test database connection**
   - Use `diagnose-500.php` or test manually

### 5. Minimal Working Setup

If nothing works, try this minimal `index.php` to test:

```php
<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');
echo "PHP is working!";
phpinfo();
?>
```

If this works, the issue is in the bootstrap/config files.

### 6. Enable Error Display Temporarily

Edit `bootstrap.php` temporarily:
```php
error_reporting(E_ALL);
ini_set('display_errors', '1');
```

This will show the actual error on the page (remove after fixing).

### 7. Check Server Configuration

- PHP version: Should be 8.2+
- Memory limit: At least 128M
- Max execution time: At least 30 seconds
- Required extensions: PDO, PDO_MySQL, mbstring, openssl

### 8. Contact Information

If you need to check:
- Database: `zhpebukm_southringautos`
- User: `zhpebukm_southringautos`
- Server: `51.89.113.223`
- Domain: `okjtech.co.ke`

---

**Next Steps:**
1. Upload `test.php` and `diagnose-500.php`
2. Access them via browser
3. Review the output
4. Fix the identified issues
5. Remove diagnostic files after fixing

