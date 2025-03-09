// app/api/users/sign/route.js
import { NextResponse } from 'next/server';
import supabase from '@/app/DB/dbConnect';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        // Parse the request JSON body
        const { name, email, password } = await req.json();

        // Basic email validation using a simple regex
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        // Check that a password is provided and meets a minimum length requirement
        if (!password || password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        // Check if the email already exists in the "users" table
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (fetchError) {
            return NextResponse.json(
                { error: fetchError.message },
                { status: 500 }
            );
        }

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already in use' },
                { status: 400 }
            );
        }

        // Hash the password using bcrypt
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Insert the new user into the "users" table in Supabase
        const {data,error} = await supabase
            .from('users')
            .insert([{ name, email, password: hashedPassword }]);
console.log(data);
        // Check if Supabase returned an error
        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        // Return a successful JSON response with the inserted data
        return NextResponse.json(
            { message: 'User created successfully'},
            {user:data},
            { status: 200 }
        );
    } catch (err) {
        console.error('Signup error:', err);
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        );
    }
}
