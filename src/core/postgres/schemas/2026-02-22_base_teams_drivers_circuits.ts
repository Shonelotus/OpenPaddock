import { pgTable, integer, varchar, timestamp, real } from 'drizzle-orm/pg-core';

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
    team_id: integer('team_id').references(() => teams.id),
    country_code: varchar('country_code', { length: 3 }),
    headshot_url: varchar('headshot_url', { length: 512 }),
    created_at: timestamp('created_at').defaultNow(),
});

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
