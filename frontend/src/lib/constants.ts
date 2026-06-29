export const ASSET_URL =
    process.env.NEXT_PUBLIC_ASSET_URL || "http://127.0.0.1:8000";

export const REPAIR_STAGES = [
    "Received",
    "Diagnostics",
    "Parts Sourcing",
    "Repairing",
    "QA Testing",
    "Ready",
] as const;

export const REPAIR_STAGE_PERCENTAGES: Record<string, number> = {
    Received: 10,
    Diagnostics: 25,
    "Parts Sourcing": 40,
    Repairing: 60,
    "QA Testing": 80,
    Ready: 100,
};

export const BOOKING_STATUSES = [
    "pending",
    "confirmed",
    "cancelled",
    "completed",
] as const;

export const PAYMENT_STATUSES = ["pending", "completed", "failed"] as const;

export const DELIVERY_STATUSES = [
    "requested",
    "scheduled",
    "out_for_delivery",
    "completed",
    "cancelled",
] as const;

export const BLOG_CATEGORIES = [
    "Industry News",
    "Car Maintenance",
    "Buying Tips",
    "Technology",
    "Company News",
] as const;

export const SWEETALERT_CONFIRM_OPTIONS = {
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
};
