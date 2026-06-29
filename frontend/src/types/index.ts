export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    role: string;
    profile_completed?: boolean;
    loyalty_points?: number;
    membership_tier?: string;
    created_at: string;
    updated_at: string;
}

export interface Client extends User {
    client?: {
        id: number;
        name: string;
        email: string;
        phone?: string;
    };
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
    fuel_type?: string;
    mileage?: number;
    thumbnail?: string;
    notes?: string;
    owner?: string;
    owner_email?: string;
    images?: VehicleImage[];
    created_at: string;
    updated_at?: string;
}

export interface VehicleImage {
    id: number;
    vehicle_id: number;
    image_path: string;
    is_primary: boolean;
    created_at: string;
}

export interface Booking {
    id: number;
    client_id?: number | null;
    vehicle_id?: number | null;
    user_id?: number | null;
    name: string;
    email?: string;
    phone: string;
    registration: string;
    service: string;
    date?: string;
    preferred_time?: string;
    message?: string;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    estimated_cost?: number;
    actual_cost?: number;
    created_at: string;
    updated_at?: string;
    client?: Client;
    vehicle?: Vehicle;
    repair_progress?: RepairProgress[];
}

export interface RepairProgress {
    id: number;
    booking_id: number;
    stage: string;
    description?: string;
    progress_percentage: number;
    updated_by: number;
    created_at: string;
}

export interface ContactMessage {
    id: number;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    status: "unread" | "read" | "replied" | "archived";
    created_at: string;
    updated_at?: string;
}

export interface Payment {
    id: number;
    booking_id?: number;
    user_id?: number;
    amount: string | number;
    payment_method: "mpesa" | "card" | "cash" | "paystack";
    transaction_reference?: string;
    status: "pending" | "completed" | "failed";
    invoice_number: string;
    paid_at?: string;
    payment_type?: string;
    journal_id?: number;
    created_at: string;
    updated_at?: string;
    user?: User;
    booking?: Booking;
    journal?: Journal;
}

export interface Service {
    id: number;
    title: string;
    description: string;
    icon?: string;
    image?: string;
    is_featured: boolean;
    created_at: string;
    updated_at?: string;
}

export interface BlogPost {
    id: number;
    title: string;
    content: string;
    excerpt?: string;
    category: string;
    image?: string;
    status: "draft" | "published";
    access_tier: "auto" | "free" | "premium";
    has_access?: boolean;
    journal_id?: number;
    created_at: string;
    updated_at?: string;
}

export interface Journal {
    id: number;
    year: number;
    title: string;
    description: string;
    price: number;
    cover_image?: string;
    is_active: boolean;
    offers?: string;
    has_access?: boolean;
    purchases_count?: number;
    created_at: string;
    updated_at?: string;
}

export interface JournalPurchase {
    id: number;
    user_id: number;
    journal_id: number;
    payment_id?: number;
    purchased_at: string;
    journal?: Journal;
    user?: User;
    payment?: Payment;
}

export interface Testimonial {
    id: number;
    name: string;
    role: string;
    content: string;
    image_url?: string;
    rating: number;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
}

export interface EmailTemplate {
    id: number;
    name: string;
    type: string;
    subject: string;
    body: string;
    variables: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Delivery {
    id: number;
    booking_id: number;
    client_id?: number;
    type: "pickup" | "dropoff";
    address: string;
    city?: string;
    postal_code?: string;
    preferred_date?: string;
    preferred_time?: string;
    contact_phone: string;
    special_instructions?: string;
    status: string;
    assigned_to?: number;
    scheduled_date?: string;
    completed_at?: string;
    created_at: string;
    booking?: Booking;
    client?: Client;
    assignee?: User;
}

export interface Setting {
    key: string;
    value: any;
}

export interface DashboardStats {
    total_bookings: number;
    total_vehicles: number;
    loyalty_points: number;
    membership_tier: string;
    upcoming_appointments: Booking[];
    recent_vehicles: Vehicle[];
}

export interface AdminStats {
    total_bookings: number;
    pending_bookings: number;
    total_users: number;
    total_posts: number;
    new_messages: number;
    recent_bookings: Booking[];
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

export interface AppNotification {
    id: number;
    data: {
        title: string;
        message: string;
        type: string;
        link?: string;
    };
    read_at: string | null;
    created_at: string;
}
