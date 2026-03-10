<x-mail::message>
# Welcome to South Ring Autos!

Hello {{ $user->first_name }},

Thank you for creating an account with South Ring Autos. We are thrilled to have you on board!

With your new account, you can quickly book services, track your vehicle's maintenance history, and manage your loyalty rewards — all in one place.

<x-mail::button :url="config('app.url') . '/dashboard'">
Access Your Dashboard
</x-mail::button>

If you ever need any assistance with your account or your car, don't hesitate to reach out.

Drive safely, and see you soon!<br>
The Team at {{ config('app.name') }}
</x-mail::message>
