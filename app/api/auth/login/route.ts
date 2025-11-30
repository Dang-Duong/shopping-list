/**
 * Auth Login Route
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from "next/server";
import { MOCK_USERS } from "@/app/mock/mockUsers";

// Simple mock authentication - in production, use proper password hashing
// In a real app, this would be stored in a database
const MOCK_PASSWORDS: Record<string, string> = {
  "john.doe@email.com": "password123",
  "jane.smith@email.com": "password123",
  "peter.jones@email.com": "password123",
};

// Runtime user storage (in production, use database)
// This is shared with register route
const runtimeUsers: Record<string, { id: string; name: string; email: string }> = {};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user exists in mock users or runtime users
    const mockUser = Object.values(MOCK_USERS).find((u) => u.email === email);
    const runtimeUser = Object.values(runtimeUsers).find((u) => u.email === email);
    const user = mockUser || runtimeUser;
    
    const correctPassword = MOCK_PASSWORDS[email];

    if (!user || password !== correctPassword) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

