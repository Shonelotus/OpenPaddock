import { NextRequest, NextResponse } from "next/server";
import pb from "./core/pocketbase/connection";

export async function middleware(request: NextRequest) {

    const authCookie = request.cookies.get('pb_auth');
    if (authCookie) {
        pb.authStore.loadFromCookie(authCookie.value);
    }

    const { pathname } = request.nextUrl;

    const isPublicPage = pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/resetPassword' ||
        pathname === '/';


    if (!pb.authStore.isValid && !isPublicPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (pb.authStore.isValid && isPublicPage && pathname !== '/resetPassword') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
