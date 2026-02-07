import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Usa la cartella Src/ invece di src/
    experimental: {
        // Nessuna config speciale necessaria, 
        // Next.js trova automaticamente la cartella App dentro tsconfig paths
    },
};

export default nextConfig;
