# Production Deployment Checklist

## Pre-Deployment Preparation

### 1. Build Assets for Production
```bash
# Build JavaScript bundles (minified for production)
npm run build

# Verify bundles were created
ls -la js/dist/*.bundle.js
```

### 2. Install Production Dependencies
```bash
# Install only production dependencies (no dev dependencies)
composer install --no-dev --optimize-autoloader

# Verify vendor directory
ls -la vendor/
```

### 3. Environment Configuration
- [ ] Create `.env` file from `.env.example`
- [ ] Set `APP_ENV=production`
- [ ] Set `DEBUG_MODE=false`
- [ ] Configure database credentials
- [ ] Configure email SMTP settings
- [ ] Set `BASE_URL=https://okjtech.co.ke/apps/SouthRingAutos`
- [ ] Set file permissions: `chmod 600 .env`

### 4. File Permissions
```bash
# Set correct permissions
chmod 600 .env
chmod -R 755 storage/
chmod -R 755 storage/logs/
chmod -R 755 storage/uploads/
chmod -R 755 storage/cache/
```

### 5. Database Preparation
- [ ] Export database from development
- [ ] Create production database: `zhpebukm_southringautos`
- [ ] Import database to production
- [ ] Verify all tables exist
- [ ] Update admin password (if needed)

## Deployment Steps

### Step 1: Upload Files
- [ ] Upload all files to `/home/zhpebukm/public_html/apps/SouthRingAutos`
- [ ] Exclude development files:
  - `node_modules/`
  - `.git/`
  - `.env.local`
  - `tests/`
  - IDE files (`.idea/`, `.vscode/`)

### Step 2: Create .env File
```bash
cd /home/zhpebukm/public_html/apps/SouthRingAutos
cp .env.example .env
# Edit .env with production credentials
chmod 600 .env
```

### Step 3: Set Permissions
```bash
chmod 600 .env
chmod -R 755 storage/
chmod -R 755 storage/logs/
chmod -R 755 storage/uploads/
chmod -R 755 storage/cache/
```

### Step 4: Install Dependencies
```bash
# Install Composer dependencies (production only)
composer install --no-dev --optimize-autoloader

# If npm is available on server, build assets
npm install --production
npm run build
```

### Step 5: Verify Environment Detection
- [ ] Visit: `https://okjtech.co.ke/apps/SouthRingAutos/admin/login.php`
- [ ] Check that environment is detected as "production"
- [ ] Verify DEBUG_MODE is false (no error messages displayed)

### Step 6: Test Database Connection
- [ ] Login to admin panel
- [ ] Verify dashboard loads
- [ ] Check that data is accessible

### Step 7: Test Email Configuration
- [ ] Go to Admin → Settings → Email Configuration
- [ ] Configure SMTP settings
- [ ] Send test email
- [ ] Verify email is received

### Step 8: Test Core Functionality
- [ ] Client registration works
- [ ] Client login works
- [ ] Booking submission works
- [ ] Admin can view bookings
- [ ] Admin can update booking status
- [ ] File uploads work (blog images, etc.)

## Post-Deployment Verification

### Security Checks
- [ ] `.env` file has 600 permissions
- [ ] `DEBUG_MODE=false` in production
- [ ] No error messages visible to users
- [ ] SSL/HTTPS is enabled
- [ ] Strong passwords are set
- [ ] Development files are not accessible

### Performance Checks
- [ ] JavaScript bundles are minified
- [ ] CSS is optimized
- [ ] Images are optimized
- [ ] Caching is working
- [ ] Page load times are acceptable

### Functionality Checks
- [ ] All forms submit correctly
- [ ] Email notifications are sent
- [ ] File uploads work
- [ ] Database queries execute properly
- [ ] Session management works
- [ ] Authentication works

## Monitoring

### Log Files to Monitor
- `storage/logs/app.log` - Application logs
- `storage/logs/errors.log` - Error logs
- Server error logs (Apache/Nginx)

### Regular Maintenance
- [ ] Monitor error logs weekly
- [ ] Backup database weekly
- [ ] Update dependencies monthly
- [ ] Review security settings quarterly

## Rollback Plan

If issues occur:
1. Restore previous database backup
2. Restore previous file backup
3. Check error logs: `storage/logs/errors.log`
4. Verify `.env` configuration
5. Check file permissions

## Support

If deployment issues occur:
1. Check `storage/logs/errors.log`
2. Verify `.env` file configuration
3. Check file permissions
4. Verify database connection
5. Check server error logs

---

**Last Updated:** 2025-01-XX
**Production URL:** https://okjtech.co.ke

