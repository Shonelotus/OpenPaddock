import { pgTable, integer, varchar, timestamp, real, serial, unique } from 'drizzle-orm/pg-core';
import { sessions } from './2026-02-22_events_and_sessions';
import { drivers } from './2026-02-22_base_teams_drivers_circuits';

// ----------------------------------------------------------------------------
// DATA: 2026-02-23
// RIASSUNTO: Creazione tabella per salvare i risultati finali delle sessioni (Gare/Sprint).
// ----------------------------------------------------------------------------

export const race_results = pgTable('race_results', {
    id: serial('id').primaryKey(),
    session_id: integer('session_id').references(() => sessions.id).notNull(),
    driver_id: integer('driver_id').references(() => drivers.id).notNull(),
    
    // Posizione di arrivo al traguardo (null se DNF non classificato)
    position: integer('position'),
    
    // Status finale (es. "Finished", "+1 Lap", "DNF", "DSQ")
    status: varchar('status', { length: 150 }),
    
    // Punti guadagnati in questa specifica sessione
    points: real('points').default(0).notNull(),
    
    created_at: timestamp('created_at').defaultNow(),
}, (t) => [
    // Un pilota può avere un solo risultato finale per sessione
    unique("driver_session_unique").on(t.session_id, t.driver_id)
]);
