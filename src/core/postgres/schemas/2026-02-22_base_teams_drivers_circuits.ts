import { pgTable, integer, varchar, timestamp, real, serial, unique } from 'drizzle-orm/pg-core';

// ----------------------------------------------------------------------------
// DATA: 2026-02-22
// RIASSUNTO: Creazione tabelle base (Teams, Drivers, Circuits) senza dipendenze.
// ----------------------------------------------------------------------------

export const teams = pgTable('teams', {
    id: integer('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    color: varchar('color', { length: 7 }),
    principal: varchar('principal', { length: 255 }),
    base: varchar('base', { length: 255 }),
    created_at: timestamp('created_at').defaultNow(),
});

export const drivers = pgTable('drivers', {
    id: integer('id').primaryKey(),
    number: integer('number').notNull(),
    broadcast_name: varchar('broadcast_name', { length: 50 }).notNull(),
    full_name: varchar('full_name', { length: 255 }).notNull(),
    name_acronym: varchar('name_acronym', { length: 3 }).notNull(),
    country_code: varchar('country_code', { length: 3 }),
    headshot_url: varchar('headshot_url', { length: 512 }),
    created_at: timestamp('created_at').defaultNow(),
});

// Tabella pivot per gestire le variazioni di scuderia durante le varie stagioni 
// (es. Hamilton Mercedes 2024 -> Ferrari 2025, Bearman Ferrari/Haas 2024)
export const season_entrants = pgTable('season_entrants', {
    id: serial('id').primaryKey(),
    year: integer('year').notNull(),
    driver_id: integer('driver_id').references(() => drivers.id).notNull(),
    team_id: integer('team_id').references(() => teams.id).notNull(),
    rounds_entered: integer('rounds_entered').default(1).notNull(),
}, (t) => [
    unique("driver_team_year_unique").on(t.year, t.driver_id, t.team_id)
]);

export const circuits = pgTable('circuits', {
    id: integer('id').primaryKey(),
    key: integer('key').unique(),
    short_name: varchar('short_name', { length: 100 }).notNull(),
    location: varchar('location', { length: 150 }),
    country: varchar('country', { length: 150 }),
    country_code: varchar('country_code', { length: 3 }),
    length_km: real('length_km'),
    corners: integer('corners'),
    created_at: timestamp('created_at').defaultNow(),
});
