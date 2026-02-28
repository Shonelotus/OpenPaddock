export interface Circuit {
    id: number;
    key: number | null;
    short_name: string;
    location: string | null;
    country: string | null;
    country_code: string | null;
    length_km: number | null;
    corners: number | null;
    created_at: Date | null;
}
