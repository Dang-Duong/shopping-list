import { Item } from "@/app/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export interface AddItemData {
  name: string;
  quantity?: number;
}

export async function getItems(listId: string): Promise<Item[]> {
  return [];
}

export async function addItem(listId: string, itemData: AddItemData): Promise<Item> {
  throw new Error("Not implemented");
}

export async function removeItem(listId: string, itemId: string): Promise<void> {
  throw new Error("Not implemented");
}

export async function markItemCompleted(
  listId: string,
  itemId: string,
  completed: boolean
): Promise<void> {
  throw new Error("Not implemented");
}