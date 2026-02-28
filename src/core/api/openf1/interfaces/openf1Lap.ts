export interface OpenF1Lap {
    meeting_key: number;
    session_key: number;
    driver_number: number;
    i1_speed: number | null;
    i2_speed: number | null;
    st_speed: number | null;
    date_start: string | null;
    lap_duration: number | null;
    is_pit_out_lap: boolean;
    duration_sector_1: number | null;
    duration_sector_2: number | null;
    duration_sector_3: number | null;
    segments_sector_1: number[];
    segments_sector_2: number[];
    segments_sector_3: number[];
    lap_number: number;
}
