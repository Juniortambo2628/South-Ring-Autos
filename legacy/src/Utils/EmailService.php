<?php
/**
 * Email Service
 * Wrapper for PHPMailer to send emails
 */

namespace SouthRingAutos\Utils;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailService
{
    private $mailer;
    private $fromEmail;
    private $fromName;

    public function __construct()
    {
        $this->mailer = new PHPMailer(true);
        // Use global constants if defined, otherwise use defaults
        // Note: Constants are defined globally, access them directly
        $this->fromEmail = defined('MAIL_FROM_EMAIL') ? constant('MAIL_FROM_EMAIL') : 'noreply@southringautos.com';
        $this->fromName = defined('MAIL_FROM_NAME') ? constant('MAIL_FROM_NAME') : 'South Ring Autos';
        
        $this->configure();
    }

    /**
     * Configure PHPMailer settings
     */
    private function configure()
    {
        try {
            // Server settings
            $smtpEnabled = defined('MAIL_SMTP_ENABLED') && constant('MAIL_SMTP_ENABLED');
            if ($smtpEnabled) {
                $this->mailer->isSMTP();
                $this->mailer->Host = (defined('MAIL_SMTP_HOST') && constant('MAIL_SMTP_HOST')) ? constant('MAIL_SMTP_HOST') : 'localhost';
                $this->mailer->SMTPAuth = (defined('MAIL_SMTP_AUTH') && constant('MAIL_SMTP_AUTH')) ? constant('MAIL_SMTP_AUTH') : true;
                $this->mailer->Username = (defined('MAIL_SMTP_USER') && constant('MAIL_SMTP_USER')) ? constant('MAIL_SMTP_USER') : '';
                $this->mailer->Password = (defined('MAIL_SMTP_PASS') && constant('MAIL_SMTP_PASS')) ? constant('MAIL_SMTP_PASS') : '';
                $smtpSecure = (defined('MAIL_SMTP_SECURE') && constant('MAIL_SMTP_SECURE')) ? constant('MAIL_SMTP_SECURE') : PHPMailer::ENCRYPTION_STARTTLS;
                $this->mailer->SMTPSecure = $smtpSecure;
                $this->mailer->Port = (defined('MAIL_SMTP_PORT') && constant('MAIL_SMTP_PORT')) ? constant('MAIL_SMTP_PORT') : 587;
            } else {
                $this->mailer->isMail();
            }

            // Default settings
            $this->mailer->CharSet = 'UTF-8';
            $this->mailer->isHTML(true);
            $this->mailer->setFrom($this->fromEmail, $this->fromName);
        } catch (Exception $e) {
            \SouthRingAutos\Utils\Logger::logError("EmailService configuration error: " . $e->getMessage());
        }
    }

    /**
     * Send email
     * @param string $to Email address
     * @param string $subject Subject line
     * @param string $body HTML body
     * @param string $altBody Plain text alternative
     * @param array $attachments Array of file paths
     * @return bool Success status
     */
    public function send($to, $subject, $body, $altBody = '', $attachments = [])
    {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->clearAttachments();
            
            $this->mailer->addAddress($to);
            $this->mailer->Subject = $subject;
            $this->mailer->Body = $body;
            $this->mailer->AltBody = $altBody ?: strip_tags($body);

            // Add attachments
            foreach ($attachments as $attachment) {
                if (file_exists($attachment)) {
                    $this->mailer->addAttachment($attachment);
                }
            }

            return $this->mailer->send();
        } catch (Exception $e) {
            \SouthRingAutos\Utils\Logger::logError("EmailService send error: " . $this->mailer->ErrorInfo);
            return false;
        }
    }

    /**
     * Send booking confirmation email
     * @param array $bookingData Booking information
     * @return bool Success status
     */
    public function sendBookingConfirmation($bookingData)
    {
        $subject = "Booking Confirmation - South Ring Autos";
        $body = \SouthRingAutos\Utils\EmailTemplate::bookingConfirmation($bookingData);
        
        return $this->send(
            $bookingData['email'],
            $subject,
            $body
        );
    }

    /**
     * Send booking status update email
     * @param array $bookingData Booking information with status
     * @return bool Success status
     */
    public function sendBookingStatusUpdate($bookingData)
    {
        $subject = "Booking Status Update - South Ring Autos";
        $body = \SouthRingAutos\Utils\EmailTemplate::bookingStatusUpdate($bookingData);
        
        return $this->send(
            $bookingData['email'],
            $subject,
            $body
        );
    }

    /**
     * Send password reset email
     * @param array $userData User information with reset link
     * @return bool Success status
     */
    public function sendPasswordReset($userData)
    {
        $subject = "Password Reset Request - South Ring Autos";
        $body = \SouthRingAutos\Utils\EmailTemplate::passwordReset($userData);
        
        return $this->send(
            $userData['email'],
            $subject,
            $body
        );
    }

    /**
     * Send password reset success email
     * @param array $userData User information
     * @return bool Success status
     */
    public function sendPasswordResetSuccess($userData)
    {
        $subject = "Password Reset Successful - South Ring Autos";
        $body = \SouthRingAutos\Utils\EmailTemplate::passwordResetSuccess($userData);
        
        return $this->send(
            $userData['email'],
            $subject,
            $body
        );
    }

    /**
     * Send welcome email
     * @param array $userData User information
     * @return bool Success status
     */
    public function sendWelcomeEmail($userData)
    {
        $subject = "Welcome to South Ring Autos!";
        $body = \SouthRingAutos\Utils\EmailTemplate::welcomeEmail($userData);
        
        return $this->send(
            $userData['email'],
            $subject,
            $body
        );
    }

    /**
     * Send booking reminder email
     * @param array $bookingData Booking information
     * @return bool Success status
     */
    public function sendBookingReminder($bookingData)
    {
        $subject = "Service Reminder - South Ring Autos";
        $body = \SouthRingAutos\Utils\EmailTemplate::bookingReminder($bookingData);
        
        return $this->send(
            $bookingData['email'],
            $subject,
            $body
        );
    }
    /**
     * Send account creation email with password
     * @param string $email User email
     * @param string $password Generated password
     * @param string $name User name
     * @return bool Success status
     */
    public function sendAccountCreationEmail($email, $password, $name)
    {
        $subject = "Welcome to South Ring Autos - Account Created";
        $body = \SouthRingAutos\Utils\EmailTemplate::accountCreation([
            'name' => $name,
            'email' => $email,
            'password' => $password
        ]);
        
        return $this->send(
            $email,
            $subject,
            $body
        );
    }

    /**
     * Send booking linked email for existing users
     * @param string $email User email
     * @param string $name User name
     * @param int $bookingId Booking ID
     * @return bool Success status
     */
    public function sendBookingLinkedEmail($email, $name, $bookingId)
    {
        $subject = "Booking Received - South Ring Autos";
        $body = \SouthRingAutos\Utils\EmailTemplate::bookingLinked([
            'name' => $name,
            'booking_id' => $bookingId
        ]);
        
        return $this->send(
            $email,
            $subject,
            $body
        );
    }
}

