import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "OnlyF1 | Your Ultimate Formula 1 Hub",
    description: "Live timing, news, statistics, and historical data for F1 fans.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
