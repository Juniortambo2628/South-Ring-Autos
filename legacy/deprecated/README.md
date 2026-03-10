# Deprecated HTML Files

This directory contains old HTML files that have been replaced with PHP equivalents.

## Files Moved Here

All static HTML files have been moved to this directory as they are no longer in use. The application now uses PHP files for all pages:

- `index.html` → `index.php`
- `blog.html` → `blog.php`
- `blog-single.html` → `blog-single.php`
- `booking.html` → `booking.php`
- `about.html` → `about.php`
- `contact.html` → `contact.php`
- `service.html` → `service.php`
- `testimonial.html` → `testimonial.php`
- `team.html` → (No PHP equivalent - may be removed if not needed)
- `404.html` → (Custom 404 page - consider creating `404.php` if needed)

## Reason for Deprecation

These files have been replaced with PHP versions to:
- Enable dynamic content loading from the database
- Support better SEO with server-side rendering
- Integrate with the backend API
- Provide consistent navigation using PHP includes
- Support user authentication and session management

## Migration Notes

- All references to `.html` files have been updated to `.php` in:
  - JavaScript files (`js/blog.js`)
  - PHP files (`test-system.php`)
  - Client authentication pages

- The `blog-single.html` file was converted to `blog-single.php` and now uses PHP includes for header and footer

## Backup

These files are kept here as a backup reference. They can be safely deleted once confirmed that all functionality works correctly with the PHP versions.

