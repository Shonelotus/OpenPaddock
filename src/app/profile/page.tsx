"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { getCurrentUser } from "@/core/supabase/auth"

export default function ProfilePage() {
    const router = useRouter();
    const user = getCurrentUser();
    useEffect(() => {
        if (!user) {
            router.push("/login");
        }
    }, [user]);
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background text-white p-4">
            <div className="w-full max-w-md space-y-8 p-8 border border-white/10 rounded-2xl bg-black/50">
                <div className="text-center">
                    <h2 className="text-3xl font-bold">Profilo</h2>

                </div>
            </div>
        </div>
    );
}