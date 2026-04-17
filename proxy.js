import { NextResponse } from "next/server";

export function proxy(request) {
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

    // ALLOW access to the root landing page ("/")
    if (pathname === "/") {
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    // Apply middleware to user landing page and admin main pages
    matcher: ["/", "/admin/main/:path*"],
};
