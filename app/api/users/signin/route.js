// app/api/users/signin/route.js
import { NextResponse } from 'next/server';
import supabase from '@/app/DB/dbConnect';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
    try {
        // Parse the JSON request body
        const { email, password } = await req.json();
        
        // Look up the user by email (using .single() to get one record)
        const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        
        if (fetchError || !userData) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }
        
        // Simple password comparison without encryption
        if (password !== userData.password) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }
        
        // Generate a session token
        const sessionToken = uuidv4();
        // Create a simple session object
        const sessionData = JSON.stringify({ token: sessionToken, userId: userData.userId, role: "user" });
        
        // Create a response with the session cookie attached
        const response = NextResponse.json({
            message: 'Signin successful',
            user: { id: userData.userId, email: userData.email, name: userData.name, role: "user" }
        });
        response.cookies.set('user_session_token', sessionData, {
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