# Curated Dependency Recommendations for South Ring Autos

## Overview
This document provides a curated list of dependencies that should be implemented based on the current system architecture and immediate needs.

## ✅ Recommended for Immediate Implementation

### NPM Dependencies

#### 1. **date-fns** - Date Formatting
**Priority**: High  
**Where to use**: 
- `js/dashboard-components.js` - Grid date formatters
- `js/client-vehicle-details.js` - Date displays
- `js/admin-dashboard.js` - Date formatting in stats
- All grid components displaying dates

**Installation**:
```bash
npm install date-fns --save
```

**Integration**:
```javascript
// In dashboard-components.js
import { format, formatDistanceToNow } from 'date-fns';

// Replace date formatters
formatter: (value) => {
    if (!value) return 'N/A';
    return format(new Date(value), 'MMM dd, yyyy');
}

// Relative time
formatter: (value) => {
    if (!value) return 'N/A';
    return formatDistanceToNow(new Date(value), { addSuffix: true });
}
```

#### 2. **validator** - Form Validation
**Priority**: High  
**Where to use**:
- `js/client-auth.js` - Registration/login validation
- `js/booking.js` - Booking form validation
- `js/admin-blog.js` - Blog post validation
- All form submissions

**Installation**:
```bash
npm install validator --save
```

**Integration**:
```javascript
import validator from 'validator';

// Email validation
if (!validator.isEmail(email)) {
    showError('Invalid email address');
    return;
}

// Phone validation (Kenyan format)
if (!validator.isMobilePhone(phone, 'en-KE')) {
    showError('Invalid phone number');
    return;
}
```

#### 3. **toastr** - Toast Notifications
**Priority**: High  
**Where to use**:
- Replace all `alert()` calls
- `js/client-auth.js` - Login/registration feedback
- `js/booking.js` - Booking confirmations
- `js/admin-blog.js` - Blog post operations
- `js/dashboard-components.js` - Grid actions feedback
- All API response handlers

**Installation**:
```bash
npm install toastr --save
```

**Integration**:
```javascript
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

// Configure toastr
toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: 'toast-top-right',
    timeOut: 3000
};

// Usage
toastr.success('Booking created successfully!');
toastr.error('Error creating booking');
toastr.info('Processing...');
toastr.warning('Please check your input');
```

#### 4. **browser-image-compression** - Image Optimization
**Priority**: High  
**Where to use**:
- `js/admin-blog.js` - Blog image uploads
- `js/client-vehicle-details.js` - Vehicle image uploads
- Any FilePond integration
- Profile picture uploads

**Installation**:
```bash
npm install browser-image-compression --save
```

**Integration**:
```javascript
import imageCompression from 'browser-image-compression';

// Before FilePond upload
const compressImage = async (file) => {
    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
    };
    return await imageCompression(file, options);
};
```

### Composer Dependencies

#### 1. **phpmailer/phpmailer** - Email Sending
**Priority**: High  
**Where to use**:
- `src/Utils/Email.php` - Replace custom email implementation
- Booking confirmations
- Password reset emails
- Notification emails
- Invoice emails

**Installation**:
```bash
composer require phpmailer/phpmailer
```

**Integration**:
```php
// In src/Utils/Email.php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Email {
    public static function send($to, $subject, $body, $isHTML = true) {
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host = SMTP_HOST;
            $mail->SMTPAuth = true;
            $mail->Username = SMTP_USER;
            $mail->Password = SMTP_PASS;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = SMTP_PORT;
            
            $mail->setFrom(EMAIL_FROM, APP_NAME);
            $mail->addAddress($to);
            $mail->isHTML($isHTML);
            $mail->Subject = $subject;
            $mail->Body = $body;
            
            return $mail->send();
        } catch (Exception $e) {
            error_log("Email error: {$mail->ErrorInfo}");
            return false;
        }
    }
}
```

#### 2. **intervention/image** - Image Processing
**Priority**: High  
**Where to use**:
- `api/upload-blog-image.php` - Blog image processing
- Vehicle image uploads
- Profile picture uploads
- Thumbnail generation
- Image optimization

**Installation**:
```bash
composer require intervention/image
```

**Integration**:
```php
// In upload handlers
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

$manager = new ImageManager(new Driver());
$image = $manager->read($uploadedFile);
$image->resize(1920, 1080, function ($constraint) {
    $constraint->aspectRatio();
    $constraint->upsize();
});
$image->save($destinationPath, quality: 85);
```

#### 3. **monolog/monolog** - Logging
**Priority**: High  
**Where to use**:
- Replace all `error_log()` calls
- `src/Utils/Logger.php` - Centralized logging
- API error logging
- Authentication logging
- Payment logging

**Installation**:
```bash
composer require monolog/monolog
```

**Integration**:
```php
// In src/Utils/Logger.php
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\RotatingFileHandler;

class Logger {
    private static $instance = null;
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Logger('south-ring-autos');
            $handler = new RotatingFileHandler(
                LOG_PATH . '/app.log',
                7, // Keep 7 days
                Logger::DEBUG
            );
            self::$instance->pushHandler($handler);
        }
        return self::$instance;
    }
    
    public static function info($message, $context = []) {
        self::getInstance()->info($message, $context);
    }
    
    public static function error($message, $context = []) {
        self::getInstance()->error($message, $context);
    }
}
```

