export interface Driver {
    id: number;
    number: number;
    broadcast_name: string;
    full_name: string;
    name_acronym: string;
    country_code: string | null;
    headshot_url: string | null;
    created_at: Date | null;
}
