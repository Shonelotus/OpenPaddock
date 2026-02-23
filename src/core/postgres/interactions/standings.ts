import { db } from "../client";
import { drivers, teams, season_entrants } from "../schemas/2026-02-22_base_teams_drivers_circuits";
import { race_results } from "../schemas/2026-02-23_race_results";
import { events, sessions } from "../schemas/2026-02-22_events_and_sessions";
import { eq, sum, sql, and } from "drizzle-orm";

export async function getStandings(year?: number) {
    // 1. Recuperiamo i piloti iscritti per quell'anno (titolari)
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
    const teamsMap = new Map<number, typeof rawStandings>();

    for (const row of rawStandings) {
        if (!teamsMap.has(row.team.id)) teamsMap.set(row.team.id, []);
        teamsMap.get(row.team.id)!.push(row);
    }

    const titularStandings = [];
    for (const [teamId, teamDrivers] of teamsMap) {
        teamDrivers.sort((a, b) => b.rounds_entered - a.rounds_entered);
        titularStandings.push(...teamDrivers.slice(0, 2));
    }

    // 2. Calcoliamo la somma dei punti reali dal database race_results
    const finalStandings = await Promise.all(titularStandings.map(async (entry) => {
        // Filtraggio storico usando cross join logic tramite innerJoin
        const pointsQuery = await db
            .select({
                total_points: sql<number>`COALESCE(SUM(${race_results.points}), 0)`
            })
            .from(race_results)
            .innerJoin(sessions, eq(race_results.session_id, sessions.id))
            .innerJoin(events, eq(sessions.event_id, events.id))
            .where(
                and(
                    eq(race_results.driver_id, entry.driver.id),
                    year ? eq(events.year, year) : undefined
                )
            );

        const totalPoints = pointsQuery[0]?.total_points || 0;

        return {
            ...entry,
            points: Number(totalPoints) // Sicurizza come type number
        };
    }));

    // Ritorniamo i piloti ordinati per Punteggio decrescente
    return finalStandings.sort((a, b) => b.points - a.points);
}