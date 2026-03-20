# Upload Bundle Fixes - Production

## Issue
The production server is still loading source JavaScript files that use `require()`, causing `Uncaught ReferenceError: require is not defined` errors.

## Files to Upload

### 1. Updated PHP Files (Reference Bundled JS)
Upload these files that now reference the bundled versions:

- ✅ `client/login.php` - Now uses `../js/dist/client-auth.bundle.js`
- ✅ `client/register.php` - Now uses `../js/dist/client-auth.bundle.js`
- ✅ `client/dashboard.php` - Now uses `../js/dist/client-dashboard.bundle.js`
- ✅ `admin/login.php` - Now uses `../js/dist/admin-login.bundle.js`
- ✅ `booking.php` - Now uses `js/dist/booking.bundle.js`

### 2. JavaScript Bundle Files
Upload the entire `js/dist/` directory with all bundles:

- `js/dist/client-auth.bundle.js` (129 KB)
- `js/dist/client-dashboard.bundle.js` (3.74 KB)
- `js/dist/client-vehicle-details.bundle.js` (155 KB)
- `js/dist/admin-login.bundle.js` (1.02 KB)
- `js/dist/admin-dashboard.bundle.js` (148 KB)
- `js/dist/admin-blog.bundle.js` (297 KB)
- `js/dist/admin-bookings.bundle.js` (150 KB)
- `js/dist/admin-car-brands.bundle.js` (8.13 KB)
- `js/dist/dashboard-components.bundle.js` (42.5 KB)
- `js/dist/dashboard-grid-simple.bundle.js` (37.6 KB)
- **`js/dist/booking.bundle.js` (132 KB)** ← NEW, must upload

### 3. Configuration Files
- `webpack.config.js` - Updated to include booking.js

## Quick Upload Checklist

```bash
# Upload these directories/files:
✅ client/login.php
✅ client/register.php
✅ client/dashboard.php
✅ admin/login.php
✅ booking.php
✅ js/dist/ (entire directory with all .bundle.js files)
✅ webpack.config.js
```

## After Upload

1. **Clear browser cache** or do a hard refresh (Ctrl+F5 / Cmd+Shift+R)

2. **Test these pages:**
   - `https://okjtech.co.ke/apps/SouthRingAutos/booking.php`
   - `https://okjtech.co.ke/apps/SouthRingAutos/client/login.php`
   - `https://okjtech.co.ke/apps/SouthRingAutos/client/register.php`
   - `https://okjtech.co.ke/apps/SouthRingAutos/admin/login.php`

3. **Verify no errors in browser console:**
   - Open Developer Tools (F12)
   - Check Console tab
   - Should see no `require is not defined` errors

## Verification

After uploading, check that:
- ✅ All pages load without JavaScript errors
- ✅ Forms submit correctly
- ✅ No `require is not defined` errors in console
- ✅ Bundled files are accessible (check Network tab)

---

**Note:** The `booking.bundle.js` file is **NEW** and must be uploaded. Without it, the booking page will fail.

