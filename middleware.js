import { NextResponse } from "next/server";

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // PUBLIC: allow access to public routes
    if (
        pathname.startsWith("/user") ||
        pathname.startsWith("/admin/signin")
    ) {
        return NextResponse.next();
    }

    // PROTECT ADMIN: for /admin/main routes, require admin_session_token
    if (pathname.startsWith("/admin/main")) {
        const adminCookie = request.cookies.get("admin_session_token");
        if (!adminCookie) {
            const url = request.nextUrl.clone();
            url.pathname = "/admin/signin";
            return NextResponse.redirect(url);
        }
    }

    // PROTECT USER: for the user landing page ("/"), require user_session_token
    if (pathname === "/") {
        const userCookie = request.cookies.get("user_session_token");
        if (!userCookie) {
            const url = request.nextUrl.clone();
            url.pathname = "/user"; // e.g. public sign in page for users
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    // Apply middleware to user landing page and admin main pages
    matcher: ["/", "/admin/main/:path*"],
};
