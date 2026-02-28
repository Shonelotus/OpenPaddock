export interface Event {
    id: number;
    year: number;
    circuit_id: number | null;
    name: string;
    official_name: string | null;
    location: string | null;
    country_name: string | null;
    date_start: Date;
    created_at: Date | null;
}