#### 4. **guzzlehttp/guzzle** - HTTP Client
**Priority**: Medium  
**Where to use**:
- External API integrations
- Payment gateway integrations (M-Pesa, etc.)
- Webhook handlers
- Third-party service calls

**Installation**:
```bash
composer require guzzlehttp/guzzle
```

**Integration**:
```php
use GuzzleHttp\Client;

// In payment gateway integration
$client = new Client();
$response = $client->post('https://api.mpesa.com/v1/...', [
    'json' => $paymentData,
    'headers' => [
        'Authorization' => 'Bearer ' . $token
    ]
]);
```

## 📋 Recommended for Near-Term Implementation

### NPM Dependencies

#### 5. **jspdf** + **jspdf-autotable** - PDF Generation
**Priority**: Medium  
**Where to use**:
- `client/payment-history.php` - Invoice generation
- `client/booking-details.php` - Booking confirmation PDFs
- `admin/bookings.php` - Report generation
- Export functionality

**Installation**:
```bash
npm install jspdf jspdf-autotable --save
```

**Integration**:
```javascript
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Generate invoice
const generateInvoice = (payment) => {
    const doc = new jsPDF();
    doc.text('Invoice', 20, 20);
    doc.autoTable({
        head: [['Item', 'Amount']],
        body: [
            ['Service', `KES ${payment.amount}`]
        ]
    });
    doc.save(`invoice-${payment.id}.pdf`);
};
```

#### 6. **xlsx** - Excel Export
**Priority**: Medium  
**Where to use**:
- `admin/bookings.php` - Export bookings
- `admin/analytics.php` - Export reports
- `client/payment-history.php` - Export payment history
- All grid components

**Installation**:
```bash
npm install xlsx --save
```

**Integration**:
```javascript
import * as XLSX from 'xlsx';

// Export grid data
const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${filename}.xlsx`);
};
```

### Composer Dependencies

#### 5. **dompdf/dompdf** - Server-side PDF
**Priority**: Medium  
**Where to use**:
- `api/generate-invoice.php` - Invoice generation
- Email attachments
- Booking confirmations
- Reports

**Installation**:
```bash
composer require dompdf/dompdf
```

**Integration**:
```php
use Dompdf\Dompdf;

// Generate PDF
$dompdf = new Dompdf();
$dompdf->loadHtml($htmlContent);
$dompdf->setPaper('A4', 'portrait');
$dompdf->render();
$dompdf->stream('invoice.pdf');
```

#### 6. **league/csv** - CSV Handling
**Priority**: Medium  
**Where to use**:
- Bulk data import
- Export functionality
- Data migration scripts
- Report generation

**Installation**:
```bash
composer require league/csv
```

**Integration**:
```php
use League\Csv\Reader;
use League\Csv\Writer;

// Import CSV
$csv = Reader::createFromPath($filePath);
$csv->setHeaderOffset(0);
foreach ($csv as $record) {
    // Process record
}

// Export CSV
$csv = Writer::createFromString();
$csv->insertOne(['Name', 'Email', 'Phone']);
$csv->insertAll($data);
```

## 🔮 Future Enhancements (Low Priority)

### NPM Dependencies
- **quill** - Rich text editor for blog posts
- **i18next** - Multi-language support (English/Swahili)
- **animejs** - Smooth animations

### Composer Dependencies
- **symfony/messenger** - Queue system for async tasks
- **symfony/rate-limiter** - API rate limiting
- **symfony/security-csrf** - CSRF protection
- **respect/validation** - Advanced validation rules

## Implementation Order

### Phase 1 (Immediate - Week 1)
1. ✅ **date-fns** - Quick win, improves all date displays
2. ✅ **toastr** - Better UX, replace all alerts
3. ✅ **validator** - Improve form validation
4. ✅ **phpmailer/phpmailer** - Professional email sending

### Phase 2 (Week 2-3)
5. ✅ **intervention/image** - Image optimization
6. ✅ **monolog/monolog** - Professional logging
7. ✅ **browser-image-compression** - Client-side optimization

### Phase 3 (Month 2)
8. ✅ **jspdf** - PDF generation
9. ✅ **guzzlehttp/guzzle** - External API integration
10. ✅ **xlsx** - Export functionality
11. ✅ **dompdf/dompdf** - Server-side PDF
12. ✅ **league/csv** - CSV handling

## Notes

- All high-priority dependencies are actively maintained
- Consider bundle size impact for npm packages
- Test compatibility with existing code before full rollout
- Update webpack.config.js for new npm packages
- Update composer.json and run `composer update`
- Some packages may require additional configuration (see individual package docs)

## Quick Install Commands

```bash
# NPM - High Priority
npm install date-fns validator toastr browser-image-compression --save

# NPM - Medium Priority
npm install jspdf jspdf-autotable xlsx --save

# Composer - High Priority
composer require phpmailer/phpmailer intervention/image monolog/monolog

# Composer - Medium Priority
composer require guzzlehttp/guzzle dompdf/dompdf league/csv
```

