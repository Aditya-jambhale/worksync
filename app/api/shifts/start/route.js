// app/api/shifts/start/route.js
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

        // Check if user already has an active shift
        const { data: activeShift, error: activeError } = await supabase
            .from('shifts')
            .select('id')
            .eq('user_id', userId)
            .eq('status', 'active')
            .limit(1);

        if (activeError) throw activeError;
        
        if (activeShift && activeShift.length > 0) {
            return NextResponse.json(
                { error: 'You already have an active shift' },
                { status: 400 }
            );
        }

        // Get today's date at midnight in UTC
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        
        // Check if user already has any shift for today (active or completed)
        const { data: todayShift, error: todayError } = await supabase
            .from('shifts')
            .select('id')
            .eq('user_id', userId)
            .gte('start_time', today.toISOString())
            .limit(1);
            
        if (todayError) throw todayError;
        
        if (todayShift && todayShift.length > 0) {
            return NextResponse.json(
                { error: 'You can only have one shift per day' },
                { status: 400 }
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