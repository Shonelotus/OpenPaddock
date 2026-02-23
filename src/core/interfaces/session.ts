export interface Session {
    id: number;
    event_id: number;
    name: string;
    type: string | null;
    date_start: Date;
    date_end: Date | null;
    gmt_offset: string | null;
    created_at: Date | null;
}
