import { db } from "../client";
import { drivers, teams, season_entrants } from "../schemas/2026-02-22_base_teams_drivers_circuits";
import { eq } from "drizzle-orm";

export async function getStandings(year?: number) {
    // Usiamo la sintassi SQL standard di Drizzle tramite Join con la nuova tabella pivot
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

    // Raggruppiamo i piloti per scuderia
    const teamsMap = new Map<number, typeof rawStandings>();

    for (const row of rawStandings) {
        if (!teamsMap.has(row.team.id)) {
            teamsMap.set(row.team.id, []);
        }
        teamsMap.get(row.team.id)!.push(row);
    }

    // Teniamo solo i 2 piloti Titolari per scuderia (quelli con più gp disputati)
    const titularStandings = [];
    for (const [teamId, teamDrivers] of teamsMap) {
        // Ordina in modo decrescente per numero di presenze
        teamDrivers.sort((a, b) => b.rounds_entered - a.rounds_entered);
        // Prendi i primi 2
        titularStandings.push(...teamDrivers.slice(0, 2));
    }

    // Ritorniamo i piloti ordinati per Scuderia
    return titularStandings.sort((a, b) => {
        if (a.team.name < b.team.name) return -1;
        if (a.team.name > b.team.name) return 1;
        return a.driver.number - b.driver.number;
    });
}