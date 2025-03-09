import { NextResponse } from 'next/server';

export async function POST() {
    try {
        // Create a response to clear the session cookie
        const response = NextResponse.json({
            message: 'Signed out successfully'
        });

        response.cookies.delete('user_session_token', { path: '/' });

        return response;
    } catch (err) {
        console.error('Signout error:', err);
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        );
    }
}