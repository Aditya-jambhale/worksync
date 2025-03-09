// app/api/users/me/route.js
import { NextResponse } from 'next/server';
import supabase from '@/app/DB/dbConnect';

export async function GET(req) {
    try {
        // Retrieve the user session cookie (assumed to be named 'user_session_token')
        const tokenCookie = req.cookies.get('user_session_token');
        if (!tokenCookie) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Parse the session cookie to obtain the userId
        let sessionData;
        try {
            sessionData = JSON.parse(decodeURIComponent(tokenCookie.value));
        } catch (err) {
            return NextResponse.json({ error: 'Invalid session token' }, { status: 401 });
        }

        const userId = sessionData.userId;
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }

        // Query the 'user' table for the user's details (adjust the table name as needed)
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('userId', userId)
            .single();
            
        if (error) throw error;

        // Return the fetched user details as JSON
        return NextResponse.json({ user: data }, { status: 200 });
    } catch (error) {
        console.error('Error fetching user details:', error);
        return NextResponse.json(
            { error: error.message || 'Something went wrong' },
            { status: 500 }
        );
    }
}
