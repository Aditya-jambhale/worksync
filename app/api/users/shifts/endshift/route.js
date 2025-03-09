// app/api/users/endshift/route.js
import supabase from '@/app/DB/dbConnect';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        // Retrieve the session cookie (assumed to be named 'user_session_token')
        const tokenCookie = req.cookies.get('user_session_token');
        if (!tokenCookie) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Parse the session cookie to get the userId
        let sessionData;
        try {
            sessionData = JSON.parse(decodeURIComponent(tokenCookie.value));
        } catch (err) {
            return NextResponse.json(
                { error: 'Invalid session token' },
                { status: 401 }
            );
        }
        const userId = sessionData.userId;
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized access' },
                { status: 403 }
            );
        }

        // Format current timestamp in 12-hour format
        const now = new Date();
        const formattedTime = now.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });

        // Update the "endshift" column with the formatted timestamp
        const { data, error } = await supabase
            .from('users')
            .update({ end_shift: formattedTime })
            .eq('userId', userId);

        if (error) throw error;

        return NextResponse.json(
            { message: 'Shift ended successfully', data },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error ending shift:', error);
        return NextResponse.json(
            { error: error.message || 'Server error' },
            { status: 500 }
        );
    }
}
