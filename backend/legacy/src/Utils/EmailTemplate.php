<?php
/**
 * Email Template System
 * Provides branded email templates with company colors
 */

namespace SouthRingAutos\Utils;

class EmailTemplate
{
    // Brand colors
    private const PRIMARY_COLOR = '#D81324';      // Red
    private const SECONDARY_COLOR = '#0B2154';   // Dark Blue
    private const TEXT_COLOR = '#333333';
    private const BG_COLOR = '#F5F5F5';
    private const BORDER_COLOR = '#E0E0E0';

    /**
     * Get base email template with branding
     */
    private static function getBaseTemplate($content, $title = '')
    {
        $logoUrl = defined('BASE_URL') ? constant('BASE_URL') . '/South-ring-logos/SR-Logo-red-White-BG.png' : '';
        $companyName = defined('COMPANY_NAME') ? constant('COMPANY_NAME') : 'South Ring Autos Ltd';
        $companyPhone = defined('COMPANY_PHONE') ? constant('COMPANY_PHONE') : '+254 704 113 472';
        $companyEmail = defined('COMPANY_EMAIL') ? constant('COMPANY_EMAIL') : 'southringautos@gmail.com';
        $companyAddress = defined('COMPANY_ADDRESS') ? constant('COMPANY_ADDRESS') : 'Bogani East Lane, off Bogani East Road';
        
        return '
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>' . htmlspecialchars($title ?: 'South Ring Autos') . '</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: ' . self::BG_COLOR . ';">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: ' . self::BG_COLOR . ';">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, ' . self::PRIMARY_COLOR . ' 0%, #a00 100%); padding: 30px 40px; text-align: center;">
                            <img src="' . htmlspecialchars($logoUrl) . '" alt="' . htmlspecialchars($companyName) . '" style="max-width: 200px; height: auto; margin-bottom: 10px;" onerror="this.style.display=\'none\'">
                            <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 600;">' . htmlspecialchars($companyName) . '</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            ' . $content . '
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: ' . self::SECONDARY_COLOR . '; padding: 30px 40px; text-align: center; color: #FFFFFF;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">' . htmlspecialchars($companyName) . '</p>
                            <p style="margin: 0 0 5px 0; font-size: 12px; opacity: 0.9;">' . htmlspecialchars($companyAddress) . '</p>
                            <p style="margin: 0 0 5px 0; font-size: 12px; opacity: 0.9;">Phone: ' . htmlspecialchars($companyPhone) . '</p>
                            <p style="margin: 0; font-size: 12px; opacity: 0.9;">Email: ' . htmlspecialchars($companyEmail) . '</p>
                            <p style="margin: 15px 0 0 0; font-size: 11px; opacity: 0.7; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px;">
                                &copy; ' . date('Y') . ' ' . htmlspecialchars($companyName) . '. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>';
    }

