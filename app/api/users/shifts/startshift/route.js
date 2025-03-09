import supabase from '@/app/DB/dbConnect';
import { NextResponse } from 'next/server';

export async function POST(req) {
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

        // Create a new shift record
        const { data, error } = await supabase
            .from('shifts')
            .insert({
                user_id: userId,
                start_time: new Date().toISOString(),
                status: 'active'
            })
            .select();

        if (error) throw error;

        return NextResponse.json(
            { 
                message: 'Shift started successfully', 
                shift: data[0]
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error starting shift:', error);
        return NextResponse.json(
            { error: error.message || 'Server error' },
            { status: 500 }
        );
    }
}