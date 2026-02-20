import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    // Crea una risposta iniziale che potremo modificare per impostare i cookie
    let supabaseResponse = NextResponse.next({
        request,
    })

    // Inizializza il client Supabase per il Server-Side (SSR)
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    // Aggiorna i cookie nella richiesta corrente (necessario per SSR)
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    // ...e ricrea la risposta per includere i nuovi cookie da inviare al browser
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Recupera l'utente. 
    // IMPORTANTE: usiamo getUser() e NON getSession(), perché getUser() 
    // chiama il server di Supabase per validare il token in modo sicuro.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname;

    // --- REGOLA 1: ROTTE PROTETTE ---
    // Qui inseriamo tutte le pagine che NON possono essere viste senza login
    const protectedRoutes = ['/profile', '/live-timing', '/stats'];
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

    // Se non c'è l'utente (non loggato) e prova ad accedere a una di queste rotte:
    if (!user && isProtectedRoute) {
        // Reindirizziamo l'intruso alla pagina di login
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // --- REGOLA 2: ROTTE AUTH (GIA' LOGGATI) ---
    // Un utente già loggato non ha motivo di vedere queste pagine
    const authRoutes = ['/login', '/register', '/resetPassword'];
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

    if (user && isAuthRoute) {
        // Lo rimandiamo alla home
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    // Se supera tutti i controlli, invia la risposta normale della pagina
    return supabaseResponse
}
