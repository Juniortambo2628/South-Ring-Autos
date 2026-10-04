export type AuthPayload = {
    success?: boolean;
    status?: string;
    access_token?: string;
    user?: any;
    email?: string;
    challenge_token?: string;
    message?: string;
};

type Router = { push: (href: string) => void };

export function routeForUser(user: any): string {
    if (!user?.profile_completed) return "/complete-profile";
    if (user.role === "admin") return "/admin";
    return "/dashboard";
}

export function persistSession(token: string, user: any): void {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user", JSON.stringify(user));
}

export function updateStoredUser(patch: Record<string, any>): void {
    const raw = localStorage.getItem("user");
    if (!raw) return;
    const user = JSON.parse(raw);
    localStorage.setItem("user", JSON.stringify({ ...user, ...patch }));
}

// Handles every non-error login outcome: verification gate, 2FA challenge,
// or a finished token response. Returns true when the response was handled.
export function completeLogin(router: Router, data: AuthPayload): boolean {
    if (data.status === "verification_required") {
        router.push(`/verify-email?email=${encodeURIComponent(data.email || "")}`);
        return true;
    }

    if (data.status === "two_factor_required") {
        sessionStorage.setItem("login_challenge", data.challenge_token || "");
        router.push("/two-factor");
        return true;
    }

    if (data.success && data.access_token && data.user) {
        persistSession(data.access_token, data.user);
        router.push(routeForUser(data.user));
        return true;
    }

    return false;
}
