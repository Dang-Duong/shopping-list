/**
 * Auth Register Route
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from "next/server";
import { MOCK_USERS, getUserById } from "@/app/mock/mockUsers";

// Simple mock authentication - in production, use proper password hashing
// In a real app, this would be stored in a database
const MOCK_PASSWORDS: Record<string, string> = {
  "john.doe@email.com": "password123",
  "jane.smith@email.com": "password123",
  "peter.jones@email.com": "password123",
};

// Runtime user storage (in production, use database)
const runtimeUsers: Record<string, { id: string; name: string; email: string }> = {};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists in mock users
    const existingMockUser = Object.values(MOCK_USERS).find(
      (u) => u.email === email
    );
    if (existingMockUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Check if user already exists in runtime users
    const existingRuntimeUser = Object.values(runtimeUsers).find(
      (u) => u.email === email
    );
    if (existingRuntimeUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create new user (in production, save to database)
    const newUserId = `user_${Date.now()}`;
    const newUser = {
      id: newUserId,
      name,
      email,
    };

    // Store user and password (in production, hash password and save to database)
    runtimeUsers[newUserId] = newUser;
    MOCK_PASSWORDS[email] = password;

    return NextResponse.json({
      user: newUser,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

