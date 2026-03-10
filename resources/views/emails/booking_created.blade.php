<x-mail::message>
# Booking Confirmed

Hello {{ $clientName }},

Thank you for choosing South Ring Autos. We have received your booking request for **{{ $booking->service->name ?? 'Service' }}**.

**Booking Details:**
- **Date & Time:** {{ \Carbon\Carbon::parse($booking->booking_date)->format('l, F j, Y \a\t g:i A') }}
- **Location:** {{ $booking->location ?? 'South Ring Autos Garage' }}

We will review your request and get back to you shortly to confirm our availability.

<x-mail::button :url="config('app.url') . '/dashboard/bookings'">
View Your Booking
</x-mail::button>

If you need to make any changes or have any questions, please reply directly to this email or contact our support team.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
