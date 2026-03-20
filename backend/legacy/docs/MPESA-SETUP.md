# MPESA Payment Integration Setup Guide

This guide explains how to set up and use the MPESA STK Push payment system for South Ring Autos.

## Overview

The MPESA integration allows customers to pay for services using their mobile phones via Safaricom's STK Push feature. The system:
- Initiates payment requests via STK Push
- Tracks payment status
- Handles payment callbacks from Safaricom
- Updates booking status automatically
- Provides payment analytics

## Prerequisites

1. Safaricom Developer Account: https://developer.safaricom.co.ke/
2. Business Short Code (PayBill): 4072183
3. Valid SSL Certificate (for production callback URLs)
4. Server with PHP 7.4+ and cURL extension

## Setup Steps

### 1. Register on Safaricom Developer Portal

1. Go to https://developer.safaricom.co.ke/
2. Create an account or log in
3. Create a new application
4. Note your Consumer Key and Consumer Secret

### 2. Generate Passkey

1. In the Developer Portal, go to your app settings
2. Navigate to "API Keys" or "Security" section
3. Generate a Passkey (if not already generated)
4. Save the Passkey securely

### 3. Configure Environment Variables

Create or update `.env` file in project root:

```env
# MPESA Configuration
MPESA_ENV=sandbox  # Use 'sandbox' for testing, 'production' for live
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_BUSINESS_SHORT_CODE=4072183
MPESA_PASSKEY=your_passkey_here
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback.php
```

### 4. Set Up Callback URL

1. In Safaricom Developer Portal, go to your app
2. Add callback URL: `https://yourdomain.com/api/mpesa/callback.php`
3. Ensure the URL is publicly accessible (HTTPS required for production)
4. Test the callback URL is reachable

### 5. Database Configuration

The payment system uses the existing `payments` table. Ensure it has these columns:
- `id` (INT, PRIMARY KEY)
- `booking_id` (INT, FOREIGN KEY)
- `client_id` (INT, FOREIGN KEY)
- `amount` (DECIMAL)
- `payment_method` (VARCHAR) - stores 'MPESA'
- `transaction_id` (VARCHAR) - stores MPESA receipt number
- `status` (VARCHAR) - 'pending', 'processing', 'completed', 'failed'
- `payment_date` (TIMESTAMP)
- `created_at` (TIMESTAMP)

## API Endpoints

### 1. Initiate Payment (STK Push)

**Endpoint:** `POST /api/mpesa/initiate.php`

**Request Body:**
```json
{
    "booking_id": 123,
    "phone": "254712345678",
    "amount": 10000.00
}
```

**Response:**
```json
{
    "success": true,
    "message": "The service request is processed successfully.",
    "customer_message": "Success. Request accepted for processing",
    "checkout_request_id": "ws_CO_DMZ_123456789",
    "deposit_amount": 7500.00,
    "total_amount": 10000.00
}
```

**Notes:**
- Phone number can be in format: 254712345678, +254712345678, or 0712345678
- Amount is the total service cost (system calculates 75% deposit automatically)
- Account reference is automatically set to vehicle registration number

### 2. Verify Payment Status

**Endpoint:** `GET /api/mpesa/verify.php?checkout_request_id=ws_CO_DMZ_123456789`

**Response:**
```json
{
    "success": true,
    "payment": {
        "id": 45,
        "booking_id": 123,
        "amount": 7500.00,
        "status": "completed",
        "transaction_id": "QGH4M5KJ7K",
        "payment_date": "2025-01-15 10:30:00"
    }
}
```

### 3. Payment Callback

**Endpoint:** `POST /api/mpesa/callback.php`

This endpoint is called automatically by Safaricom. Do not call it manually.

## Payment Flow

1. **Customer initiates payment:**
   - Frontend calls `/api/mpesa/initiate.php` with booking details
   - System calculates 75% deposit
   - STK Push is sent to customer's phone

2. **Customer completes payment:**
   - Customer enters MPESA PIN on their phone
   - Safaricom processes payment

3. **Callback received:**
   - Safaricom sends callback to `/api/mpesa/callback.php`
   - System updates payment status
   - Booking status changes to 'confirmed'
   - Notification sent to client

4. **Payment verified:**
   - Frontend can poll `/api/mpesa/verify.php` to check status
   - Or wait for webhook/callback notification

## Testing

### Sandbox Testing

1. Use sandbox credentials from Developer Portal
2. Use test phone numbers provided by Safaricom
3. Test callback URL using Safaricom's test tools
4. Verify payments appear in database

### Production Testing

1. Switch `MPESA_ENV` to 'production'
2. Use production credentials
3. Test with real phone numbers
4. Monitor callback logs at `logs/mpesa-callbacks.log`

## Monitoring & Analytics

### Payment Logs

All callbacks are logged to: `logs/mpesa-callbacks.log`

### Database Queries

View all MPESA payments:
```sql
SELECT * FROM payments WHERE payment_method = 'MPESA' ORDER BY created_at DESC;
```

View pending payments:
```sql
SELECT * FROM payments WHERE payment_method = 'MPESA' AND status IN ('pending', 'processing');
```

View successful payments:
```sql
SELECT * FROM payments WHERE payment_method = 'MPESA' AND status = 'completed';
```

### Admin Analytics

Access payment analytics in Admin Dashboard → Analytics page:
- Payment Methods Breakdown chart
- Payment Status Overview
- Revenue by payment method

## Troubleshooting

### Common Issues

1. **"Access token failed"**
   - Check Consumer Key and Secret are correct
   - Verify API credentials in Developer Portal
   - Check network connectivity

2. **"Callback not received"**
   - Verify callback URL is publicly accessible
   - Check URL is configured in Developer Portal
   - Review logs/mpesa-callbacks.log

3. **"Payment not updating"**
   - Check database connection
   - Verify payment record exists
   - Review callback logs

4. **"Phone number format error"**
   - Ensure phone is in format: 254XXXXXXXXX
   - Remove spaces and special characters
   - System auto-formats, but verify input

## Security Considerations

1. **API Credentials:**
   - Never commit credentials to version control
   - Use environment variables
   - Rotate credentials regularly

2. **Callback URL:**
   - Use HTTPS in production
   - Validate callback signatures (future enhancement)
   - Rate limit callback endpoint

3. **Data Privacy:**
   - Encrypt sensitive payment data
   - Follow PCI-DSS guidelines where applicable
   - Secure database access

## Support

For MPESA API issues:
- Safaricom Developer Portal: https://developer.safaricom.co.ke/
- Documentation: https://developer.safaricom.co.ke/docs
- Support: developer@safaricom.co.ke

## Payment Disclaimer

**Deposit Policy:**
- A 75% deposit is required to secure bookings
- Remaining 25% balance is due upon vehicle collection
- Payment can be made via MPESA PayBill: 4072183
- Account Number: Vehicle registration number

**MPESA PayBill Details:**
- PayBill Number: **4072183**
- Account Number: **Your Vehicle Registration** (e.g., KCA 123A)





