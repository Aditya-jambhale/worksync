import { NextResponse } from 'next/server';
import supabase from '@/app/DB/dbConnect';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/user/Dashboard';

    // 1. PKCE FLOW (Server-side Code Exchange)
    if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (!error && data.user) {
            const user = data.user;
            
            // Sync with public.users table (Update or Insert)
            const { data: userData, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('email', user.email)
                .single();

            const avatarUrl = user.user_metadata.avatar_url || user.user_metadata.picture;
            const fullName = user.user_metadata.full_name || user.user_metadata.name || user.email.split('@')[0];
            let finalUserId = userData?.userId;

            if (userData) {
                // UPDATE existing user with latest social info if missing
                await supabase.from('users')
                    .update({ 
                        name: fullName, 
                        avatar_url: avatarUrl 
                    })
                    .eq('email', user.email);
            } else {
                // INSERT new user
                finalUserId = uuidv4();
                await supabase.from('users').insert([{
                    userId: finalUserId,
                    name: fullName,
                    email: user.email,
                    password: 'social_auth_user',
                    role: 'Intern',
                    avatar_url: avatarUrl
                }]);
            }

            // Set Legacy Cookie Session
            const sessionToken = uuidv4();
            const sessionData = JSON.stringify({ token: sessionToken, userId: finalUserId, role: "user" });

            const redirectUrl = new URL(next, origin);
            redirectUrl.searchParams.set('login', 'success');

            const response = NextResponse.redirect(redirectUrl);
            response.cookies.set('user_session_token', sessionData, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7,
                path: '/'
            });

            return response;
        }
    }

    // 2. IMPLICIT FLOW FALLBACK (Fragment/Hash based)
    // If we land here, it means there was no 'code'. We serve a bridge page 
    // that preserves the #hash and redirects to the client-side handler in signin page.
    return new NextResponse(
        `<!DOCTYPE html>
        <html>
            <head><title>Completing Authentication...</title></head>
            <body style="background: #fafafa; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
                <div style="text-align: center;">
                    <div style="width: 40px; height: 40px; border: 3px solid #0f172a; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                    <p style="font-size: 14px; font-weight: 600; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Syncing Workspace...</p>
                </div>
                <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
                <script>
                    // Pass the hash fragments to the signin page where our useEffect will catch them
                    window.location.href = "/user/signin" + window.location.search + window.location.hash;
                </script>
            </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
    );
}
