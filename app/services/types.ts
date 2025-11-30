/**
 * Service Types
 * Types for the service layer that transform between DTOs and client types
 */

import { User, Item } from "@/app/types";
import {
  ShoppingListDtoOut,
  ShoppingListGetDtoOut,
  ItemDtoOut,
  MemberDtoOut,
} from "@/app/dto";

/**
 * Client-side ShoppingList type (with owner and members as User objects)
 */
export interface ClientShoppingList {
  id: string;
  name: string;
  owner: User;
  members: User[];
  items: Item[];
  archived: boolean;
}

/**
 * Transform ShoppingListDtoOut to ClientShoppingList
 */
export function transformShoppingListDto(
  dto: ShoppingListDtoOut,
  owner: User,
  members: User[] = []
): ClientShoppingList {
  return {
    id: dto.id,
    name: dto.name,
    owner,
    members,
    items: [],
    archived: dto.archived || dto.state === "archived",
  };
}

/**
 * Transform ShoppingListGetDtoOut to ClientShoppingList
 */
export function transformShoppingListDetailDto(
  dto: ShoppingListGetDtoOut,
  owner: User,
  members: User[]
): ClientShoppingList {
  return {
    id: dto.id,
    name: dto.name,
    owner,
    members,
    items: dto.items.map(transformItemDto),
    archived: dto.state === "archived",
  };
}

/**
 * Transform ItemDtoOut to Item
 */
export function transformItemDto(dto: ItemDtoOut): Item {
  return {
    id: dto.id,
    name: dto.name,
    productId: dto.productId,
    quantity: dto.quantity,
    fit: dto.fit,
    completed: dto.completed,
    createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
    updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
  };
}

