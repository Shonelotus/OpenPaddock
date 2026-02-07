import { getFullListDrivers } from "@/core/pocketbase/connection";

export default async function HomePage() {
    let drivers: any[] = [];
    let error: string | null = null;

    try {
        drivers = await getFullListDrivers();
    } catch (e: any) {
        error = e.message || "Errore di connessione";
    }

    return (
        <main className="min-h-screen p-10">
            <h1 className="text-4xl font-bold mb-2">🏎️ OnlyF1</h1>
            <p className="text-[var(--text-secondary)] mb-8">
                Dashboard di test — Connessione PocketBase
            </p>

            {error ? (
                <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
                    ❌ Errore: {error}
                </div>
            ) : (
                <div className="p-4 bg-green-900/20 border border-green-500 rounded-lg text-green-400 mb-6">
                    ✅ Connesso a PocketBase! Trovati {drivers.length} piloti.
                </div>
            )}

            {drivers.length > 0 && (
                <div className="grid gap-4 mt-6">
                    {drivers.map((driver: any) => (
                        <div
                            key={driver.id}
                            className="p-4 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg"
                        >
                            <p className="font-semibold text-lg">
                                {driver.name} {driver.surname}
                            </p>
                            <p className="text-sm text-[var(--text-muted)]">
                                #{driver.number} — {driver.team}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
