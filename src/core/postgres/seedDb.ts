import * as dotenv from 'dotenv';

//questo comando serve per caricare le variabili d'ambiente
dotenv.config({ path: '.env.local' });

import { db } from './client';
import { getMeetings, getSessions, getDrivers } from '../api/openf1/client';
import { circuits, teams, drivers } from './schemas/2026-02-22_base_teams_drivers_circuits';
import { seasons, events, sessions } from './schemas/2026-02-22_events_and_sessions';

async function seedBaseData() {
    console.log("🏁 Inizio processo di Seeding da OpenF1 API...");
    const YEARS = [2024, 2025]; // Scarichiamo i dati di diverse stagioni con un ciclo

    try {
        for (const YEAR of YEARS) {
            console.log(`\n================================`);
            console.log(`🏆 INIZIO ELABORAZIONE STAGIONE ${YEAR}`);
            console.log(`================================`);

            // 1. Inseriamo la Stagione
            console.log(`\n📅 Creazione record stagione ${YEAR}...`);
            await db.insert(seasons).values({
                year: YEAR,
                start_date: new Date(`${YEAR}-01-01`),
                end_date: new Date(`${YEAR}-12-31`),
            }).onConflictDoNothing();
            console.log("✅ Stagione aggiunta.");

            // 2. Scarichiamo i Meeting (Gran Premi)
            console.log(`\n🌍 Download Gran Premi (Meetings) ${YEAR}...`);
            const openF1Meetings = await getMeetings(YEAR);

            if (openF1Meetings.length > 0) {
                // Estraiamo i Circuiti univoci dai Meetings
                console.log(`🏎️ Elaborazione Circuiti...`);
                const uniqueCircuits = new Map();
                openF1Meetings.forEach((m: any) => {
                    if (!uniqueCircuits.has(m.circuit_key)) {
                        uniqueCircuits.set(m.circuit_key, {
                            id: m.circuit_key,
                            short_name: m.circuit_short_name,
                            location: m.location,
                            country: m.country_name,
                            country_code: m.country_code || null,
                        });
                    }
                });

                // Inseriamo i Circuiti nel DB
                for (const circuit of Array.from(uniqueCircuits.values())) {
                    await db.insert(circuits)
                        .values(circuit)
                        .onConflictDoNothing();
                }
                console.log(`✅ Aggiunti/Verificati ${uniqueCircuits.size} circuiti.`);

                // Inseriamo gli Eventi nel DB
                console.log(`📍 Elaborazione Eventi (Gran Premi)...`);
                for (const m of openF1Meetings) {
                    await db.insert(events)
                        .values({
                            id: m.meeting_key,
                            year: m.year,
                            circuit_id: m.circuit_key,
                            name: m.meeting_name,
                            official_name: m.meeting_official_name,
                            location: m.location,
                            country_name: m.country_name,
                            date_start: new Date(m.date_start),
                        })
                        .onConflictDoNothing();
                }
                console.log(`✅ Aggiunti ${openF1Meetings.length} Gran Premi per il ${YEAR}.`);

                // 3. Scarichiamo i Driver e i Team usando la primissima sessione disponibile
                console.log(`\n👨‍🚀 Download Piloti e Scuderie (dalla prima sessione)...`);
                const firstMeeting = openF1Meetings[0];
                const firstSessions = await getSessions(firstMeeting.meeting_key, YEAR);

                if (firstSessions.length > 0) {
                    const sessionKey = firstSessions[0].session_key;
                    const openF1Drivers = await getDrivers(sessionKey);

                    // Estraiamo i Team univoci
                    const uniqueTeams = new Map();
                    openF1Drivers.forEach((d: any) => {
                        const teamId = d.team_name.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                        if (!uniqueTeams.has(teamId)) {
                            uniqueTeams.set(teamId, {
                                id: teamId,
                                name: d.team_name,
                                color: `#${d.team_colour}`,
                            });
                        }
                    });

                    // Inseriamo i Team
                    for (const team of Array.from(uniqueTeams.values())) {
                        await db.insert(teams).values(team).onConflictDoNothing();
                    }
                    console.log(`✅ Aggiunte/Verificate ${uniqueTeams.size} Scuderie.`);

                    // Inseriamo i Driver
                    for (const d of openF1Drivers) {
                        const teamId = d.team_name.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                        await db.insert(drivers)
                            .values({
                                id: d.driver_number,
                                number: d.driver_number,
                                broadcast_name: d.broadcast_name,
                                full_name: d.full_name,
                                name_acronym: d.name_acronym,
                                team_id: teamId,
                                country_code: d.country_code,
                                headshot_url: d.headshot_url,
                            })
                            .onConflictDoNothing();
                    }
                    console.log(`✅ Aggiunti/Verificati ${openF1Drivers.length} Piloti.`);
                }

                // 4. Salva anche le Singole Sessioni nel DB per questo anno!
                console.log(`\n⏱️ Elaborazione Sessioni del weekend (FP1, Sprint, Gara)...`);
                let totalSessions = 0;
                const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

                for (const m of openF1Meetings) {
                    const sessionsForMeeting = await getSessions(m.meeting_key, YEAR);
                    for (const s of sessionsForMeeting) {
                        await db.insert(sessions).values({
                            id: s.session_key,
                            event_id: s.meeting_key,
                            name: s.session_name,
                            type: s.session_type,
                            date_start: new Date(s.date_start),
                            date_end: new Date(s.date_end),
                            gmt_offset: s.gmt_offset
                        }).onConflictDoNothing();
                        totalSessions++;
                    }
                    // Aggiungiamo un ritardo di 500ms per non farci bannare dall'API di OpenF1
                    await delay(500);
                }
                console.log(`✅ Inserite ${totalSessions} sessioni ufficiali per il ${YEAR}.`);
            }
        } // Fine Loop ANNI

        console.log("\n🚀 SEEDING MULTI-STAGIONE COMPLETATO CON SUCCESSO!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Errore durante il processo di seeding:", error);
        process.exit(1);
    }
}

// Avviamo lo script
seedBaseData();
