/**
 * Member Service
 * Handles all member related API calls
 */

import { apiPost, apiDelete } from "./apiClient";
import {
  ShoppingListMemberAddDtoOut,
  ShoppingListMemberRemoveDtoOut,
  ShoppingListMemberLeaveDtoOut,
  ShoppingListMemberAddDtoIn,
  ShoppingListMemberRemoveDtoIn,
  ShoppingListMemberLeaveDtoIn,
} from "@/app/dto";

/**
 * Add member to shopping list
 */
export async function addMember(
  shoppingListId: string,
  userId: string,
  role?: string
): Promise<void> {
  const dtoIn: ShoppingListMemberAddDtoIn = {
    shoppingListId,
    userId,
    role,
  };
  await apiPost<ShoppingListMemberAddDtoOut>("/shoppingList/member/add", dtoIn);
}

/**
 * Remove member from shopping list
 */
export async function removeMember(
  shoppingListId: string,
  userId: string
): Promise<void> {
  const dtoIn: ShoppingListMemberRemoveDtoIn = {
    shoppingListId,
    userId,
  };
  await apiDelete<ShoppingListMemberRemoveDtoOut>(
    "/shoppingList/member/remove",
    dtoIn
  );
}

/**
 * Leave shopping list
 */
export async function leaveShoppingList(shoppingListId: string): Promise<void> {
  const dtoIn: ShoppingListMemberLeaveDtoIn = {
    shoppingListId,
  };
  await apiPost<ShoppingListMemberLeaveDtoOut>(
    "/shoppingList/member/leave",
    dtoIn
  );
}
