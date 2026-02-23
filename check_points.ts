import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from './src/core/postgres/client';
import { race_results } from './src/core/postgres/schemas/2026-02-23_race_results';
import { sessions } from './src/core/postgres/schemas/2026-02-22_events_and_sessions';
import { eq } from 'drizzle-orm';
import fs from 'fs';

(async () => {
    const data = await db.select().from(race_results)
        .innerJoin(sessions, eq(race_results.session_id, sessions.id))
        .where(eq(race_results.driver_id, 4));

    fs.writeFileSync('norris_trace.json', JSON.stringify(data, null, 2));
    console.log("Trace saved to norris_trace.json");
    process.exit(0);
})();
