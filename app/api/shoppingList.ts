import { ShoppingList, User } from "@/app/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function getShoppingLists(): Promise<ShoppingList[]> {
  return [];
}

export async function createShoppingList(name: string): Promise<ShoppingList> {
  throw new Error("Not implemented");
}

export async function deleteShoppingList(id: string): Promise<void> {
  throw new Error("Not implemented");
}

export async function getShoppingListDetail(id: string): Promise<ShoppingList> {
  throw new Error("Not implemented");
}

export async function renameShoppingList(id: string, newName: string): Promise<void> {
  throw new Error("Not implemented");
}

export async function inviteMember(listId: string, userId: string): Promise<void> {
  throw new Error("Not implemented");
}

export async function removeMember(listId: string, userId: string): Promise<void> {
  throw new Error("Not implemented");
}

export async function leaveShoppingList(listId: string): Promise<void> {
  throw new Error("Not implemented");
}