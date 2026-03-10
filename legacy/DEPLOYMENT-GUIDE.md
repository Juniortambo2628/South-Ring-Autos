# Production Deployment Guide (No Terminal Access)

This guide explains how to deploy South Ring Autos to production when you don't have terminal/SSH access.

## 📋 Pre-Deployment Checklist

- [ ] Database exported from development
- [ ] All files ready for upload
- [ ] FTP/SFTP credentials available
- [ ] Production server details confirmed

## 🚀 Deployment Steps

### Step 1: Export Database

**From Development (phpMyAdmin or MySQL):**

1. Export your database:
   - Database: `south_ring_autos` (or your dev DB name)
   - Export method: **SQL**
   - Include: Structure and data
   
2. Save the SQL file (e.g., `southringautos_backup.sql`)

### Step 2: Upload Files

**Upload to production directory: `/home/zhpebukm/public_html/apps/SouthRingAutos`**

**Files/Folders to Upload:**
- ✅ All PHP files (root, admin/, api/, client/, includes/, src/)
- ✅ All configuration files (config/, bootstrap.php)
- ✅ All assets (css/, js/, img/, lib/)
- ✅ Vendor directory (`vendor/`)
- ✅ Storage directory (`storage/`)
- ✅ Other assets (South-ring-logos/, loader-icon/, etc.)

**Files/Folders to EXCLUDE:**
- ❌ `.env` file (create new one on production)
- ❌ `.git/` directory
- ❌ `tests/` directory (optional)
- ❌ `docs/` directory (optional)
- ❌ Development-specific files

### Step 3: Create .env File on Production

**Using FTP/SFTP client (FileZilla, WinSCP, etc.):**

1. Navigate to `/home/zhpebukm/public_html/apps/SouthRingAutos`
2. Create a new file called `.env`
3. Add the following content:

```env
APP_ENV=production
DEBUG_MODE=false

DB_HOST=localhost
DB_NAME=zhpebukm_southringautos
DB_USER=zhpebukm_southringautos
DB_PASS=southringautos@2025
DB_PORT=3306

SMTP_HOST=mail.okjtech.co.ke
SMTP_PORT=465
SMTP_USER=southring@okjtech.co.ke
SMTP_PASS=southringautos@2025
SMTP_ENCRYPTION=ssl

EMAIL_FROM=southring@okjtech.co.ke
EMAIL_FROM_NAME=South Ring Autos Ltd
ADMIN_EMAIL=southring@okjtech.co.ke

NOTIFY_ON_BOOKING=true
NOTIFY_ON_CONTACT=true

BASE_URL=https://okjtech.co.ke
```

4. Set file permissions to **600** (owner read/write only)

### Step 4: Set File Permissions

**Using FTP/SFTP client:**

1. Right-click on `storage/` folder → Properties/Permissions
2. Set to **755** (recursive)
3. Set `storage/logs/` to **755** (recursive)

**Permissions needed:**
- `storage/` → 755
- `storage/logs/` → 755
- `storage/uploads/` → 755
- `.env` → 600

### Step 5: Import Database

**Using phpMyAdmin or MySQL client:**

1. Login to phpMyAdmin on production server
2. Select database: `zhpebukm_southringautos`
3. Go to **Import** tab
4. Choose your exported SQL file
5. Click **Go** to import

**Alternative (using phpMyAdmin SQL tab):**
1. Open database `zhpebukm_southringautos`
2. Go to **SQL** tab
3. Paste your SQL export
4. Click **Go**

### Step 6: Run Deployment Script

**Via Browser:**

1. Open: `https://okjtech.co.ke/deploy-production.php?key=CHANGE_THIS_SECRET_KEY_12345`
   
   **⚠️ IMPORTANT:** Change the secret key in `deploy-production.php` first!

2. The script will:
   - Check .env file
   - Verify file permissions
   - Test database connection
   - Check environment detection
   - Optionally run migrations

3. Review all checks and fix any errors

4. If migrations are needed, click "Run Migrations" button

### Step 7: Verify Deployment

**Visit these URLs to verify:**

1. **Homepage:** `https://okjtech.co.ke/`
2. **Admin Login:** `https://okjtech.co.ke/admin/login.php`
3. **Client Login:** `https://okjtech.co.ke/client/login.php`

**Check:**
- [ ] Homepage loads correctly
- [ ] Can login to admin
- [ ] Can login to client portal
- [ ] Forms submit correctly
- [ ] Database connection works

### Step 8: Security Cleanup

**⚠️ CRITICAL: Delete deployment script**

1. Using FTP/SFTP, delete `deploy-production.php`
2. This file should NOT remain on production

## 🔧 Troubleshooting

### Database Connection Error

**If database connection fails:**

1. Verify database credentials in `.env`
2. Check if database `zhpebukm_southringautos` exists
3. Verify database user has proper permissions
4. Check database server is running

### Permission Errors

**If you see permission errors:**

1. Set `storage/` to 755
2. Set `storage/logs/` to 755
3. Set `.env` to 600
4. Ensure web server user can write to storage

### Environment Not Detected as Production

**If environment shows as "development":**

1. Check `.env` has `APP_ENV=production`
2. Verify you're accessing via `okjtech.co.ke` domain
3. Server IP should be `51.89.113.223`

### Migration Errors

**If migrations fail:**

1. Check database user has CREATE/ALTER permissions
2. Verify database exists
3. Check error logs in `storage/logs/`
4. You may need to run migrations manually via phpMyAdmin SQL

## 📝 Post-Deployment

1. **Test all functionality:**
   - User registration
   - Booking submission
   - Admin login
   - Client portal

2. **Monitor logs:**
   - `storage/logs/errors.log`
   - `storage/logs/database.log`
   - `storage/logs/email.log`

3. **Backup regularly:**
   - Database exports
   - Important uploaded files

## 🔒 Security Checklist

- [ ] `.env` file has 600 permissions
- [ ] `deploy-production.php` deleted
- [ ] `DEBUG_MODE=false` in production
- [ ] No development files uploaded
- [ ] Strong passwords used
- [ ] SSL/HTTPS enabled
- [ ] File permissions correct

## 📞 Support

If you encounter issues:
1. Check error logs in `storage/logs/`
2. Review deployment script output
3. Verify all steps completed successfully

---

**Note:** This deployment method works without terminal access. However, if you get terminal/SSH access later, you can use the automated setup script: `scripts/setup-production.sh`

