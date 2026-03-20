export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    role: 'client' | 'admin';
    profile_completed: boolean;
    created_at: string;
    updated_at: string;
}

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
    fuel_type?: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
    mileage?: number;
    thumbnail?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface Booking {
    id: number;
    client_id?: number;
    vehicle_id?: number;
    name: string;
    email: string;
    phone: string;
    registration: string;
    service: string;
    date: string | null;
    time?: string;
    message?: string;
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
    estimated_cost?: number;
    actual_cost?: number;
    vehicle?: Vehicle;
    created_at: string;
    updated_at: string;
}

export interface Payment {
    id: number | string;
    booking_id?: number;
    journal_id?: number;
    amount: number;
    method: string;
    status: 'pending' | 'completed' | 'failed';
    payment_type: 'booking' | 'journal';
    reference?: string;
    paid_at: string;
    date?: string; // Legacy support
    journal?: Journal;
}

export interface Journal {
    id: number;
    year: number;
    title: string;
    description?: string;
    price: number;
    cover_image?: string;
    is_active: boolean;
    offers?: string;
    purchases_count?: number;
    created_at: string;
    updated_at: string;
}

export interface JournalPurchase {
    id: number;
    user_id: number;
    journal_id: number;
    payment_id: number;
    purchased_at: string;
    journal?: Journal;
    user?: User;
    payment?: Payment;
}

export interface DashboardStats {
    active_bookings: number;
    completed_bookings: number;
    vehicle_count: number;
    total_spent: number;
    pending_payment: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    stats?: T; // For dashboard stats specifically
    bookings?: T[];
    vehicles?: T[];
    user?: T;
}
