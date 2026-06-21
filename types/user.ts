type AppUser = {
    id: number;
    name: string;
    email: string;
    credits: number;
    maxCredits: number;
    tier: string;
    clerkId?: string | null;
}