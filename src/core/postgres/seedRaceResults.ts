import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from './client';
import { eq, asc, inArray, and } from 'drizzle-orm';
import { drivers } from './schemas/2026-02-22_base_teams_drivers_circuits';
import { events, sessions } from './schemas/2026-02-22_events_and_sessions';
import { race_results } from './schemas/2026-02-23_race_results';

async function seedRaceResults() {
    console.log("🏁 Inizio processo di Seeding dei Risultati di Gara (da Ergast Mirror)...");
    const YEARS = [2024, 2025];

    // Pre-carica tutti i piloti in memoria per mappaggio sicuro via Acronimo (es. "VER" -> 1)
    const allDriversList = await db.select().from(drivers);
    const acronymToDriverId = new Map<string, number>();
    allDriversList.forEach(d => {
        acronymToDriverId.set(d.name_acronym, d.id);
    });

    try {
        for (const YEAR of YEARS) {
            console.log(`\n================================`);
            console.log(`🏆 ELABORAZIONE RISULTATI STAGIONE ${YEAR}`);
            console.log(`================================`);

            // 1. Fetch SOLO events che contengono effettivamente una 'Race' (Ignora Pre-Season Testing)
            const validEventsQuery = await db.select({
                id: events.id,
                date_start: events.date_start
            })
                .from(events)
                .innerJoin(sessions, eq(events.id, sessions.event_id))
                .where(
                    and(
                        eq(events.year, YEAR),
                        eq(sessions.name, 'Race')
                    )
                )
                .orderBy(asc(events.date_start));

            if (validEventsQuery.length === 0) {
                console.log(`Nessun evento valido trovato per il ${YEAR}. Salto...`);
                continue;
            }

            // 2. Map Event ID to Round Number (1-indexed, perfettamente allineato ad Ergast)
            const eventRoundMap = new Map<number, number>();
            validEventsQuery.forEach((ev, index) => {
                eventRoundMap.set(ev.id, index + 1);
            });

            // 3. Fetch all Race and Sprint sessions for this year's valid events
            const eventIds = validEventsQuery.map(e => e.id);
            const targetSessions = await db.select()
                .from(sessions)
                .where(
                    and(
                        inArray(sessions.event_id, eventIds),
                        inArray(sessions.name, ['Race', 'Sprint'])
                    )
                );

            console.log(`Trovate ${targetSessions.length} sessioni (Sprint/Gare) valutabili per il ${YEAR}.`);

            for (const session of targetSessions) {
                // Skipa sessioni che devono ancora essere corse (futuro)
                if (new Date(session.date_start) > new Date()) {
                    console.log(`⏩ Sessione ${session.name} all'evento ${session.event_id} è nel futuro, salto.`);
                    continue;
                }

                const round = eventRoundMap.get(session.event_id);
                if (!round) continue;

                const isRace = session.name === 'Race';
                console.log(`\nScarico risultati per Round ${round} - ${isRace ? 'Gara' : 'Sprint'}...`);

                // Costruiamo l'URL Ergast
                const endpoint = isRace
                    ? `https://api.jolpi.ca/ergast/f1/${YEAR}/${round}/results.json`
                    : `https://api.jolpi.ca/ergast/f1/${YEAR}/${round}/sprint.json`;

                try {
                    const response = await fetch(endpoint);
                    const data = await response.json();

                    let resultsArray = [];
                    if (isRace && data.MRData.RaceTable.Races.length > 0) {
                        resultsArray = data.MRData.RaceTable.Races[0].Results;
                    } else if (!isRace && data.MRData.RaceTable.Races.length > 0) {
                        resultsArray = data.MRData.RaceTable.Races[0].SprintResults;
                    }

                    if (resultsArray.length === 0) {
                        console.log(`Nessun risultato trovato ancora per questo evento.`);
                        continue;
                    }

                    let insertedCount = 0;
                    for (const result of resultsArray) {
                        const driverAcronym = result.Driver.code;
                        const ergastDriverId = result.Driver.driverId; // es: "colapinto"
                        const position = parseInt(result.position);
                        const points = parseFloat(result.points);
                        const status = result.status;

                        // Troviamo l'ID locale del database tramite l'acronimo 
                        let driverId = driverAcronym ? acronymToDriverId.get(driverAcronym) : undefined;

                        // Fallback manuale per rookie se manca l'acronimo su Ergast
                        if (!driverId) {
                            const fallbackMap: Record<string, number> = {
                                'colapinto': 43,
                                'bearman': 87,
                                'lawson': 30,
                                'antonelli': 12,
                                'bortoleto': 5,
                                'hadjar': 17
                            };
                            driverId = fallbackMap[ergastDriverId];
                        }

                        if (!driverId) {
                            console.log(`⚠️  Attenzione: Nessun driver locale trovato per acronimo ${driverAcronym} o ID ${ergastDriverId}`);
                            continue;
                        }

                        await db.insert(race_results).values({
                            session_id: session.id,
                            driver_id: driverId,
                            position: isNaN(position) ? null : position,
                            status: status,
                            points: points,
                        }).onConflictDoNothing();

                        insertedCount++;
                    }
                    console.log(`✅ Inseriti ${insertedCount} piazzamenti finali.`);

                } catch (err) {
                    console.error(`Errore nel download del Round ${round}:`, err);
                }

                // Pausa per evitare limiti rate (4 req/sec max per Jolpi)
                await new Promise(res => setTimeout(res, 300));
            }
        }

        console.log("\n🚀 SEEDING RISULTATI COMPLETATO CON SUCCESSO!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Errore generale durante il seeding:", error);
        process.exit(1);
    }
}

seedRaceResults();
