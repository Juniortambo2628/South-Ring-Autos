# Dependency Recommendations

## Overview

This document provides recommendations for npm and Composer dependencies that can extend the utility of the South Ring Autos system and replace custom implementations with tested, maintained libraries.

## NPM Dependencies

### 1. **Date & Time Management**

```bash
npm install date-fns --save
```

**Why**: Replace custom date formatting with a robust, lightweight library

- Better than moment.js (smaller bundle size)
- Tree-shakeable
- Immutable and functional
- Use cases: Format dates in grids, relative time displays, date calculations

### 2. **Form Validation**

```bash
npm install validator --save
```

**Why**: Comprehensive client-side validation

- Email, phone, URL validation
- Credit card validation
- Password strength checking
- Use cases: Registration forms, booking forms, profile updates

### 3. **Toast Notifications**

```bash
npm install react-toastify --save
# OR for vanilla JS:
npm install toastr --save
```

**Why**: Better user feedback than alert() dialogs

- Non-blocking notifications
- Multiple notification types
- Auto-dismiss
- Use cases: Success/error messages, booking confirmations, status updates

### 4. **Data Export**

```bash
npm install xlsx --save
# OR
npm install papaparse --save
```

**Why**: Export grid data to Excel/CSV

- Client-side export
- No server processing needed
- Use cases: Export bookings, payments, reports

### 5. **Rich Text Editor**

```bash
npm install quill --save
# OR
npm install tinymce --save
```

**Why**: Replace textarea for blog content

- WYSIWYG editing
- Image upload support
- Formatting options
- Use cases: Blog post editor, email templates

### 6. **Chart Libraries (Alternative/Enhancement)**

```bash
npm install chart.js --save  # Already using, but consider:
npm install apexcharts --save  # More features
# OR
npm install recharts --save  # React-based (if migrating)
```

**Why**: Enhanced charting capabilities

- More chart types
- Better animations
- Interactive features
- Use cases: Analytics dashboard, reports

### 7. **PDF Generation**

```bash
npm install jspdf --save
npm install jspdf-autotable --save
```

**Why**: Generate invoices and reports client-side

- Invoice generation
- Report PDFs
- Booking confirmations
- Use cases: Payment receipts, booking confirmations, reports

### 8. **Image Processing**

```bash
npm install browser-image-compression --save
```

**Why**: Client-side image compression before upload

- Reduce upload size
- Faster uploads
- Better UX
- Use cases: Vehicle images, blog images, profile pictures

### 9. **Internationalization (i18n)**

```bash
npm install i18next --save
npm install i18next-browser-languagedetector --save
```

**Why**: Multi-language support

- Dynamic language switching
- Translation management
- Use cases: English/Swahili support for Kenyan market

### 10. **State Management (if needed)**

```bash
npm install zustand --save
# OR
npm install mobx --save
```

**Why**: Centralized state management

- Share data across components
- Better than global variables
- Use cases: Shopping cart, booking flow, user preferences

### 11. **Animation Library**

```bash
npm install framer-motion --save
# OR for vanilla JS:
npm install animejs --save
```

**Why**: Smooth animations and transitions

- Better UX
- Professional feel
- Use cases: Page transitions, loading states, notifications

### 12. **Email Validation & Formatting**

```bash
npm install email-validator --save
```

**Why**: Robust email validation

- Better than regex
- Handles edge cases
- Use cases: Registration, contact forms

## Composer Dependencies

### 1. **Email Sending**

```bash
composer require phpmailer/phpmailer
# OR
composer require symfony/mailer
```

**Why**: Replace custom email implementation

- SMTP support
- HTML emails
- Attachments
- Use cases: Booking confirmations, invoices, notifications

### 2. **PDF Generation (Server-side)**

```bash
composer require dompdf/dompdf
# OR
composer require tecnickcom/tcpdf
```

**Why**: Server-side PDF generation

- Invoice generation
- Reports
- Booking confirmations
- Use cases: Payment receipts, booking confirmations

### 3. **Image Processing**

```bash
composer require intervention/image
```

**Why**: Server-side image manipulation

- Resize, crop, watermark
- Format conversion
- Optimization
- Use cases: Vehicle thumbnails, blog images, profile pictures

### 4. **Validation**

```bash
composer require respect/validation
# OR
composer require symfony/validator
```

**Why**: Server-side validation

- Comprehensive rules
- Better than custom validation
- Use cases: API endpoints, form processing

### 5. **CSV/Excel Handling**

```bash
composer require league/csv
# OR
composer require phpoffice/phpspreadsheet
```

**Why**: Import/export functionality

- Import vehicle data
- Export reports
- Data migration
- Use cases: Bulk operations, reports, data import

### 6. **Caching**

