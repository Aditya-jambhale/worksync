import { NextResponse } from 'next/server';
import supabase from '@/app/DB/dbConnect';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
    try {
        const { name, email, password, role } = await req.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single();

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        // Generate a new userId
        const userId = uuidv4();

        // Insert new user into the database
        const { data, error: insertError } = await supabase
            .from('users')
            .insert([{ userId, name, email, password, role }])
            .select()
            .single();

        if (insertError) {
            throw insertError;
        }

        // Create a simple session object
        const sessionData = JSON.stringify({ token: uuidv4(), userId: userId, role: "user" });

        // Set the session cookie and return response
        const response = NextResponse.json({
            message: 'Account created successfully',
            user: { id: userId, email: email, name: name, role: role }
        });

        response.cookies.set('user_session_token', sessionData, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
        });

        return response;
    } catch (err) {
        console.error('Signup error:', err);
        return NextResponse.json(
            { error: err.message || 'Server error' },
            { status: 500 }
        );
    }
}
