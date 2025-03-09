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

        // Get completed shifts
        const { data, error } = await supabase
            .from('shifts')
            .select('start_time')
            .eq('user_id', userId)
            .eq('status', 'completed')
            .order('start_time', { ascending: false });

        if (error) throw error;

        // Count unique days with completed shifts
        const uniqueDays = new Set();
        
        if (data && data.length > 0) {
            data.forEach(shift => {
                // Convert to YYYY-MM-DD format to count unique days
                const date = new Date(shift.start_time);
                const dateString = date.toISOString().split('T')[0];
                uniqueDays.add(dateString);
            });
        }

        return NextResponse.json(
            { 
                completedDays: uniqueDays.size,
                days: Array.from(uniqueDays)
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching completed shift days:', error);
        return NextResponse.json(
            { error: error.message || 'Server error' },
            { status: 500 }
        );
    }
}