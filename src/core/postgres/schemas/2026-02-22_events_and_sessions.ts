import { pgTable, integer, varchar, timestamp } from 'drizzle-orm/pg-core';
import { circuits } from './2026-02-22_base_teams_drivers_circuits';

// ----------------------------------------------------------------------------
// DATA: 2026-02-22
// RIASSUNTO: Creazione tabelle calendario (Seasons, Events, Sessions) con dipendenze.
// ----------------------------------------------------------------------------

export const seasons = pgTable('seasons', {
    year: integer('year').primaryKey(), // Es. 2024, 2025, 2026
    start_date: timestamp('start_date'),
    end_date: timestamp('end_date'),
    created_at: timestamp('created_at').defaultNow(),
});

export const events = pgTable('events', {
    id: integer('id').primaryKey(),         // meeting_key di openpaddock
    year: integer('year').references(() => seasons.year).notNull(),
    circuit_id: integer('circuit_id').references(() => circuits.id),
    name: varchar('name', { length: 255 }).notNull(), // Es. "Italian Grand Prix"
    official_name: varchar('official_name', { length: 255 }),
    location: varchar('location', { length: 255 }),
    country_name: varchar('country_name', { length: 255 }),
    date_start: timestamp('date_start').notNull(),
    created_at: timestamp('created_at').defaultNow(),
});

export const sessions = pgTable('sessions', {
    id: integer('id').primaryKey(),         // session_key di openpaddock
    event_id: integer('event_id').references(() => events.id).notNull(),
    name: varchar('name', { length: 150 }).notNull(), // Es. "Race", "Qualifying", "Practice 1"
    type: varchar('type', { length: 50 }),  // Es. "Race", "Qualifying", "Practice"
    date_start: timestamp('date_start').notNull(),
    date_end: timestamp('date_end'),
    gmt_offset: varchar('gmt_offset', { length: 10 }), // Formato ISO period (es. 02:00:00)
    created_at: timestamp('created_at').defaultNow(),
});
