import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    try {
        const { password } = await req.json();

        // In a real app, this should be a strong hashed password checking against a DB, 
        // but for this simple app, we can use a basic secret or check against an env variable.
        // For now, let's use a hardcoded simple password for testing, or we can use another env var.
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

        if (password === ADMIN_PASSWORD) {
            // Create a JWT token
            const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET as string, {
                expiresIn: "1d",
            });

            // Create a response and set the cookie
            const response = NextResponse.json(
                { success: true, message: "Logged in successfully" },
                { status: 200 }
            );

            response.cookies.set("admin_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 60 * 60 * 24, // 1 day
                path: "/",
            });

            return response;
        } else {
            return NextResponse.json(
                { success: false, message: "Invalid password" },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
