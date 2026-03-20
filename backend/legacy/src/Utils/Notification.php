<?php

namespace SouthRingAutos\Utils;

use Monolog\Handler\StreamHandler;
use Monolog\Logger;

/**
 * Notification Manager
 * Handles various notification types
 */
class Notification
{
    private $email;
    private $logger;

    public function __construct()
    {
        $this->email = new Email();
        $this->logger = new Logger('notification');
        $this->logger->pushHandler(new StreamHandler(LOG_PATH . '/notifications.log', Logger::INFO));
    }

    /**
     * Send booking notification
     */
    public function notifyBooking($booking)
    {
        // Check notification setting (allows for future configuration changes)
        if (defined('NOTIFY_ON_BOOKING') && NOTIFY_ON_BOOKING === true) {
            $this->email->sendBookingNotification($booking);
            $this->logger->info('Booking notification sent', ['booking_id' => $booking['id'] ?? 'new']);

            // Send confirmation to customer if email provided
            if (! empty($booking['email'])) {
                $this->email->sendBookingConfirmation($booking);
            }
        }
    }

    /**
     * Send contact form notification
     */
    public function notifyContact($contact)
    {
        // Check notification setting (allows for future configuration changes)
        if (defined('NOTIFY_ON_CONTACT') && NOTIFY_ON_CONTACT === true) {
            $this->email->sendContactNotification($contact);
            $this->logger->info('Contact notification sent', ['email' => $contact['email']]);
        }
    }

    /**
     * Log notification (for future SMS/WhatsApp integration)
     */
    public function log($type, $data)
    {
        $this->logger->info("Notification: {$type}", $data);
    }
}
