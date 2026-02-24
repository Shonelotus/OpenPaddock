import { getStandings, getConstructorStandings } from "@/core/postgres/interactions/standings";
import StandingsGrid from "./StandingsGrid";
import ConstructorsGrid from "./ConstructorsGrid";

export const dynamic = 'force-dynamic';

export default async function StandingsPage(
    props: {
        searchParams: Promise<{ [key: string]: string | string[] | undefined }>
    }
) {
    const searchParams = await props.searchParams;
    const currentYear = searchParams.year ? parseInt(searchParams.year as string) : 2025;
    const view = (searchParams.view as string) || 'drivers';

    // Fetch dati dal DB in base alla vista selezionata
    const driversData = view === 'drivers' ? await getStandings(currentYear) : [];
    const constructorsData = view === 'constructors' ? await getConstructorStandings(currentYear) : [];

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-12 font-sans overflow-x-hidden relative">
            {/* Effetti scia F1 in background */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-600/20 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="mb-12 border-l-4 border-red-600 pl-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black mb-2 text-white tracking-tighter uppercase italic">
                            {view === 'drivers' ? 'The Grid' : 'Constructors'}
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl max-w-2xl">
                            {view === 'drivers'
                                ? 'Esplora i piloti e i team ufficiali della Formula 1.'
                                : 'Classifica mondiale costruttori della Formula 1.'}
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        {/* Selettore Drivers / Constructors */}
                        <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl backdrop-blur-md">
                            <a
                                href={`?year=${currentYear}&view=drivers`}
                                className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${view === 'drivers' ? 'bg-white/15 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Piloti
                            </a>
                            <a
                                href={`?year=${currentYear}&view=constructors`}
                                className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${view === 'constructors' ? 'bg-white/15 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Costruttori
                            </a>
                        </div>

                        {/* Selettore Anno */}
                        <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl backdrop-blur-md">
                            <a
                                href={`?year=2024&view=${view}`}
                                className={`px-6 py-2 rounded-lg font-bold transition-all ${currentYear === 2024 ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                2024
                            </a>
                            <a
                                href={`?year=2025&view=${view}`}
                                className={`px-6 py-2 rounded-lg font-bold transition-all ${currentYear === 2025 ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                2025
                            </a>
                        </div>
                    </div>
                </header>

                {view === 'drivers'
                    ? <StandingsGrid data={driversData} />
                    : <ConstructorsGrid data={constructorsData} />
                }
            </div>
        </div>
    );
}
