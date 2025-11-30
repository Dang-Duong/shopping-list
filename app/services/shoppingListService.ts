/**
 * Shopping List Service
 * Handles all shopping list related API calls
 */

import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from "./apiClient";
import {
  ShoppingListListDtoOut,
  ShoppingListGetDtoOut,
  ShoppingListCreateDtoOut,
  ShoppingListDeleteDtoOut,
  ShoppingListRenameDtoOut,
  ShoppingListArchiveDtoOut,
  ShoppingListCreateDtoIn,
  ShoppingListDeleteDtoIn,
  ShoppingListRenameDtoIn,
  ShoppingListArchiveDtoIn,
} from "@/app/dto";
import { ClientShoppingList, transformShoppingListDto, transformShoppingListDetailDto } from "./types";
import { getUserByIdOrFallback } from "@/app/mock/mockUsers";
import { MemberDtoOut } from "@/app/dto";

/**
 * Get all shopping lists
 */
export async function getShoppingLists(archived: boolean = false): Promise<ClientShoppingList[]> {
  const response = await apiGet<ShoppingListListDtoOut>("/shoppingList/list", {
    archived: archived.toString(),
  });

  return response.items.map((dto) => {
    const owner = getUserByIdOrFallback(dto.ownerUuIdentity);
    return transformShoppingListDto(dto, owner);
  });
}

/**
 * Get shopping list detail
 */
export async function getShoppingListDetail(id: string): Promise<ClientShoppingList> {
  const response = await apiGet<ShoppingListGetDtoOut>("/shoppingList/get", {
    id,
  });

  const owner = getUserByIdOrFallback(response.ownerUuIdentity);
  const members = response.members.map((memberDto: MemberDtoOut) =>
    getUserByIdOrFallback(memberDto.userId)
  );

  return transformShoppingListDetailDto(response, owner, members);
}

/**
 * Create a new shopping list
 */
export async function createShoppingList(name: string): Promise<ClientShoppingList> {
  const dtoIn: ShoppingListCreateDtoIn = { name };
  const response = await apiPost<ShoppingListCreateDtoOut>(
    "/shoppingList/create",
    dtoIn
  );

  const owner = getUserByIdOrFallback(response.ownerUuIdentity);
  return transformShoppingListDto(response, owner);
}

/**
 * Delete a shopping list
 */
export async function deleteShoppingList(id: string): Promise<void> {
  const dtoIn: ShoppingListDeleteDtoIn = { id };
  await apiDelete<ShoppingListDeleteDtoOut>("/shoppingList/delete", dtoIn);
}

/**
 * Rename a shopping list
 */
export async function renameShoppingList(id: string, name: string): Promise<ClientShoppingList> {
  const dtoIn: ShoppingListRenameDtoIn = { id, name };
  const response = await apiPut<ShoppingListRenameDtoOut>(
    "/shoppingList/rename",
    dtoIn
  );

  const owner = getUserByIdOrFallback(response.ownerUuIdentity);
  return transformShoppingListDto(response, owner);
}

/**
 * Archive a shopping list
 */
export async function archiveShoppingList(id: string): Promise<ClientShoppingList> {
  const dtoIn: ShoppingListArchiveDtoIn = { id };
  const response = await apiPut<ShoppingListArchiveDtoOut>(
    "/shoppingList/archive",
    dtoIn
  );

  const owner = getUserByIdOrFallback(response.ownerUuIdentity);
  return transformShoppingListDto(response, owner);
}

