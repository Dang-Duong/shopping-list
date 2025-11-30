/**
 * Mock User Data
 * Used for transforming between DTOs (which use userId strings) and client types (which use User objects)
 */

import { User } from "@/app/types";

export const MOCK_USERS: Record<string, User> = {
  user1: {
    id: "user1",
    name: "John Doe",
    email: "john.doe@email.com",
  },
  user2: {
    id: "user2",
    name: "Jane Smith",
    email: "jane.smith@email.com",
  },
  user3: {
    id: "user3",
    name: "Peter Jones",
    email: "peter.jones@email.com",
  },
};

export function getUserById(userId: string): User | undefined {
  return MOCK_USERS[userId];
}

export function getUserByIdOrFallback(userId: string): User {
  return (
    MOCK_USERS[userId] || {
      id: userId,
      name: userId.split("@")[0] || "Unknown User",
      email: userId.includes("@") ? userId : undefined,
    }
  );
}
