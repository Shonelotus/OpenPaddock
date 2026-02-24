"use client";

import { motion } from "framer-motion";
import { MapPin, Trophy, User } from "lucide-react";

type ConstructorData = {
    team: any;
    drivers: { driver: any; points: number }[];
    totalPoints: number;
};

export default function ConstructorsGrid({ data }: { data: ConstructorData[] }) {
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.12 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 40 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } },
    };

    return (
        <motion.div
            className="flex flex-col gap-5"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {data.map((entry, index) => (
                <motion.div
                    key={entry.team.id}
                    variants={itemVariants}
                    className="relative group overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-white/25 transition-all duration-500"
                >
                    {/* Bordo laterale colorato */}
                    <div
                        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                        style={{ backgroundColor: entry.team.color || '#ffffff' }}
                    />

                    {/* Sfondo sfumato col colore del team */}
                    <div
                        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500"
                        style={{ background: `linear-gradient(135deg, ${entry.team.color || '#fff'}33, transparent 60%)` }}
                    />

                    <div className="p-6 pl-8 relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                            {/* Posizione + Nome Team */}
                            <div className="flex items-center gap-5 flex-1 min-w-0">
                                {/* Badge Posizione */}
                                <div className={`flex items-center justify-center w-14 h-14 rounded-2xl shrink-0 font-black text-2xl shadow-lg
                                    ${index === 0 ? 'bg-linear-to-br from-yellow-500 to-amber-600 text-black' :
                                        index === 1 ? 'bg-linear-to-br from-slate-300 to-slate-400 text-black' :
                                            index === 2 ? 'bg-linear-to-br from-amber-700 to-amber-800 text-white' :
                                                'bg-white/10 text-white'}`}
                                >
                                    {index + 1}
                                </div>

                                <div className="min-w-0">
                                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight truncate">
                                        {entry.team.name}
                                    </h2>
                                    <div className="flex items-center gap-4 mt-1.5">
                                        {entry.team.principal && (
                                            <p className="text-sm text-slate-400 flex items-center gap-1.5">
                                                <User size={13} className="text-slate-500" />
                                                {entry.team.principal}
                                            </p>
                                        )}
                                        {entry.team.base && (
                                            <p className="text-sm text-slate-400 flex items-center gap-1.5">
                                                <MapPin size={13} className="text-slate-500" />
                                                {entry.team.base}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Piloti */}
                            <div className="flex items-center gap-4 shrink-0">
                                {entry.drivers.map((d) => (
                                    <div key={d.driver.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                                        <div
                                            className="w-10 h-10 rounded-full bg-linear-to-br from-slate-800 to-slate-900 border-2 flex items-center justify-center overflow-hidden shrink-0"
                                            style={{ borderColor: entry.team.color || '#333' }}
                                        >
                                            {d.driver.headshot_url ? (
                                                <img
                                                    src={d.driver.headshot_url}
                                                    alt={d.driver.full_name}
                                                    className="w-full h-full object-cover object-top scale-110"
                                                />
                                            ) : (
                                                <User size={18} className="text-slate-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white leading-tight">{d.driver.name_acronym}</p>
                                            <p className="text-xs text-slate-400">{d.points} PTS</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Punti Totali */}
                            <div className="flex items-center gap-3 shrink-0">
                                <div
                                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xl"
                                    style={{
                                        backgroundColor: `${entry.team.color || '#fff'}20`,
                                        color: entry.team.color || '#fff',
                                        border: `1px solid ${entry.team.color || '#fff'}40`
                                    }}
                                >
                                    <Trophy size={18} />
                                    {entry.totalPoints} <span className="text-sm font-bold opacity-70">PTS</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}
