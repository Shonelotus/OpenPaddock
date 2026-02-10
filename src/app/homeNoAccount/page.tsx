"use client";

import Silk from "@/components/Silk";
import Link from "next/link";
import { Timer, Radio, BarChart3, ChevronRight, Sliders, Share2, History } from "lucide-react";

export default function HomeNoAccount() {
    return (
        <div className="w-screen h-screen relative overflow-hidden bg-background">
            <div className="absolute inset-0 z-0">
                <Silk
                    speed={6.4}
                    scale={1}
                    color="#ff0000"
                    noiseIntensity={1}
                    rotation={0}
                />
            </div>

            <div className="relative z-10 w-full h-full flex flex-col justify-between p-8 md:p-12">
                <header className="flex justify-end">
                    <Link href="/register">
                        <button className="
                            group flex items-center gap-2 
                            px-6 py-3 
                            bg-white/10 backdrop-blur-md 
                            border border-white/20 rounded-full
                            text-white font-semibold 
                            hover:bg-primary hover:border-primary 
                            transition-all duration-300
                        ">
                            Get Started
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                </header>

                <main className="flex flex-col items-center justify-center text-center space-y-6">

                    <h1 className="
                        text-7xl md:text-9xl 
                        font-black 
                        text-white tracking-tighter text-shadow-lg/90
                    ">
                        ONLYF1
                    </h1>

                    <p className="
                        text-xl md:text-3xl 
                        text-gray-200 font-light 
                        max-w-2xltext-shadow-lg/50
                    ">
                        "Tutto sulla F1 in un UNICO posto"
                    </p>
                </main>
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">

                    <FeatureCard
                        icon={<Timer className="w-8 h-8 text-primary" />}
                        title="Live Onboard"
                        desc="Segui i tempi sul giro in tempo reale con precisione millimetrica."
                    />

                    <FeatureCard
                        icon={<Radio className="w-8 h-8 text-primary" />}
                        title="Team Radio"
                        desc="Ascolta le comunicazioni tra piloti e box senza censure."
                    />

                    <FeatureCard
                        icon={<BarChart3 className="w-8 h-8 text-primary" />}
                        title="Statistiche"
                        desc="Analisi telemetriche dettagliate per ogni sessione."
                    />
                    <FeatureCard
                        icon={<Sliders className="w-8 h-8 text-primary" />}
                        title="Personalizza la tua esperienza"
                        desc="Scegli i piloti, i team e le statistiche che vuoi seguire."
                    />

                    <FeatureCard
                        icon={<Share2 className="w-8 h-8 text-primary" />}
                        title="Condividi"
                        desc="Posta foto e video dei tuoi momenti preferiti della F1."
                    />

                    <FeatureCard
                        icon={<History className="w-8 h-8 text-primary" />}
                        title="Storia F1"
                        desc="Ripercorri le stagioni passate e scopri le leggende di questo sport."
                    />

                </section>
            </div>
        </div >
    );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="
            flex flex-col items-start gap-4 p-6
            bg-black/40 backdrop-blur-xl 
            border border-white/10 rounded-2xl
            hover:border-primary/50 hover:bg-black/60
            transition-all duration-300 group
        ">
            <div className="
                p-3 bg-white/5 rounded-xl 
                group-hover:scale-110 transition-transform
            ">
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}