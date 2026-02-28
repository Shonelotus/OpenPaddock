export interface RaceResult {
    id: number;
    session_id: number;
    driver_id: number;
    position: number | null;
    status: string | null;
    points: number;
    created_at: Date | null;
}
