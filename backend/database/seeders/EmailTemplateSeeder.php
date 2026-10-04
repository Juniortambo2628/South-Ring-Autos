<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EmailTemplate;

class EmailTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Registration Welcome',
                'type' => 'registration',
                'subject' => 'Welcome to South Ring Autos, [name]!',
                'body' => "Hi [name],\n\nThank you for creating an account with South Ring Autos! We are thrilled to have you here.\n\nYou can now easily book car services, fetch estimates, and track your vehicle's repair progress right from your online dashboard.\n\nBest Regards,\nThe South Ring Autos Team",
                'variables' => ['name', 'email'],
                'is_active' => true,
            ],
            [
                'name' => 'Booking Received',
                'type' => 'booking_received',
                'subject' => 'Booking Received - [reference]',
                'body' => "Hi [name],\n\nWe have received your booking request for [service] concerning your vehicle ([registration]).\n\nBooking Reference: [reference]\nDate: [date]\nTime: [time]\n\nOur team will review your request and confirm shortly. You can track this booking via your dashboard.\n\nBest Regards,\nSouth Ring Autos",
                'variables' => ['name', 'service', 'registration', 'reference', 'date', 'time'],
                'is_active' => true,
            ],
            [
                'name' => 'Payment Confirmation',
                'type' => 'payment_confirmation',
                'subject' => 'Payment Receipt - Invoice #[invoice_number]',
                'body' => "Hi [name],\n\nThank you for your payment of Ksh [amount].\n\nYour payment for invoice #[invoice_number] has been successfully processed.\n\nYou can view and download your full receipt from your dashboard.\n\nBest Regards,\nSouth Ring Autos",
                'variables' => ['name', 'amount', 'invoice_number'],
                'is_active' => true,
            ],
            [
                'name' => 'Service Reminder',
                'type' => 'service_reminder',
                'subject' => 'Service Reminder for [vehicle]',
                'body' => "Hi [name],\n\nIt's been 6 months since your last service for [vehicle] ([registration]) on [last_service].\n\nTo keep your vehicle in top condition and ensure your safety on the road, we recommend booking a routine maintenance check with us.\n\nYou can book your appointment easily through your dashboard.\n\nBest Regards,\nSouth Ring Autos",
                'variables' => ['name', 'vehicle', 'registration', 'last_service'],
                'is_active' => true,
            ],
            [
                'name' => 'Email Verification Code',
                'type' => 'email_verification_code',
                'subject' => 'Your South Ring Autos verification code',
                'body' => "Hi [name],\n\nYour verification code is: [code]\n\nIt expires in 15 minutes. If you did not request this, you can safely ignore this email.\n\nBest Regards,\nSouth Ring Autos",
                'variables' => ['name', 'code'],
                'is_active' => true,
            ],
            [
                'name' => 'Email Sign-In Code',
                'type' => 'email_login_code',
                'subject' => 'Your South Ring Autos sign-in code',
                'body' => "Hi [name],\n\nYour one-time sign-in code is: [code]\n\nIt expires in 10 minutes. If you did not request this, you can safely ignore this email.\n\nBest Regards,\nSouth Ring Autos",
                'variables' => ['name', 'code'],
                'is_active' => true,
            ],
            [
                'name' => 'Security Settings Changed',
                'type' => 'two_factor_changed',
                'subject' => 'Security settings updated on your account',
                'body' => "Hi [name],\n\nYour account security settings were changed: [action].\n\nIf this was not you, reset your password immediately and contact us.\n\nBest Regards,\nSouth Ring Autos",
                'variables' => ['name', 'action'],
                'is_active' => true,
            ],
        ];

        foreach ($templates as $template) {
            EmailTemplate::updateOrCreate(['name' => $template['name']], $template);
        }
    }
}
