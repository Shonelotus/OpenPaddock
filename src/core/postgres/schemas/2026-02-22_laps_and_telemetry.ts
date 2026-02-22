import { pgTable, integer, varchar, timestamp, boolean, real } from 'drizzle-orm/pg-core';
import { drivers } from './2026-02-22_base_teams_drivers_circuits';
import { sessions } from './2026-02-22_events_and_sessions';

// ----------------------------------------------------------------------------
// DATA: 2026-02-22
// RIASSUNTO: Creazione tabelle Gara e Telemetria (Laps, Pit Stops, Telemetry 2026-Ready).
// ----------------------------------------------------------------------------

export const laps = pgTable('laps', {
    id: integer('id').primaryKey(), // ID generato da noi o da openpaddock se esiste
    session_id: integer('session_id').references(() => sessions.id).notNull(),
    driver_id: integer('driver_id').references(() => drivers.id).notNull(),
    lap_number: integer('lap_number').notNull(),

    // Tempi salvati in millisecondi per precisione ed efficienza DB
    lap_duration_ms: integer('lap_duration_ms'),
    sector_1_ms: integer('sector_1_ms'),
    sector_2_ms: integer('sector_2_ms'),
    sector_3_ms: integer('sector_3_ms'),

    is_pit_out: boolean('is_pit_out').default(false),
    is_valid: boolean('is_valid').default(true), // Se il tempo è stato cancellato per track limits
    created_at: timestamp('created_at').defaultNow(),
});

export const pit_stops = pgTable('pit_stops', {
    id: integer('id').primaryKey(),
    session_id: integer('session_id').references(() => sessions.id).notNull(),
    driver_id: integer('driver_id').references(() => drivers.id).notNull(),
    lap_number: integer('lap_number').notNull(),

    stop_duration_ms: integer('stop_duration_ms'), // Durata della sosta ai box in ms
    pit_lane_duration_ms: integer('pit_lane_duration_ms'), // Tempo totale speso in pit lane
    tire_compound: varchar('tire_compound', { length: 50 }), // SOFT, MEDIUM, HARD, INTERMEDIATE, WET
    created_at: timestamp('created_at').defaultNow(),
});

// Nota Tecnica: Anche se la chiamiamo tabella "standard" in Drizzle, 
// TimescaleDB (sul Raspberry) la trasformerà in una "Hypertable" basata sulla colonna `timestamp`
// tramite uno script SQL manuale che lanceremo in seguito per abilitare il partizionamento veloce.

export const telemetry = pgTable('telemetry', {
    // Non usiamo una Primary Key classica per le hypertable di TimescaleDB per questioni di performance 
    // su milioni di righe, usiamo indicatori composti.

    session_id: integer('session_id').references(() => sessions.id).notNull(),
    driver_id: integer('driver_id').references(() => drivers.id).notNull(),
    timestamp: timestamp('timestamp').notNull(), // Asse temporale per la Hypertable

    // --- DATI ICE (Motore Termico) E TELAIO (Sempre validi) ---
    speed_kmh: integer('speed_kmh'),
    rpm: integer('rpm'),
    gear: integer('gear'),
    throttle_pct: integer('throttle_pct'), // Da 0 a 100
    brake_pressure: integer('brake_pressure'), // Da 0 a 100 o raw sensor data

    // --- DATI AERODINAMICI (Rifattorizzati per Regolamento FIA 2026) ---
    legacy_drs: integer('legacy_drs'), // 0, 8, 10... utile per storici pre-2026
    active_aero_mode: varchar('active_aero_mode', { length: 1 }), // 'Z' (High Downforce), 'X' (Low Drag)

    // --- DATI ELETTRICI (Regolamento FIA 2026) ---
    override_mode_active: boolean('override_mode_active').default(false), // Il nuovo Push-to-Pass tattico

    // Posizione in pista (se fornita in raw JSON, altrimenti la mettiamo qui)
    x_pos: real('x_pos'),
    y_pos: real('y_pos'),
    z_pos: real('z_pos'),
});
