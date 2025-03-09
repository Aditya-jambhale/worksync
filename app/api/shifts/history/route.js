// app/api/shifts/history/route.js
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

        // Get the URL search params (for pagination, filtering, etc.)
        const url = new URL(req.url);
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const page = parseInt(url.searchParams.get('page') || '0');
        const status = url.searchParams.get('status') || null;
        
        // Build the query
        let query = supabase
            .from('shifts')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('start_time', { ascending: false })
            .range(page * limit, (page * limit) + limit - 1);
            
        // Add status filter if provided
        if (status) {
            query = query.eq('status', status);
        }
        
        // Execute the query
        const { data, error, count } = await query;

        if (error) throw error;
        
        return NextResponse.json(
            { 
                shifts: data,
                count,
                page,
                limit
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching shift history:', error);
        return NextResponse.json(
            { error: error.message || 'Server error' },
            { status: 500 }
        );
    }
}