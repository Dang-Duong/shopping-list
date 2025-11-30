/**
 * Item Service
 * Handles all item related API calls
 */

import { apiGet, apiPost, apiPut, apiDelete } from "./apiClient";
import {
  ShoppingListItemListDtoOut,
  ShoppingListItemAddDtoOut,
  ShoppingListItemRemoveDtoOut,
  ShoppingListItemCompleteDtoOut,
  ShoppingListItemUncompleteDtoOut,
  ShoppingListItemAddDtoIn,
  ShoppingListItemRemoveDtoIn,
  ShoppingListItemCompleteDtoIn,
  ShoppingListItemUncompleteDtoIn,
} from "@/app/dto";
import { Item } from "@/app/types";
import { transformItemDto } from "./types";

/**
 * Get items in a shopping list
 */
export async function getItems(shoppingListId: string): Promise<Item[]> {
  const response = await apiGet<ShoppingListItemListDtoOut>(
    "/shoppingList/item/list",
    { shoppingListId }
  );

  return response.items.map(transformItemDto);
}

/**
 * Add item to shopping list
 */
export async function addItem(
  shoppingListId: string,
  itemData: {
    name: string;
    productId?: string;
    quantity?: number;
    fit?: string;
  }
): Promise<Item> {
  const dtoIn: ShoppingListItemAddDtoIn = {
    shoppingListId,
    ...itemData,
  };
  const response = await apiPost<ShoppingListItemAddDtoOut>(
    "/shoppingList/item/add",
    dtoIn
  );

  return transformItemDto({
    id: response.id,
    name: response.name,
    productId: response.productId,
    quantity: response.quantity,
    fit: response.fit,
    completed: response.completed,
  });
}

/**
 * Remove item from shopping list
 */
export async function removeItem(
  shoppingListId: string,
  itemId: string
): Promise<void> {
  const dtoIn: ShoppingListItemRemoveDtoIn = {
    shoppingListId,
    itemId,
  };
  await apiDelete<ShoppingListItemRemoveDtoOut>(
    "/shoppingList/item/remove",
    dtoIn
  );
}

/**
 * Mark item as completed
 */
export async function completeItem(
  shoppingListId: string,
  itemId: string
): Promise<Item> {
  const dtoIn: ShoppingListItemCompleteDtoIn = {
    shoppingListId,
    itemId,
  };
  const response = await apiPut<ShoppingListItemCompleteDtoOut>(
    "/shoppingList/item/complete",
    dtoIn
  );

  // We need to get the full item, but for now return a partial
  return {
    id: itemId,
    name: "",
    completed: response.completed,
  } as Item;
}

/**
 * Mark item as uncompleted
 */
export async function uncompleteItem(
  shoppingListId: string,
  itemId: string
): Promise<Item> {
  const dtoIn: ShoppingListItemUncompleteDtoIn = {
    shoppingListId,
    itemId,
  };
  const response = await apiPut<ShoppingListItemUncompleteDtoOut>(
    "/shoppingList/item/uncomplete",
    dtoIn
  );

  // We need to get the full item, but for now return a partial
  return {
    id: itemId,
    name: "",
    completed: response.completed,
  } as Item;
}