    /**
     * Booking confirmation email template
     */
    public static function bookingConfirmation($bookingData)
    {
        $bookingId = htmlspecialchars($bookingData['id'] ?? 'N/A');
        $name = htmlspecialchars($bookingData['name'] ?? 'Customer');
        $service = htmlspecialchars($bookingData['service'] ?? 'Service');
        $vehicle = htmlspecialchars($bookingData['vehicle'] ?? 'Vehicle');
        $date = htmlspecialchars($bookingData['date'] ?? date('Y-m-d'));
        $message = !empty($bookingData['message']) ? '<p style="margin-top: 20px; padding: 15px; background-color: #F9F9F9; border-left: 4px solid ' . self::PRIMARY_COLOR . '; border-radius: 4px;"><strong>Your Message:</strong><br>' . nl2br(htmlspecialchars($bookingData['message'])) . '</p>' : '';
        
        $content = '
            <h2 style="color: ' . self::PRIMARY_COLOR . '; margin: 0 0 20px 0; font-size: 22px;">Booking Confirmation</h2>
            <p style="color: ' . self::TEXT_COLOR . '; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Dear ' . $name . ',</p>
            <p style="color: ' . self::TEXT_COLOR . '; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">Thank you for booking with us! Your service request has been received and confirmed.</p>
            
            <div style="background-color: #F9F9F9; border-radius: 8px; padding: 25px; margin: 25px 0; border-left: 4px solid ' . self::PRIMARY_COLOR . ';">
                <h3 style="color: ' . self::SECONDARY_COLOR . '; margin: 0 0 20px 0; font-size: 18px;">Booking Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: ' . self::TEXT_COLOR . '; font-size: 14px; border-bottom: 1px solid ' . self::BORDER_COLOR . ';"><strong>Booking ID:</strong></td>
                        <td style="padding: 8px 0; color: ' . self::TEXT_COLOR . '; font-size: 14px; border-bottom: 1px solid ' . self::BORDER_COLOR . '; text-align: right;">#' . $bookingId . '</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: ' . self::TEXT_COLOR . '; font-size: 14px; border-bottom: 1px solid ' . self::BORDER_COLOR . ';"><strong>Service:</strong></td>
                        <td style="padding: 8px 0; color: ' . self::TEXT_COLOR . '; font-size: 14px; border-bottom: 1px solid ' . self::BORDER_COLOR . '; text-align: right;">' . $service . '</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: ' . self::TEXT_COLOR . '; font-size: 14px; border-bottom: 1px solid ' . self::BORDER_COLOR . ';"><strong>Vehicle:</strong></td>
                        <td style="padding: 8px 0; color: ' . self::TEXT_COLOR . '; font-size: 14px; border-bottom: 1px solid ' . self::BORDER_COLOR . '; text-align: right;">' . $vehicle . '</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: ' . self::TEXT_COLOR . '; font-size: 14px;"><strong>Preferred Date:</strong></td>
                        <td style="padding: 8px 0; color: ' . self::TEXT_COLOR . '; font-size: 14px; text-align: right;">' . $date . '</td>
                    </tr>
                </table>
            </div>
            
            ' . $message . '
            
            <p style="color: ' . self::TEXT_COLOR . '; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">Our team will contact you shortly to confirm the appointment time and provide any additional information you may need.</p>
            
            <div style="margin-top: 30px; padding: 20px; background-color: #F0F7FF; border-radius: 8px; border-left: 4px solid ' . self::SECONDARY_COLOR . ';">
                <p style="margin: 0; color: ' . self::TEXT_COLOR . '; font-size: 14px;"><strong>Need to make changes?</strong> Please contact us at ' . (defined('COMPANY_PHONE') ? constant('COMPANY_PHONE') : '+254 704 113 472') . ' or reply to this email.</p>
            </div>
        ';
        
        return self::getBaseTemplate($content, 'Booking Confirmation');
    }

    /**
     * Booking status update email template
     */
    public static function bookingStatusUpdate($bookingData)
    {
        $name = htmlspecialchars($bookingData['name'] ?? 'Customer');
        $bookingId = htmlspecialchars($bookingData['id'] ?? 'N/A');
        $status = htmlspecialchars($bookingData['status'] ?? 'updated');
        $service = htmlspecialchars($bookingData['service'] ?? 'Service');
        $statusMessages = [
            'confirmed' => 'Your booking has been confirmed!',
            'in_progress' => 'We have started working on your vehicle.',
            'completed' => 'Your service has been completed!',
            'cancelled' => 'Your booking has been cancelled.',
            'pending' => 'Your booking is pending confirmation.'
        ];
        $statusMessage = $statusMessages[$status] ?? 'Your booking status has been updated.';
        $statusColor = $status === 'completed' ? '#28a745' : ($status === 'cancelled' ? '#dc3545' : self::PRIMARY_COLOR);
        
        $content = '
            <h2 style="color: ' . self::PRIMARY_COLOR . '; margin: 0 0 20px 0; font-size: 22px;">Booking Status Update</h2>
            <p style="color: ' . self::TEXT_COLOR . '; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Dear ' . $name . ',</p>
            <p style="color: ' . self::TEXT_COLOR . '; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">' . $statusMessage . '</p>
            
            <div style="background-color: #F9F9F9; border-radius: 8px; padding: 25px; margin: 25px 0; border-left: 4px solid ' . $statusColor . ';">
                <h3 style="color: ' . self::SECONDARY_COLOR . '; margin: 0 0 15px 0; font-size: 18px;">Booking Information</h3>
                <p style="margin: 0 0 10px 0; color: ' . self::TEXT_COLOR . '; font-size: 14px;"><strong>Booking ID:</strong> #' . $bookingId . '</p>
                <p style="margin: 0 0 10px 0; color: ' . self::TEXT_COLOR . '; font-size: 14px;"><strong>Service:</strong> ' . $service . '</p>
                <p style="margin: 0; color: ' . $statusColor . '; font-size: 14px; font-weight: 600;"><strong>Status:</strong> ' . ucfirst($status) . '</p>
            </div>
            
            ' . (!empty($bookingData['message']) ? '<p style="color: ' . self::TEXT_COLOR . '; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; padding: 15px; background-color: #F9F9F9; border-radius: 4px;">' . nl2br(htmlspecialchars($bookingData['message'])) . '</p>' : '') . '
            
            <p style="color: ' . self::TEXT_COLOR . '; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">If you have any questions, please don\'t hesitate to contact us.</p>
        ';
        
        return self::getBaseTemplate($content, 'Booking Status Update');
    }

