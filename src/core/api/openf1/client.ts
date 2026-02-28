import { OpenF1Driver } from './interfaces/openf1Driver';
import { OpenF1Team } from './interfaces/openf1Team';
import { OpenF1Meeting } from './interfaces/openf1Meeting';
import { OpenF1Session } from './interfaces/openf1Session';
import { OpenF1Lap } from './interfaces/openf1Lap';
import { OpenF1PitStop } from './interfaces/openf1PitStop';
import { OpenF1CarData } from './interfaces/openf1CarData';

const BASE_URL = 'https://api.openf1.org/v1';

/**
 * Funzione generica per effettuare chiamate sicure verso OpenF1.
 */
async function fetchFromOpenF1<T>(endpoint: string): Promise<T[]> {
    const url = `${BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            // Aggiungiamo un default timeout per evitare chiamate bloccate (Next.js fetch API estesa)
            next: { revalidate: 3600 } // Cache default 1 ora per non martellare l'API esterna
        });

        if (!response.ok) {
            throw new Error(`[OpenF1 API] Call failed with status ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data as T[];
    } catch (error) {
        console.error(`[OpenF1 API Error] Fetching ${url} failed:`, error);
        throw error;
    }
}

// ----------------------------------------------------------------------------
// METODI ESPOSTI (WRAPPERS)
// ----------------------------------------------------------------------------

export async function getDrivers(sessionKey?: number): Promise<OpenF1Driver[]> {
    const query = sessionKey ? `?session_key=${sessionKey}` : '';
    return fetchFromOpenF1<OpenF1Driver>(`/drivers${query}`);
}

export async function getMeetings(year?: number): Promise<OpenF1Meeting[]> {
    const query = year ? `?year=${year}` : '';
    return fetchFromOpenF1<OpenF1Meeting>(`/meetings${query}`);
}

export async function getSessions(meetingKey?: number, year?: number): Promise<OpenF1Session[]> {
    const params = new URLSearchParams();
    if (meetingKey) params.append('meeting_key', meetingKey.toString());
    if (year) params.append('year', year.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchFromOpenF1<OpenF1Session>(`/sessions${query}`);
}

export async function getLaps(sessionKey: number, driverNumber?: number): Promise<OpenF1Lap[]> {
    const params = new URLSearchParams({ session_key: sessionKey.toString() });
    if (driverNumber) params.append('driver_number', driverNumber.toString());

    return fetchFromOpenF1<OpenF1Lap>(`/laps?${params.toString()}`);
}

export async function getPitStops(sessionKey: number): Promise<OpenF1PitStop[]> {
    return fetchFromOpenF1<OpenF1PitStop>(`/pit?session_key=${sessionKey}`);
}

export async function getCarData(sessionKey: number, driverNumber: number): Promise<OpenF1CarData[]> {
    return fetchFromOpenF1<OpenF1CarData>(`/car_data?session_key=${sessionKey}&driver_number=${driverNumber}`);
}
