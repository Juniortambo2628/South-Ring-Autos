<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SendServiceReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-service-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send automated service reminders to clients whose vehicles are due for maintenance.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting service reminders scan...');
        
        $vehicles = \App\Models\Vehicle::with(['client', 'bookings' => function($q) {
            $q->where('status', 'completed')->latest('date');
        }])->get();

        $template = \App\Models\EmailTemplate::where('type', 'service_reminder')->where('is_active', true)->first();
        
        if (!$template) {
            $this->error('Service reminder email template not found or inactive.');
            return 1;
        }

        $sentCount = 0;

        foreach ($vehicles as $vehicle) {
            $client = $vehicle->client;
            if (!$client || !$client->email) continue;

            $latestBooking = $vehicle->bookings->first();
            $lastServiceDate = $latestBooking ? \Carbon\Carbon::parse($latestBooking->date) : $vehicle->created_at;

            // If last service was 6+ months ago
            if ($lastServiceDate->diffInMonths(now()) >= 6) {
                // Check if we already sent a reminder in the last 30 days
                if (!$vehicle->last_service_reminder_at || \Carbon\Carbon::parse($vehicle->last_service_reminder_at)->diffInDays(now()) >= 30) {
                    try {
                        \Illuminate\Support\Facades\Mail::to($client->email)->send(new \App\Mail\DynamicEmail($template, [
                            'name' => $client->name ?? 'Valued Client',
                            'vehicle' => "{$vehicle->year} {$vehicle->make} {$vehicle->model}",
                            'registration' => $vehicle->registration,
                            'last_service' => $lastServiceDate->toFormattedDateString(),
                        ]));

                        $vehicle->update(['last_service_reminder_at' => now()]);
                        $sentCount++;
                        
                        $this->line("Sent reminder to {$client->email} for {$vehicle->registration}");
                    } catch (\Exception $e) {
                        \Log::error("Failed to send service reminder to {$client->email}: " . $e->getMessage());
                        $this->error("Failed to send to {$client->email}");
                    }
                }
            }
        }

        $this->info("Scan complete. Sent {$sentCount} reminders.");
        return 0;
    }
}