    /**
     * Password reset email template
     */
    public static function passwordReset($userData)
    {
        $name = htmlspecialchars($userData['name'] ?? 'User');
        $resetLink = htmlspecialchars($userData['reset_link'] ?? '#');
        $expiryHours = $userData['expiry_hours'] ?? 24;
        
        $content = '
            <h2 style="color: ' . self::PRIMARY_COLOR . '; margin: 0 0 20px 0; font-size: 22px;">Password Reset Request</h2>
            <p style="color: ' . self::TEXT_COLOR . '; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Dear ' . $name . ',</p>
            <p style="color: ' . self::TEXT_COLOR . '; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">We received a request to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="' . $resetLink . '" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, ' . self::PRIMARY_COLOR . ' 0%, #a00 100%); color: #FFFFFF; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(216, 19, 36, 0.3);">Reset Password</a>
            </div>
            
            <p style="color: ' . self::TEXT_COLOR . '; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0;">Or copy and paste this link into your browser:</p>
            <p style="color: ' . self::PRIMARY_COLOR . '; font-size: 12px; word-break: break-all; margin: 10px 0 0 0; padding: 10px; background-color: #F9F9F9; border-radius: 4px;">' . $resetLink . '</p>
            
            <div style="margin-top: 30px; padding: 20px; background-color: #FFF3CD; border-radius: 8px; border-left: 4px solid #ffc107;">
                <p style="margin: 0; color: ' . self::TEXT_COLOR . '; font-size: 14px;"><strong>Important:</strong> This link will expire in ' . $expiryHours . ' hours. If you didn\'t request a password reset, please ignore this email or contact us if you have concerns.</p>
            </div>
            
            <p style="color: ' . self::TEXT_COLOR . '; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0;">For security reasons, never share this link with anyone.</p>
        ';
        
        return self::getBaseTemplate($content, 'Password Reset');
    }

    /**
     * Password reset success email template
     */
    public static function passwordResetSuccess($userData)
    {
        $name = htmlspecialchars($userData['name'] ?? 'User');
        
        $content = '
            <h2 style="color: #28a745; margin: 0 0 20px 0; font-size: 22px;">Password Successfully Reset</h2>
            <p style="color: ' . self::TEXT_COLOR . '; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Dear ' . $name . ',</p>
            <p style="color: ' . self::TEXT_COLOR . '; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">Your password has been successfully reset. You can now log in with your new password.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="' . (defined('BASE_URL') ? constant('BASE_URL') : '') . '/client/login.php" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, ' . self::PRIMARY_COLOR . ' 0%, #a00 100%); color: #FFFFFF; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(216, 19, 36, 0.3);">Login to Your Account</a>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background-color: #D4EDDA; border-radius: 8px; border-left: 4px solid #28a745;">
                <p style="margin: 0; color: ' . self::TEXT_COLOR . '; font-size: 14px;"><strong>Security Tip:</strong> If you didn\'t reset your password, please contact us immediately at ' . (defined('COMPANY_PHONE') ? constant('COMPANY_PHONE') : '+254 704 113 472') . '.</p>
            </div>
        ';
        
        return self::getBaseTemplate($content, 'Password Reset Successful');
    }

