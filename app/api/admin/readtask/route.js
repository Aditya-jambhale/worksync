// app/api/tasks/mytasks/route.js
import { NextResponse } from 'next/server';
import supabase from '@/app/DB/dbConnect';

export async function GET(req) {
    try {
        // Retrieve the session cookie (assumed to be named 'user_session_token')
        const tokenCookie = req.cookies.get('admin_session_token');
        if (!tokenCookie) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Parse the session cookie to obtain the user ID.
        let sessionData;
        try {
            sessionData = JSON.parse(decodeURIComponent(tokenCookie.value));
        } catch (err) {
            return NextResponse.json(
                { error: 'Invalid session token' },
                { status: 401 }
            );
        }

        const adminId= sessionData.adminId;
        if (!adminId) {
            return NextResponse.json(
                { error: 'Unauthorized access' },
                { status: 403 }
            );
        }

        // Query the tasks table for tasks assigned to this user.
        const { data, error } = await supabase
            .from('tasks')
            .select('*, user:users(name)')
            .eq('adminId', adminId);

        if (error) throw error;

        return NextResponse.json({ tasks: data }, { status: 200 });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json(
            { error: error.message || 'Server error' },
            { status: 500 }
        );
    }
}
