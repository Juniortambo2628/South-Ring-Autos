<x-mail::message>
# Booking Status Update

Hello {{ $booking->client_first_name ?? 'Valued Client' }},

There is an update regarding your booking for **{{ $booking->service->name ?? 'Service' }}** scheduled on {{ \Carbon\Carbon::parse($booking->booking_date)->format('F j, Y') }}.

@if($booking->status === 'accepted')
Your booking has been **Accepted**! We are preparing for your vehicle and look forward to serving you.
@elseif($booking->status === 'completed')
Your service has been marked as **Completed**. Thank you for trusting South Ring Autos with your vehicle! We hope to see you again.
@elseif($booking->status === 'rejected')
Unfortunately, your booking request has been **Rejected** at this time. We apologize for any inconvenience. Our team might reach out to you to reschedule, or you can contact us to find an alternative time.
@else
Your booking status is currently: **{{ ucfirst($booking->status) }}**.
@endif

<x-mail::button :url="config('app.url') . '/dashboard/bookings'">
View Booking Details
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