    /**
     * Welcome email template (for new registrations)
     */
    public static function welcomeEmail($userData)
    {
        $name = htmlspecialchars($userData['name'] ?? 'Customer');
        
        $content = '
            <h2 style="color: ' . self::PRIMARY_COLOR . '; margin: 0 0 20px 0; font-size: 22px;">Welcome to South Ring Autos!</h2>
            <p style="color: ' . self::TEXT_COLOR . '; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Dear ' . $name . ',</p>
            <p style="color: ' . self::TEXT_COLOR . '; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">Thank you for creating an account with South Ring Autos! We\'re excited to have you as part of our community.</p>
            
            <div style="background-color: #F9F9F9; border-radius: 8px; padding: 25px; margin: 25px 0; border-left: 4px solid ' . self::PRIMARY_COLOR . ';">
                <h3 style="color: ' . self::SECONDARY_COLOR . '; margin: 0 0 15px 0; font-size: 18px;">What you can do:</h3>
                <ul style="margin: 0; padding-left: 20px; color: ' . self::TEXT_COLOR . '; font-size: 14px; line-height: 1.8;">
                    <li>Book service appointments online</li>
                    <li>Track your vehicle\'s repair progress in real-time</li>
                    <li>Request convenient pickup and delivery services</li>
                    <li>Access all your service history and invoices</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="' . (defined('BASE_URL') ? constant('BASE_URL') : '') . '/client/dashboard.php" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, ' . self::PRIMARY_COLOR . ' 0%, #a00 100%); color: #FFFFFF; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(216, 19, 36, 0.3);">Access Your Dashboard</a>
            </div>
            
            <p style="color: ' . self::TEXT_COLOR . '; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">If you have any questions, feel free to contact us. We\'re here to help!</p>
        ';
        
        return self::getBaseTemplate($content, 'Welcome to South Ring Autos');
    }

