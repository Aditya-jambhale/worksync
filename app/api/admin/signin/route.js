// app/api/users/signin/route.js
import { NextResponse } from 'next/server';
import supabase from '@/app/DB/dbConnect';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
    try {
        // Parse the JSON request body
        const { email, password } = await req.json();

        // Look up the user by email (using .single() to get one record)
        const { data: adminData, error: fetchError } = await supabase
            .from('admin')
            .select('*')
            .eq('email', email)
            .single();

        if (fetchError || !adminData) {
            return NextResponse.json(
                { error: 'Admin not found' },
                { status: 404 }
            );
        }

        // Check if the plain text password matches the stored password
        if (password !== adminData.password) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Generate a session token (for demonstration we use uuid)
        const adminsessionToken = uuidv4();
        const sessionData = JSON.stringify({ token: adminsessionToken, adminId: adminData.adminId, role: "admin" });

        // Create a response with the session cookie attached
        const response = NextResponse.json({
            message: 'Signin successful',
            user: { id: adminData.adminId, email: adminData.email, name: adminData.name, role: 'admin' }
        });
        response.cookies.set('admin_session_token', sessionData, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // cookie lasts 1 week
            path: '/'
        });

        return response;
    } catch (err) {
        console.error('Signin error:', err);
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        );
    }
}
