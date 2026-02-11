"use client"; // Dice a Next.js che questo componente gira nel browser

import { useEffect, useState } from "react";
import pb from "@/core/pocketbase/connection"; // Importa la connessione al database PocketBase
import LandingPage from "@/app/landingPage/page"; // Importa la pagina di presentazione (landing)

export default function HomePage() {
    // STATI: Variabili che React osserva per capire cosa mostrare
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true); // Per mostrare "Caricamento" all'inizio

    // useEffect: Viene eseguito una sola volta all'apertura della pagina
    useEffect(() => {
        // Controlliamo se nel browser esiste una sessione valida dell'utente
        setIsAuthenticated(pb.authStore.isValid);

        // Finito il controllo, togliamo la scritta caricamento
        setLoading(false);
    }, []);

    // Se stiamo ancora controllando se l'utente esiste...
    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background text-white">
                <p>Caricamento...</p>
            </div>
        );
    }

    // LOGICA DI NAVIGAZIONE:
    // 1. Se l'utente NON è loggato -> Mostra la Landing Page (Vetrine/Marketing)
    if (!isAuthenticated) {
        return <LandingPage />;
    }

    // 2. Se l'utente È loggato -> Mostra la vera Dashboard dell'app
    return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-white p-8">
            <h1 className="text-4xl font-bold mb-4">Bentornato su OnlyF1! 🏎️</h1>
            <p className="text-xl text-gray-400 mb-8">Questa è la tua Dashboard (Ancora in costruzione).</p>

            <button
                onClick={() => {
                    pb.authStore.clear(); // "Dimentica" l'utente nel browser
                    setIsAuthenticated(false); // Torna alla Landing Page
                }}
                className="px-6 py-2 bg-red-600 rounded-full hover:bg-red-700 transition"
            >
                Esci (Logout)
            </button>
        </div>

        //devo ritornare il componente dashboard
    );
}