    /**
     * Booking reminder email template
     */
    public static function bookingReminder($bookingData)
    {
        $name = htmlspecialchars($bookingData['name'] ?? 'Customer');
        $bookingId = htmlspecialchars($bookingData['id'] ?? 'N/A');
        $service = htmlspecialchars($bookingData['service'] ?? 'Service');
        $date = htmlspecialchars($bookingData['date'] ?? date('Y-m-d'));
        $time = !empty($bookingData['time']) ? htmlspecialchars($bookingData['time']) : 'To be confirmed';
        
        $content = '
            <h2 style="color: ' . self::PRIMARY_COLOR . '; margin: 0 0 20px 0; font-size: 22px;">Upcoming Service Reminder</h2>
            <p style="color: ' . self::TEXT_COLOR . '; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Dear ' . $name . ',</p>
            <p style="color: ' . self::TEXT_COLOR . '; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">This is a friendly reminder about your upcoming service appointment.</p>
            
            <div style="background-color: #F9F9F9; border-radius: 8px; padding: 25px; margin: 25px 0; border-left: 4px solid ' . self::PRIMARY_COLOR . ';">
                <h3 style="color: ' . self::SECONDARY_COLOR . '; margin: 0 0 20px 0; font-size: 18px;">Appointment Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: ' . self::TEXT_COLOR . '; font-size: 14px; border-bottom: 1px solid ' . self::BORDER_COLOR . ';"><strong>Booking ID:</strong></td>
                        <td style="padding: 8px 0; color: ' . self::TEXT_COLOR . '; font-size: 14px; border-bottom: 1px solid ' . self::BORDER_COLOR . '; text-align: right;">#' . $bookingId . '</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: ' . self::TEXT_COLOR . '; font-size: 14px; border-bottom: 1px solid ' . self::BORDER_COLOR . ';"><strong>Service:</strong></td>
                        <td style="padding: 8px 0; color: ' . self::TEXT_COLOR . '; font-size: 14px; border-bottom: 1px solid ' . self::BORDER_COLOR . '; text-align: right;">' . $service . '</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: ' . self::TEXT_COLOR . '; font-size: 14px; border-bottom: 1px solid ' . self::BORDER_COLOR . ';"><strong>Date:</strong></td>
                        <td style="padding: 8px 0; color: ' . self::TEXT_COLOR . '; font-size: 14px; border-bottom: 1px solid ' . self::BORDER_COLOR . '; text-align: right;">' . $date . '</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: ' . self::TEXT_COLOR . '; font-size: 14px;"><strong>Time:</strong></td>
                        <td style="padding: 8px 0; color: ' . self::TEXT_COLOR . '; font-size: 14px; text-align: right;">' . $time . '</td>
                    </tr>
                </table>
            </div>
            
            <p style="color: ' . self::TEXT_COLOR . '; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">We look forward to serving you. If you need to reschedule, please contact us as soon as possible.</p>
        ';
        
        return self::getBaseTemplate($content, 'Service Reminder');
    }
    /**
     * Account creation email template (with password)
     */
    public static function accountCreation($userData)
    {
        $name = htmlspecialchars($userData['name'] ?? 'Customer');
        $email = htmlspecialchars($userData['email'] ?? '');
        $password = htmlspecialchars($userData['password'] ?? '');
        
        $content = '
            <h2 style="color: ' . self::PRIMARY_COLOR . '; margin: 0 0 20px 0; font-size: 22px;">Welcome to South Ring Autos!</h2>
            <p style="color: ' . self::TEXT_COLOR . '; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Dear ' . $name . ',</p>
            <p style="color: ' . self::TEXT_COLOR . '; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">Thank you for booking with us! We have automatically created an account for you so you can track your service history and manage future bookings.</p>
            
            <div style="background-color: #F9F9F9; border-radius: 8px; padding: 25px; margin: 25px 0; border-left: 4px solid ' . self::PRIMARY_COLOR . ';">
                <h3 style="color: ' . self::SECONDARY_COLOR . '; margin: 0 0 15px 0; font-size: 18px;">Your Account Credentials</h3>
                <p style="margin: 0 0 10px 0; color: ' . self::TEXT_COLOR . '; font-size: 14px;"><strong>Email:</strong> ' . $email . '</p>
                <p style="margin: 0 0 10px 0; color: ' . self::TEXT_COLOR . '; font-size: 14px;"><strong>Password:</strong> ' . $password . '</p>
                <p style="margin: 15px 0 0 0; color: ' . self::TEXT_COLOR . '; font-size: 12px;"><em>Please change your password after your first login.</em></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="' . (defined('BASE_URL') ? constant('BASE_URL') : '') . '/client/login.php" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, ' . self::PRIMARY_COLOR . ' 0%, #a00 100%); color: #FFFFFF; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(216, 19, 36, 0.3);">Login Now</a>
            </div>
            
            <p style="color: ' . self::TEXT_COLOR . '; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">If you have any questions, feel free to contact us.</p>
        ';
        
        return self::getBaseTemplate($content, 'Account Created - South Ring Autos');
    }

    /**
     * Booking linked email template (for existing users)
     */
    public static function bookingLinked($userData)
    {
        $name = htmlspecialchars($userData['name'] ?? 'Customer');
        $bookingId = htmlspecialchars($userData['booking_id'] ?? 'N/A');
        
        $content = '
            <h2 style="color: ' . self::PRIMARY_COLOR . '; margin: 0 0 20px 0; font-size: 22px;">Booking Received</h2>
            <p style="color: ' . self::TEXT_COLOR . '; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Dear ' . $name . ',</p>
            <p style="color: ' . self::TEXT_COLOR . '; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">We have received your booking (#' . $bookingId . ') and linked it to your existing account.</p>
            
            <div style="background-color: #E3F2FD; border-radius: 8px; padding: 25px; margin: 25px 0; border-left: 4px solid #2196F3;">
                <p style="margin: 0; color: ' . self::TEXT_COLOR . '; font-size: 14px;"><strong>Please Log In:</strong> To view your booking details and track progress, please log in to your account.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="' . (defined('BASE_URL') ? constant('BASE_URL') : '') . '/client/login.php" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, ' . self::PRIMARY_COLOR . ' 0%, #a00 100%); color: #FFFFFF; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(216, 19, 36, 0.3);">Login to Dashboard</a>
            </div>
        ';
        
        return self::getBaseTemplate($content, 'Booking Received - South Ring Autos');
    }
}

