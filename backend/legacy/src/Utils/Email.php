<?php

namespace SouthRingAutos\Utils;

use Monolog\Handler\StreamHandler;
use Monolog\Logger;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mime\Email as SymfonyEmail;

/**
 * Email Utility Class
 * Handles sending emails for notifications
 */
class Email
{
    private $mailer;
    private $logger;
    private $fromEmail;
    private $fromName;

    public function __construct()
    {
        $this->logger = new Logger('email');
        $this->logger->pushHandler(new StreamHandler(LOG_PATH . '/email.log', Logger::INFO));

        $this->fromEmail = EMAIL_FROM;
        $this->fromName = EMAIL_FROM_NAME;

        try {
            // Create SMTP transport
            // Handle SSL/TLS encryption based on port and encryption setting
            $encryption = defined('SMTP_ENCRYPTION') ? strtolower(SMTP_ENCRYPTION) : 'tls';
            
            // For port 465 (SSL), use smtps:// scheme
            // For port 587 (TLS) or other, use smtp:// with encryption parameter
            if (SMTP_PORT == 465) {
                // Port 465 requires SSL encryption
                $dsn = sprintf(
                    'smtps://%s:%s@%s:%d',
                    urlencode(SMTP_USER),
                    urlencode(SMTP_PASS),
                    SMTP_HOST,
                    SMTP_PORT
                );
            } else {
                // Port 587 or others use TLS or the specified encryption
                $encryptionParam = ($encryption === 'ssl' || SMTP_PORT == 465) ? 'ssl' : 'tls';
                $dsn = sprintf(
                    'smtp://%s:%s@%s:%d?encryption=%s',
                    urlencode(SMTP_USER),
                    urlencode(SMTP_PASS),
                    SMTP_HOST,
                    SMTP_PORT,
                    $encryptionParam
                );
            }

            $transport = Transport::fromDsn($dsn);
            $this->mailer = new Mailer($transport);
        } catch (\Exception $e) {
            $this->logger->error('Email setup failed', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Send email
     */
    public function send($to, $subject, $body, $html = true)
    {
        try {
            // Set from address with name if available
            $fromAddress = ! empty($this->fromName)
                ? new \Symfony\Component\Mime\Address($this->fromEmail, $this->fromName)
                : $this->fromEmail;

            $email = (new SymfonyEmail())
                ->from($fromAddress)
                ->to($to)
                ->subject($subject)
                ->text($html ? strip_tags($body) : $body);

            if ($html) {
                $email->html($body);
            }

            $this->mailer->send($email);
            $this->logger->info('Email sent', ['to' => $to, 'subject' => $subject]);

            return true;
        } catch (\Exception $e) {
            $this->logger->error('Email send failed', [
                'to' => $to,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Send booking notification email
     */
    public function sendBookingNotification($booking)
    {
        // Check if notifications are enabled (allows for runtime configuration)
        if (! defined('NOTIFY_ON_BOOKING') || ! NOTIFY_ON_BOOKING) {
            return false;
        }

        $subject = 'New Booking Request - ' . $booking['name'];
        $body = $this->getBookingEmailTemplate($booking);

        return $this->send(ADMIN_EMAIL, $subject, $body);
    }

    /**
     * Send contact form notification
     */
    public function sendContactNotification($contact)
    {
        // Check if notifications are enabled (allows for runtime configuration)
        if (! defined('NOTIFY_ON_CONTACT') || ! NOTIFY_ON_CONTACT) {
            return false;
        }

        $subject = 'New Contact Form Submission - ' . ($contact['subject'] ?? 'No Subject');
        $body = $this->getContactEmailTemplate($contact);

        return $this->send(ADMIN_EMAIL, $subject, $body);
    }

    /**
     * Send booking confirmation to customer
     */
    public function sendBookingConfirmation($booking)
    {
        $subject = 'Booking Confirmation - ' . COMPANY_NAME;
        $body = $this->getBookingConfirmationTemplate($booking);

        return $this->send($booking['email'], $subject, $body);
    }

    /**
     * Get booking email template
     */
    private function getBookingEmailTemplate($booking)
    {
        return "
        <h2>New Booking Request</h2>
        <p><strong>Name:</strong> {$booking['name']}</p>
        <p><strong>Phone:</strong> {$booking['phone']}</p>
        <p><strong>Email:</strong> " . ($booking['email'] ?? 'N/A') . "</p>
        <p><strong>Vehicle Registration:</strong> {$booking['registration']}</p>
        <p><strong>Service:</strong> {$booking['service']}</p>
        <p><strong>Preferred Date:</strong> " . ($booking['date'] ?? 'Not specified') . "</p>
        <p><strong>Message:</strong><br>" . nl2br($booking['message'] ?? 'None') . "</p>
        <p><strong>Submitted:</strong> " . date('Y-m-d H:i:s') . "</p>
        ";
    }

    /**
     * Get contact email template
     */
    private function getContactEmailTemplate($contact)
    {
        return "
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> {$contact['name']}</p>
        <p><strong>Email:</strong> {$contact['email']}</p>
        <p><strong>Phone:</strong> " . ($contact['phone'] ?? 'N/A') . "</p>
        <p><strong>Subject:</strong> " . ($contact['subject'] ?? 'No Subject') . "</p>
        <p><strong>Message:</strong><br>" . nl2br($contact['message']) . "</p>
        <p><strong>Submitted:</strong> " . date('Y-m-d H:i:s') . "</p>
        ";
    }

    /**
     * Get booking confirmation template
     */
    private function getBookingConfirmationTemplate($booking)
    {
        return "
        <h2>Booking Confirmation</h2>
        <p>Dear {$booking['name']},</p>
        <p>Thank you for booking with " . COMPANY_NAME . "!</p>
        <p><strong>Your Booking Details:</strong></p>
        <ul>
            <li><strong>Service:</strong> {$booking['service']}</li>
            <li><strong>Vehicle Registration:</strong> {$booking['registration']}</li>
            <li><strong>Preferred Date:</strong> " . ($booking['date'] ?? 'To be confirmed') . "</li>
        </ul>
        <p>We will contact you shortly to confirm your appointment.</p>
        <p>If you have any questions, please call us at " . COMPANY_PHONE . "</p>
        <p>Best regards,<br>" . COMPANY_NAME . "</p>
        ";
    }

    /**
     * Send car ready notification
     */
    public function sendCarReadyNotification($clientEmail, $clientName, $booking)
    {
        $subject = 'Your Vehicle is Ready for Collection - ' . COMPANY_NAME;
        $body = "
        <h2>Vehicle Ready for Collection</h2>
        <p>Dear {$clientName},</p>
        <p>Great news! Your vehicle is now ready for collection.</p>
        <p><strong>Vehicle Details:</strong></p>
        <ul>
            <li><strong>Registration:</strong> {$booking['registration']}</li>
            <li><strong>Service:</strong> {$booking['service']}</li>
            " . ($booking['actual_cost'] ? "<li><strong>Total Cost:</strong> KES " . number_format($booking['actual_cost'], 2) . "</li>" : "") . "
        </ul>
        <p>You can collect your vehicle during our business hours:</p>
        <p><strong>Monday - Friday:</strong> " . HOURS_MON_FRI . "<br>
        <strong>Saturday parking:</strong> " . HOURS_SAT . "<br>
        <strong>Sunday:</strong> " . HOURS_SUN . "</p>
        <p>Our location: " . COMPANY_ADDRESS . "</p>
        <p>If you have any questions, please call us at " . COMPANY_PHONE . "</p>
        <p>Thank you for choosing " . COMPANY_NAME . "!</p>
        <p>Best regards,<br>" . COMPANY_NAME . "</p>
        ";

        return $this->send($clientEmail, $subject, $body);
    }

    /**
     * Send progress update notification
     */
    public function sendProgressUpdate($clientEmail, $clientName, $booking, $progress)
    {
        $subject = 'Repair Progress Update - ' . $booking['registration'];
        $body = "
        <h2>Repair Progress Update</h2>
        <p>Dear {$clientName},</p>
        <p>We have an update on your vehicle repair:</p>
        <p><strong>Vehicle:</strong> {$booking['registration']}</p>
        <p><strong>Current Stage:</strong> {$progress['stage']}</p>
        <p><strong>Progress:</strong> {$progress['progress_percentage']}%</p>
        " . ($progress['description'] ? "<p><strong>Update:</strong> {$progress['description']}</p>" : "") . "
        <p>You can track your repair progress in your client dashboard at any time.</p>
        <p>If you have any questions, please call us at " . COMPANY_PHONE . "</p>
        <p>Best regards,<br>" . COMPANY_NAME . "</p>
        ";

        return $this->send($clientEmail, $subject, $body);
    }

    /**
     * Send payment confirmation
     */
    public function sendPaymentConfirmation($clientEmail, $clientName, $payment, $booking)
    {
        $subject = 'Payment Confirmed - ' . COMPANY_NAME;
        $body = "
        <h2>Payment Confirmed</h2>
        <p>Dear {$clientName},</p>
        <p>Your payment has been confirmed.</p>
        <p><strong>Payment Details:</strong></p>
        <ul>
            <li><strong>Amount:</strong> KES " . number_format($payment['amount'], 2) . "</li>
            <li><strong>Vehicle:</strong> {$booking['registration']}</li>
            <li><strong>Payment Method:</strong> " . ($payment['payment_method'] ?? 'N/A') . "</li>
            " . ($payment['transaction_id'] ? "<li><strong>Transaction ID:</strong> {$payment['transaction_id']}</li>" : "") . "
        </ul>
        <p>Thank you for your payment!</p>
        <p>Best regards,<br>" . COMPANY_NAME . "</p>
        ";

        return $this->send($clientEmail, $subject, $body);
    }

    /**
     * Send delivery confirmation
     */
    public function sendDeliveryConfirmation($clientEmail, $clientName, $delivery)
    {
        $subject = 'Delivery ' . ucfirst($delivery['type']) . ' Confirmed - ' . COMPANY_NAME;
        $scheduled = $delivery['scheduled_date'] ? date('l, F j, Y \a\t g:i A', strtotime($delivery['scheduled_date'])) : 'To be confirmed';

        $body = "
        <h2>Delivery " . ucfirst($delivery['type']) . " Confirmed</h2>
        <p>Dear {$clientName},</p>
        <p>Your {$delivery['type']} request has been confirmed.</p>
        <p><strong>Scheduled Date & Time:</strong> {$scheduled}</p>
        <p><strong>Address:</strong> {$delivery['address']}</p>
        " . ($delivery['city'] ? "<p><strong>City:</strong> {$delivery['city']}</p>" : "") . "
        <p>Our team will contact you before arrival.</p>
        <p>If you have any questions, please call us at " . COMPANY_PHONE . "</p>
        <p>Best regards,<br>" . COMPANY_NAME . "</p>
        ";

        return $this->send($clientEmail, $subject, $body);
    }
}
