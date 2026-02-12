"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/core/pocketbase/auth";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleLogin(e: React.SubmitEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await login(email, password);
            router.push("/"); // Vai alla home (che verificherà l'autenticazione)
        } catch (err: any) {
            setError("Credenziali non valide");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background text-white p-4">
            <div className="w-full max-w-md space-y-8 p-8 border border-white/10 rounded-2xl bg-black/50">
                <div className="text-center">
                    <h2 className="text-3xl font-bold">Accedi a OpenPaddock</h2>
                    <p className="mt-2 text-gray-400">Inserisci le tue credenziali</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary transition-colors"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary transition-colors"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <p className="text-center text-gray-400 text-xs">
                            Non ricordi la password?{" "}
                            <Link href="/resetPassword" className="text-primary hover:underline">
                                Clicca qui
                            </Link>
                        </p>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                        {loading ? "Caricamento..." : "Accedi"}
                    </button>
                </form>

                <p className="text-center text-gray-400 text-sm">
                    Non hai un account?{" "}
                    <Link href="/register" className="text-primary hover:underline">
                        Registrati
                    </Link>
                </p>
            </div>
        </div>
    );
}
