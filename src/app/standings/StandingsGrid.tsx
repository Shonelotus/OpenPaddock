"use client";

import { motion } from "framer-motion";
import { User, Flag, MapPin } from "lucide-react";
import Image from "next/image";

type StandingsData = {
    driver: any;
    team: any;
};

export default function StandingsGrid({ data }: { data: StandingsData[] }) {
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    };

    return (
        <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {data.map(({ driver, team }, index) => (
                <motion.div
                    key={`${driver.id}-${team?.id || index}`}
                    variants={itemVariants}
                    className="relative group overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-white/30 transition-all duration-500"
                >
                    {/* Sfondo sfumato col colore del team */}
                    <div
                        className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                        style={{ backgroundColor: team?.color || '#ffffff' }}
                    />

                    {/* Bordo superiore colorato */}
                    <div
                        className="h-2 w-full"
                        style={{ backgroundColor: team?.color || '#ffffff' }}
                    />

                    <div className="p-6 relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-3xl font-black text-white mix-blend-difference tracking-tighter">
                                    {driver.number}
                                </h2>
                                <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mt-1">
                                    {driver.name_acronym}
                                </p>
                            </div>

                            {driver.country_code && (
                                <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-md text-xs font-semibold shadow-inner">
                                    {getFlagUrl(driver.country_code) ? (
                                        <img src={getFlagUrl(driver.country_code)!} alt={driver.country_code} className="w-5 h-3.5 object-cover rounded-[2px]" />
                                    ) : (
                                        <Flag size={12} />
                                    )}
                                    <span>{driver.country_code}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-end justify-between">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-1">
                                    {driver.full_name}
                                </h3>
                                <div className="flex flex-col gap-1 mt-3">
                                    {team ? (
                                        <>
                                            <p className="text-sm font-medium flex items-center gap-2" style={{ color: team.color }}>
                                                <Shield size={14} />
                                                {team.name}
                                            </p>
                                            {team.base && (
                                                <p className="text-xs text-slate-400 flex items-center gap-2">
                                                    <MapPin size={12} />
                                                    {team.base}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">Nessun team assegnato</p>
                                    )}
                                </div>
                            </div>

                            {/* Foto Pilota (Se disponibile, altrimenti placeholder animato) */}
                            <div className="w-20 h-20 rounded-full bg-linear-to-br from-slate-800 to-slate-900 border-2 flex items-center justify-center shadow-xl overflow-hidden relative shrink-0"
                                style={{ borderColor: team?.color || '#333' }}>
                                {driver.headshot_url ? (
                                    // Usiamo tag img normale per sfuggire al config esigente di next/image sui domini esterni per ora
                                    <img
                                        src={driver.headshot_url}
                                        alt={driver.full_name}
                                        className="w-full h-full object-cover object-top scale-110 group-hover:scale-125 transition-transform duration-500"
                                    />
                                ) : (
                                    <User size={32} className="text-slate-600" />
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}

// Helper icona mancante in lucide
function Shield(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
    )
}

// Mappa per convertire i codici nazione F1 (es. GBR, NED) in codici ISO a 2 lettere 
// per renderizzare bandiere SVG esterne scaricate da FlagCDN (su Windows le emoji nazione non funzionano bene).
function getFlagUrl(countryCode: string) {
    const flags: Record<string, string> = {
        'NED': 'nl', 'GBR': 'gb', 'ESP': 'es', 'MON': 'mc',
        'FRA': 'fr', 'AUS': 'au', 'CAN': 'ca', 'JPN': 'jp',
        'MEX': 'mx', 'CHN': 'cn', 'USA': 'us', 'GER': 'de',
        'FIN': 'fi', 'DEN': 'dk', 'THAI': 'th', 'THA': 'th',
        'ITA': 'it', 'BRA': 'br', 'ARG': 'ar', 'NZL': 'nz',
        'SUI': 'ch', 'BEL': 'be'
    };

    const isoCode = flags[countryCode];
    if (isoCode) {
        return `https://flagcdn.com/w40/${isoCode}.png`;
    }
    return null;
}
