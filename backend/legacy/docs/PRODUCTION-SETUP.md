# Production Environment Setup Guide

This guide explains how to configure the South Ring Autos application for production deployment.

## Production Server Details

- **Domain**: okjtech.co.ke
- **IP Address**: 51.89.113.223
- **Home Directory**: /home/zhpebukm
- **App Directory**: /home/zhpebukm/public_html/apps/SouthRingAutos

## Environment Detection

The application automatically detects the environment based on:

1. **APP_ENV** environment variable (if explicitly set)
2. Server IP address (51.89.113.223)
3. Domain name (okjtech.co.ke)
4. File system path (/home/zhpebukm)

If any of these match production criteria, the app will run in production mode.

## Database Configuration

### Production Database Credentials

```env
DB_HOST=localhost
DB_NAME=zhpebukm_southringautos
DB_USER=zhpebukm_southringautos
DB_PASS=southringautos@2025
DB_PORT=3306
```

## Email Configuration

### Production Email Settings

The email system uses SSL/TLS encryption on port 465:

```env
SMTP_HOST=mail.okjtech.co.ke
SMTP_PORT=465
SMTP_USER=southring@okjtech.co.ke
SMTP_PASS=southringautos@2025
SMTP_ENCRYPTION=ssl
EMAIL_FROM=southring@okjtech.co.ke
EMAIL_FROM_NAME=South Ring Autos Ltd
ADMIN_EMAIL=southring@okjtech.co.ke
```

### Email Server Details

- **Incoming Server**: mail.okjtech.co.ke
  - IMAP Port: 993
  - POP3 Port: 995
- **Outgoing Server**: mail.okjtech.co.ke
  - SMTP Port: 465 (SSL/TLS)

## Setup Instructions

### 1. Create .env File

On the production server, create a `.env` file in the application root:

```bash
cd /home/zhpebukm/public_html/apps/SouthRingAutos
cp .env.example .env
```

### 2. Configure Production Settings

Edit the `.env` file with production credentials:

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

BASE_URL=https://okjtech.co.ke/apps/SouthRingAutos
```

### 3. Set File Permissions

Ensure proper file permissions:

```bash
# Make storage directories writable
chmod -R 755 storage/
chmod -R 755 logs/

# Protect .env file
chmod 600 .env
```

### 4. Install Dependencies

```bash
composer install --no-dev --optimize-autoloader
```

### 5. Run Database Migrations

```bash
php vendor/bin/phinx migrate -e production
```

### 6. Verify Environment Detection

The application should automatically detect production mode. You can verify by checking:

- Server IP matches: 51.89.113.223
- Domain matches: okjtech.co.ke
- Path matches: /home/zhpebukm

## Security Checklist

- [ ] `.env` file has correct permissions (600)
- [ ] `DEBUG_MODE=false` in production
- [ ] Database credentials are secure
- [ ] Email credentials are secure
- [ ] Storage directories have proper permissions
- [ ] `.env` file is in `.gitignore` (not committed)
- [ ] SSL/TLS is enabled for email
- [ ] Error display is disabled (errors logged only)

## Verification

After deployment, verify:

1. **Environment Detection**: Check that `APP_ENV` is detected as `production`
2. **Database Connection**: Ensure database connects successfully
3. **Email Configuration**: Test sending a test email
4. **Error Handling**: Verify errors are logged, not displayed
5. **File Permissions**: Ensure files are readable/writable as needed

## Troubleshooting

### Environment Not Detecting Production

If the environment is not automatically detected as production:

1. Explicitly set `APP_ENV=production` in `.env`
2. Verify server IP: `echo $SERVER_ADDR`
3. Verify domain: `echo $HTTP_HOST`
4. Check file path: `pwd`

### Email Not Sending

1. Verify SMTP credentials
2. Check firewall allows outbound port 465
3. Verify SSL/TLS is properly configured
4. Check email logs: `storage/logs/email.log`

### Database Connection Issues

1. Verify database credentials
2. Check database server is running
3. Verify database user has proper permissions
4. Check database logs: `storage/logs/database.log`

## Maintenance

### Log Files

Monitor these log files in production:

- `storage/logs/errors.log` - Application errors
- `storage/logs/email.log` - Email sending logs
- `storage/logs/database.log` - Database operations
- `storage/logs/debug.log` - Debug information (if enabled)

### Backup

Regular backups should include:

- Database dumps
- `.env` file (securely stored)
- Uploaded files in `storage/uploads/`
- Important configuration files

## Support

For issues or questions, contact the development team.