```bash
composer require predis/predis
# OR for file-based (already have custom):
composer require symfony/cache
```

**Why**: Better caching implementation

- Redis support
- Multiple adapters
- Better performance
- Use cases: API response caching, session storage

### 7. **Logging**

```bash
composer require monolog/monolog
```

**Why**: Professional logging

- Multiple handlers
- Log levels
- File/email/database logging
- Use cases: Error tracking, audit logs, debugging

### 8. **HTTP Client**

```bash
composer require guzzlehttp/guzzle
```

**Why**: Better than cURL

- Simple API
- Request/response handling
- Async requests
- Use cases: API integrations, webhooks, external services

### 9. **Database Query Builder**

```bash
composer require illuminate/database
# OR
composer require doctrine/dbal
```

**Why**: Replace raw SQL with query builder

- Type-safe queries
- Easier migrations
- Better security
- Use cases: All database operations

### 10. **Environment Management**

```bash
composer require vlucas/phpdotenv
```

**Why**: Better environment variable management

- .env file support
- Type casting
- Validation
- Use cases: Configuration management

### 11. **CSRF Protection**

```bash
composer require symfony/security-csrf
```

**Why**: Built-in CSRF protection

- Token generation
- Validation
- Better than custom implementation
- Use cases: Form submissions, API security

### 12. **Rate Limiting**

```bash
composer require symfony/rate-limiter
```

**Why**: API rate limiting

- Prevent abuse
- DDoS protection
- Use cases: Login attempts, API endpoints

### 13. **Queue System**

```bash
composer require symfony/messenger
# OR
composer require illuminate/queue
```

**Why**: Background job processing

- Email sending
- Image processing
- Report generation
- Use cases: Async operations, scheduled tasks

### 14. **Testing**

```bash
composer require --dev phpunit/phpunit
composer require --dev codeception/codeception
composer require --dev mockery/mockery
```

**Why**: Comprehensive testing

- Unit tests
- Integration tests
- E2E tests
- Use cases: All code testing

### 15. **Code Quality**

```bash
composer require --dev phpstan/phpstan
composer require --dev php-cs-fixer/php-cs-fixer
composer require --dev phpmd/phpmd
```

**Why**: Code quality tools

- Static analysis
- Code formatting
- Complexity analysis
- Use cases: Code review, CI/CD
- Priority Recommendations

### High Priority (Immediate Value)

1. **date-fns** - Date formatting
2. **validator** - Form validation
3. **phpmailer/phpmailer** - Email sending
4. **intervention/image** - Image processing
5. **monolog/monolog** - Logging

### Medium Priority (Nice to Have)

1. **toastr** - Notifications
2. **jspdf** - PDF generation
3. **browser-image-compression** - Image optimization
4. **guzzlehttp/guzzle** - HTTP client
5. **league/csv** - CSV handling

### Low Priority (Future Enhancements)

1. **i18next** - Multi-language
2. **quill** - Rich text editor
3. **animejs** - Animations
4. **symfony/messenger** - Queue system
5. **symfony/rate-limiter** - Rate limiting

## Installation Commands

### NPM

```bash
# High priority
npm install date-fns validator toastr jspdf jspdf-autotable browser-image-compression --save

# Medium priority
npm install xlsx quill apexcharts --save

# Low priority
npm install i18next i18next-browser-languagedetector animejs --save
```

### Composer

```bash
# High priority
composer require phpmailer/phpmailer intervention/image monolog/monolog guzzlehttp/guzzle

# Medium priority
composer require dompdf/dompdf league/csv respect/validation

# Low priority
composer require symfony/messenger symfony/rate-limiter symfony/security-csrf
```

## Integration Examples

### Date Formatting (date-fns)

```javascript
import { format, formatDistanceToNow } from 'date-fns';

// In grid formatter
formatter: (value) => format(new Date(value), 'MMM dd, yyyy')
// Relative time
formatter: (value) => formatDistanceToNow(new Date(value), { addSuffix: true })
```

### Email Validation (validator)

```javascript
import validator from 'validator';

if (validator.isEmail(email)) {
    // Valid email
}
```

### Toast Notifications (toastr)

```javascript
import toastr from 'toastr';

toastr.success('Booking created successfully!');
toastr.error('Error creating booking');
```

### PDF Generation (jspdf)

```javascript
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const doc = new jsPDF();
doc.text('Invoice', 20, 20);
doc.autoTable({ html: '#invoice-table' });
doc.save('invoice.pdf');
```

### Image Compression (browser-image-compression)

```javascript
import imageCompression from 'browser-image-compression';

const compressedFile = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920
});
```

## Notes

- All recommended packages are actively maintained
- Consider bundle size when adding npm packages
- Test compatibility with existing code
- Update webpack.config.js for new entry points if needed
- Some packages may require additional configuration
