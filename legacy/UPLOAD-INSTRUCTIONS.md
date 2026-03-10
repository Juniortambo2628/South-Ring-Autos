# 📤 Upload Instructions - Production Deployment

## ✅ Pre-Deployment Complete

Your system is **ready for upload** with:
- ✅ Production JavaScript bundles built and minified
- ✅ Composer dependencies optimized
- ✅ Configuration files updated with correct BASE_URL
- ✅ Email credentials updated

## 📋 Production Configuration Summary

### Server Information
- **Target Directory:** `/home/zhpebukm/public_html/apps/SouthRingAutos`
- **Production URL:** `https://okjtech.co.ke/apps/SouthRingAutos`
- **Server IP:** 51.89.113.223

### Database
- **Host:** localhost
- **Database:** zhpebukm_southringautos
- **User:** zhpebukm_southringautos
- **Password:** southringautos@2025

### Email (SSL/TLS)
- **SMTP Host:** mail.okjtech.co.ke
- **SMTP Port:** 465
- **Username:** southringautos@okjtech.co.ke
- **Password:** southringautos@2025
- **Encryption:** SSL

## 📦 What to Upload

### ✅ Upload These:
- All PHP files (entire codebase)
- `js/dist/` - Production JavaScript bundles
- `css/` - All CSS files
- `vendor/` - Composer dependencies (or install on server)
- `storage/` - Create directories if they don't exist
- `South-ring-logos/` - Logo files
- `composer.json` and `composer.lock`
- `.env-production` - Use as template

### ❌ Don't Upload:
- `node_modules/` - Not needed
- `.git/` - Optional
- `tests/` - Test files
- `.env` - Create fresh on server
- `.env.local` - Local config
- IDE files

## 🚀 Upload Steps

### Step 1: Upload Files
Upload all files to: `/home/zhpebukm/public_html/apps/SouthRingAutos`

### Step 2: Create .env File on Server
```bash
cd /home/zhpebukm/public_html/apps/SouthRingAutos
cp .env-production .env
chmod 600 .env
```

The `.env-production` file already contains all the correct credentials:
- Database credentials ✅
- Email credentials ✅
- BASE_URL ✅

### Step 3: Set Permissions
```bash
chmod 600 .env
chmod -R 755 storage/
chmod -R 755 storage/logs/
chmod -R 755 storage/uploads/
chmod -R 755 storage/cache/
```

### Step 4: Install Dependencies (if vendor/ not uploaded)
```bash
composer install --no-dev --optimize-autoloader
```

### Step 5: Verify Deployment
Visit: `https://okjtech.co.ke/apps/SouthRingAutos/admin/login.php`

## ✅ Verification Checklist

After upload, verify:
- [ ] Admin login page loads
- [ ] Can login to admin dashboard
- [ ] Client registration works
- [ ] Booking submission works
- [ ] Email configuration accessible (Admin → Settings)
- [ ] No error messages displayed
- [ ] Environment detected as "production"

## 🔧 Quick Fixes (if needed)

### If environment not detected as production:
Add to `.env`:
```
APP_ENV=production
DEBUG_MODE=false
```

### If database connection fails:
Verify credentials in `.env` match production database

### If email not working:
1. Go to Admin → Settings → Email Configuration
2. Verify SMTP settings
3. Send test email

---

**Status:** ✅ **READY TO UPLOAD**

All files are prepared and configured for production deployment.

