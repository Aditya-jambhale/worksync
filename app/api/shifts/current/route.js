// app/api/shifts/current/route.js
import supabase from '@/app/DB/dbConnect';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        // Retrieve the session cookie
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

        // Find the current active shift for this user
        const { data, error } = await supabase
            .from('shifts')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('start_time', { ascending: false })
            .limit(1);

        if (error) throw error;
        
        return NextResponse.json(
            { 
                activeShift: data.length > 0 ? data[0] : null
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching current shift:', error);
        return NextResponse.json(
            { error: error.message || 'Server error' },
            { status: 500 }
        );
    }
}
