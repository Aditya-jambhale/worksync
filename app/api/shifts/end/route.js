// app/api/shifts/end/route.js
import supabase from '@/app/DB/dbConnect';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        // Parse request body to get work notes
        const body = await req.json();
        const { notes } = body;

        // Validate work notes
        if (!notes || notes.trim() === '') {
            return NextResponse.json(
                { error: 'Work notes are required when ending a shift' },
                { status: 400 }
            );
        }

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

        // Find the active shift for this user
        const { data: activeShift, error: findError } = await supabase
            .from('shifts')
            .select('id')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('start_time', { ascending: false })
            .limit(1);

        if (findError) throw findError;
        
        if (!activeShift || activeShift.length === 0) {
            return NextResponse.json(
                { error: 'No active shift found' },
                { status: 404 }
            );
        }

        // Current timestamp
        const endTime = new Date().toISOString();

        // Update the shift to mark it as ended
        const { data, error } = await supabase
            .from('shifts')
            .update({ 
                end_time: endTime,
                status: 'completed',
                notes: notes // Store notes directly in the shifts table
            })
            .eq('id', activeShift[0].id)
            .select();

        if (error) throw error;

        return NextResponse.json(
            { 
                message: 'Shift ended successfully', 
                shift: data[0]
            },
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