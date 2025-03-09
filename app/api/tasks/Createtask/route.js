// app/api/tasks/createtask/route.js
import supabase from "@/app/DB/dbConnect";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        // Retrieve the session token from cookies
        const tokenCookie = req.cookies.get('admin_session_token');
        if (!tokenCookie) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        // Parse the session cookie (assumes it contains JSON with adminId)
        let sessionData;
        try {
            sessionData = JSON.parse(decodeURIComponent(tokenCookie.value));
        } catch (err) {
            return NextResponse.json(
                { error: "Invalid session token" },
                { status: 401 }
            );
        }

        // Extract adminId from session data
        const adminId = sessionData.adminId;
        if (!adminId) {
            return NextResponse.json(
                { error: "Unauthorized access" },
                { status: 403 }
            );
        }

        // Parse the request body to extract task data
        const body = await req.json();
        const { userId, taskdescription } = body;

        if (!userId || !taskdescription) {
            return NextResponse.json(
                { error: "Missing required fields: userId and taskDescription" },
                { status: 400 }
            );
        }

        // Verify that the admin exists in the "admin" table
        const { data: adminData } = await supabase
            .from("admin")
            .select("*")
            .eq("adminId", adminId)
            .single();

        if (!adminData) {
            return NextResponse.json(
                { error: "Invalid adminId. Admin not found." },
                { status: 400 }
            );
        }

        // Verify that the user exists in the "user" table
        const { data: userData } = await supabase
            .from("users")
            .select("*")
            .eq("userId", userId)
            .single();

        if (!userData) {
            return NextResponse.json(
                { error: "Invalid userId. User not found." },
                { status: 400 }
            );
        }
        const { data: username, error: userError } = await supabase
            .from("users")  // adjust table name if needed (e.g., "users")
            .select("name")
            .eq("userId", userId)
            .single();
        if (userError) {
            console.error("Error fetching user name:", userError);
            // Optionally, you can still return success without the name or set it as "Unknown"
        }


        // Insert the new task into the "tasks" table using the adminId from the cookie
        const { data, error } = await supabase
            .from("tasks")
            .insert([{ adminId, userId, taskdescription }]);

        if (error) {
            throw error;
        }

        return NextResponse.json(
            {
                message: "Task created successfully", taskdetail: {

                    assignedUser: userId,
                    adminId: adminId,
                    task: taskdescription,
                    assignedUserName: username?.name || "Unknown",
                    createdat:new Date(),
                }
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in create task endpoint:", error);
        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
