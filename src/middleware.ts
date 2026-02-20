import { type NextRequest } from 'next/server'
import { updateSession } from '@/core/supabase/middleware'

export async function middleware(request: NextRequest) {
    // Passiamo la richiesta alla nostra funzione di utilità Supabase SSR
    // che controllerà la sessione, rinnoverà i token se necessario
    // e gestirà i reindirizzamenti per le pagine protette.
    return await updateSession(request)
}

export const config = {
    // Qui diciamo a Next.js su quali percorsi far girare il middleware.
    // Ignoriamo file statici (_next, public, immagini) e le chimate /api
    // per non pesare sulle performance del frontend inutilmente.
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
