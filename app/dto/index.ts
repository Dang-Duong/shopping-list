/**
 * Data Transfer Objects (DTOs)
 *
 * Defines input (dtoIn) and output (dtoOut) types for all uuCmd endpoints.
 * Based on uuApp Framework patterns.
 */

// ============================================================================
// Shopping List DTOs
// ============================================================================

/**
 * shoppingList/list - Get all shopping lists
 */
export interface ShoppingListListDtoIn {
  archived?: boolean;
}

export interface ShoppingListListDtoOut {
  awid: string;
  items: ShoppingListDtoOut[];
}

/**
 * shoppingList/archive - Archive a shopping list
 */
export interface ShoppingListArchiveDtoIn {
  id: string;
}

export interface ShoppingListArchiveDtoOut {
  awid: string;
  id: string;
  name: string;
  state: string;
  ownerUuIdentity: string;
}

/**
 * shoppingList/create - Create a new shopping list
 */
export interface ShoppingListCreateDtoIn {
  name: string;
}

export interface ShoppingListCreateDtoOut {
  awid: string;
  id: string;
  name: string;
  state: string;
  ownerUuIdentity: string;
}

/**
 * shoppingList/delete - Delete a shopping list
 */
export interface ShoppingListDeleteDtoIn {
  id: string;
}

export interface ShoppingListDeleteDtoOut {
  awid: string;
  id: string;
}

/**
 * shoppingList/get - Get detail of a shopping list
 */
export interface ShoppingListGetDtoIn {
  id: string;
}

export interface ShoppingListGetDtoOut {
  awid: string;
  id: string;
  name: string;
  state: string;
  ownerUuIdentity: string;
  items: ItemDtoOut[];
  members: MemberDtoOut[];
}

/**
 * shoppingList/rename - Rename a shopping list
 */
export interface ShoppingListRenameDtoIn {
  id: string;
  name: string;
}

export interface ShoppingListRenameDtoOut {
  awid: string;
  id: string;
  name: string;
  state: string;
  ownerUuIdentity: string;
}

// ============================================================================
// Member DTOs
// ============================================================================

/**
 * shoppingList/member/add - Add member to shopping list
 */
export interface ShoppingListMemberAddDtoIn {
  shoppingListId: string;
  userId: string;
  role?: string;
}

export interface ShoppingListMemberAddDtoOut {
  awid: string;
  id: string;
  userId: string;
  shoppingListId: string;
  role: string;
}

/**
 * shoppingList/member/remove - Remove member from shopping list
 */
export interface ShoppingListMemberRemoveDtoIn {
  shoppingListId: string;
  userId: string;
}

export interface ShoppingListMemberRemoveDtoOut {
  awid: string;
  shoppingListId: string;
  userId: string;
}

/**
 * shoppingList/member/leave - Leave shopping list
 */
export interface ShoppingListMemberLeaveDtoIn {
  shoppingListId: string;
}

export interface ShoppingListMemberLeaveDtoOut {
  awid: string;
  shoppingListId: string;
  userId: string;
}

// ============================================================================
// Item DTOs
// ============================================================================

/**
 * shoppingList/item/list - Get items in a shopping list
 */
export interface ShoppingListItemListDtoIn {
  shoppingListId: string;
}

export interface ShoppingListItemListDtoOut {
  awid: string;
  shoppingListId: string;
  items: ItemDtoOut[];
}

/**
 * shoppingList/item/add - Add item to shopping list
 */
export interface ShoppingListItemAddDtoIn {
  shoppingListId: string;
  name: string;
  productId?: string;
  quantity?: number;
  fit?: string;
}

export interface ShoppingListItemAddDtoOut {
  awid: string;
  id: string;
  shoppingListId: string;
  name: string;
  productId?: string;
  quantity?: number;
  fit?: string;
  completed: boolean;
}

/**
 * shoppingList/item/remove - Remove item from shopping list
 */
export interface ShoppingListItemRemoveDtoIn {
  shoppingListId: string;
  itemId: string;
}

export interface ShoppingListItemRemoveDtoOut {
  awid: string;
  shoppingListId: string;
  itemId: string;
}

/**
 * shoppingList/item/complete - Mark item as completed
 */
export interface ShoppingListItemCompleteDtoIn {
  shoppingListId: string;
  itemId: string;
}

export interface ShoppingListItemCompleteDtoOut {
  awid: string;
  shoppingListId: string;
  itemId: string;
  completed: boolean;
}

/**
 * shoppingList/item/uncomplete - Mark item as uncompleted
 */
export interface ShoppingListItemUncompleteDtoIn {
  shoppingListId: string;
  itemId: string;
}

export interface ShoppingListItemUncompleteDtoOut {
  awid: string;
  shoppingListId: string;
  itemId: string;
  completed: boolean;
}

// ============================================================================
// Common DTOs
// ============================================================================

/**
 * Shopping List DTO (used in responses)
 */
export interface ShoppingListDtoOut {
  awid: string;
  id: string;
  name: string;
  state: string;
  ownerUuIdentity: string;
  archived?: boolean;
}

/**
 * Item DTO (used in responses)
 */
export interface ItemDtoOut {
  id: string;
  name: string;
  productId?: string;
  quantity?: number;
  fit?: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Member DTO (used in responses)
 */
export interface MemberDtoOut {
  id: string;
  userId: string;
  shoppingListId: string;
  role: string;
  joinedAt?: string;
}

/**
 * Error response structure (uuAppErrorMap pattern)
 */
export interface UuAppErrorMap {
  [key: string]: {
    code: string;
    message: string;
    paramMap?: Record<string, unknown>;
  };
}

/**
 * Standard API response with error information
 */
export interface UuAppResponse<T> {
  dtoOut: T;
  uuAppErrorMap?: UuAppErrorMap;
}
