import { NextRequest, NextResponse } from "next/server";
import pb from "./core/pocketbase/connection";

export async function middleware(request: NextRequest) {

    // 1. Carica la sessione dai cookie
    const authCookie = request.cookies.get('pb_auth');
    if (authCookie) {
        pb.authStore.loadFromCookie(authCookie.value);
    }

    const { pathname } = request.nextUrl;

    // 2. Definisci le rotte pubbliche
    const isPublicPage = pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/resetPassword' ||
        pathname === '/';


    // Se NON è loggato e prova ad accedere a una pagina protetta -> Redirect a login
    if (!pb.authStore.isValid && !isPublicPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Se È loggato e prova ad accedere a login/register -> Redirect a home
    if (pb.authStore.isValid && isPublicPage && pathname !== '/resetPassword') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Altrimenti procedi normalmente
    return NextResponse.next();
}

export const config = {
    // Proteggi tutto tranne i file statici, immagini, favicon e le API
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
