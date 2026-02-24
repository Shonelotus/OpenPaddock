import { db } from "../client";
import { drivers, teams, season_entrants } from "../schemas/2026-02-22_base_teams_drivers_circuits";
import { race_results } from "../schemas/2026-02-23_race_results";
import { events, sessions } from "../schemas/2026-02-22_events_and_sessions";
import { eq, sum, sql, and } from "drizzle-orm";

export async function getStandings(year?: number) {
    const query = db
        .select({
            driver: drivers,
            team: teams,
            rounds_entered: season_entrants.rounds_entered
        })
        .from(drivers)
        .innerJoin(season_entrants, eq(drivers.id, season_entrants.driver_id))
        .innerJoin(teams, eq(season_entrants.team_id, teams.id));

    if (year) {
        query.where(eq(season_entrants.year, year));
    }

    const rawStandings = await query;

    // 1. Deduplichiamo eventuali piloti che hanno corso per più scuderie nel medesimo anno (es. Bearman: Ferrari + Haas)
    // Assegnamo il pilota alla Scuderia in cui ha macinato più gare (Main Team)
    const uniqueDriversMap = new Map();
    for (const row of rawStandings) {
        if (!uniqueDriversMap.has(row.driver.id)) {
            uniqueDriversMap.set(row.driver.id, row);
        } else {
            const existing = uniqueDriversMap.get(row.driver.id);
            if (row.rounds_entered > existing.rounds_entered) {
                uniqueDriversMap.set(row.driver.id, row);
            }
        }
    }
    const uniqueStandings = Array.from(uniqueDriversMap.values());

    // 2. Calcoliamo la somma dei PUNTI REALI dal database race_results per tutti i piloti iscritti
    const enrichedStandings = await Promise.all(uniqueStandings.map(async (entry) => {
        // Filtraggio storico punti incrociando races ed events validi
        const pointsQuery = await db
            .select({ total_points: sql<number>`COALESCE(SUM(${race_results.points}), 0)` })
            .from(race_results)
            .innerJoin(sessions, eq(race_results.session_id, sessions.id))
            .innerJoin(events, eq(sessions.event_id, events.id))
            .where(
                and(
                    eq(race_results.driver_id, entry.driver.id),
                    year ? eq(events.year, year) : undefined
                )
            );

        return {
            ...entry,
            points: Number(pointsQuery[0]?.total_points || 0)
        };
    }));

    // 3. Filtro Titolari: mostriamo SOLO i 2 piloti principali per scuderia (quelli con più gare disputate)
    // I piloti di riserva restano nel database ma non appaiono nella griglia Standings.
    const teamsMainDrivers = new Map();
    for (const r of enrichedStandings) {
        if (!teamsMainDrivers.has(r.team.id)) teamsMainDrivers.set(r.team.id, []);
        teamsMainDrivers.get(r.team.id).push(r);
    }

    const finalGrid: any[] = [];
    for (const [teamId, tDrivers] of teamsMainDrivers) {
        tDrivers.sort((a: any, b: any) => b.rounds_entered - a.rounds_entered);
        // Prendiamo solo i primi 2 (i titolari ufficiali / chi ha corso più gare)
        finalGrid.push(...tDrivers.slice(0, 2));
    }

    // Ordinamento finale: per punti decrescenti, a parità per rounds disputati
    return finalGrid.sort((a, b) => b.points !== a.points ? b.points - a.points : b.rounds_entered - a.rounds_entered);
}