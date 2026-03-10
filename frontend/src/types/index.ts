export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: string;
    loyalty_points?: number;
    membership_tier?: string;
    created_at: string;
    updated_at: string;
}

export interface Client extends User { } // For cases where client acts functionally like a user

export interface Vehicle {
    id: number;
    client_id: number;
    make: string;
    model: string;
    year?: number;
    registration: string;
    color?: string;
    vin?: string;
    engine_size?: string;
    fuel_type?: string;
    mileage?: number;
    owner?: string; // Appended by eager loading
    owner_email?: string; // Appended by eager loading
    created_at: string;
}

export interface Booking {
    id: number;
    client_id?: number | null;
    vehicle_id?: number | null;
    name: string;
    email?: string;
    phone: string;
    registration: string;
    service: string;
    date?: string;
    message?: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    estimated_cost?: number;
    actual_cost?: number;
    created_at: string;
    updated_at?: string;

    // Relationships
    client?: Client;
    vehicle?: Vehicle;
}

export interface ContactMessage {
    id: number;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    status: 'unread' | 'read' | 'replied' | 'archived';
    created_at: string;
    updated_at?: string;
}

export interface Payment {
    id: number;
    booking_id: number;
    user_id?: number;
    amount: string | number;
    payment_method: 'mpesa' | 'card' | 'cash';
    transaction_reference?: string;
    status: 'pending' | 'completed' | 'failed';
    invoice_number: string;
    paid_at?: string;
    created_at: string;

    // Relationships
    user?: User;
    booking?: Booking;
}
