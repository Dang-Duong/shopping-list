/**
 * Mock Data in DTO format
 * This matches the structure returned by the API
 */

import {
  ShoppingListDtoOut,
  ShoppingListGetDtoOut,
  ItemDtoOut,
  MemberDtoOut,
} from "@/app/dto";

// Mock shopping lists (summary format)
export const MOCK_SHOPPING_LISTS: ShoppingListDtoOut[] = [
  {
    awid: "default-awid",
    id: "1",
    name: "Groceries",
    state: "active",
    ownerUuIdentity: "user1",
    archived: false,
  },
  {
    awid: "default-awid",
    id: "2",
    name: "Party Supplies",
    state: "active",
    ownerUuIdentity: "user2",
    archived: false,
  },
  {
    awid: "default-awid",
    id: "3",
    name: "Hardware Store",
    state: "active",
    ownerUuIdentity: "user1",
    archived: false,
  },
  {
    awid: "default-awid",
    id: "4",
    name: "Old Christmas List",
    state: "archived",
    ownerUuIdentity: "user1",
    archived: true,
  },
  {
    awid: "default-awid",
    id: "5",
    name: "Vacation Shopping",
    state: "archived",
    ownerUuIdentity: "user2",
    archived: true,
  },
];

// Mock items by shopping list ID
export const MOCK_ITEMS: Record<string, ItemDtoOut[]> = {
  "1": [
    {
      id: "item1",
      name: "Milk",
      completed: false,
    },
    {
      id: "item2",
      name: "Bread",
      completed: false,
    },
    {
      id: "item3",
      name: "Eggs",
      completed: true,
    },
    {
      id: "item4",
      name: "Apples",
      completed: false,
    },
    {
      id: "item5",
      name: "Chicken Breast",
      completed: false,
    },
  ],
  "2": [
    {
      id: "item6",
      name: "Balloons",
      completed: false,
    },
    {
      id: "item7",
      name: "Cake",
      completed: false,
    },
    {
      id: "item8",
      name: "Candles",
      completed: true,
    },
  ],
  "3": [
    {
      id: "item9",
      name: "Screws",
      completed: false,
    },
    {
      id: "item10",
      name: "Paint",
      completed: false,
    },
    {
      id: "item11",
      name: "Brushes",
      completed: false,
    },
  ],
  "4": [
    {
      id: "item12",
      name: "Gifts",
      completed: true,
    },
  ],
  "5": [
    {
      id: "item13",
      name: "Sunscreen",
      completed: true,
    },
  ],
};

// Mock members by shopping list ID
export const MOCK_MEMBERS: Record<string, MemberDtoOut[]> = {
  "1": [
    {
      id: "member1",
      userId: "user2",
      shoppingListId: "1",
      role: "Member",
    },
    {
      id: "member2",
      userId: "user3",
      shoppingListId: "1",
      role: "Member",
    },
  ],
  "2": [
    {
      id: "member3",
      userId: "user1",
      shoppingListId: "2",
      role: "Member",
    },
  ],
  "5": [
    {
      id: "member4",
      userId: "user1",
      shoppingListId: "5",
      role: "Member",
    },
  ],
};

// Helper to get full shopping list detail
export function getMockShoppingListDetail(
  id: string
): ShoppingListGetDtoOut | undefined {
  const list = MOCK_SHOPPING_LISTS.find((l) => l.id === id);
  if (!list) return undefined;

  return {
    ...list,
    items: MOCK_ITEMS[id] || [],
    members: MOCK_MEMBERS[id] || [],
  };
}
