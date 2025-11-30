/**
 * Mock Service
 * Implements all service functions using mock data
 * Simulates async operations with delays
 */

import { ClientShoppingList } from "@/app/services/types";
import { Item } from "@/app/types";
import {
  MOCK_SHOPPING_LISTS,
  MOCK_ITEMS,
  MOCK_MEMBERS,
  getMockShoppingListDetail,
} from "./mockData";
import { getUserByIdOrFallback } from "./mockUsers";
import { transformShoppingListDto, transformShoppingListDetailDto, transformItemDto } from "@/app/services/types";

/**
 * Simulate network delay
 */
function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Shopping List Mock Services
 */
export const mockShoppingListService = {
  async getShoppingLists(archived: boolean = false): Promise<ClientShoppingList[]> {
    await delay();
    const lists = MOCK_SHOPPING_LISTS.filter((list) => list.archived === archived);
    return lists.map((dto) => {
      const owner = getUserByIdOrFallback(dto.ownerUuIdentity);
      const members = (MOCK_MEMBERS[dto.id] || []).map((m) =>
        getUserByIdOrFallback(m.userId)
      );
      const list = transformShoppingListDto(dto, owner, members);
      list.items = (MOCK_ITEMS[dto.id] || []).map(transformItemDto);
      return list;
    });
  },

  async getShoppingListDetail(id: string): Promise<ClientShoppingList> {
    await delay();
    const dto = getMockShoppingListDetail(id);
    if (!dto) {
      throw new Error(`Shopping list with id ${id} not found`);
    }
    const owner = getUserByIdOrFallback(dto.ownerUuIdentity);
    const members = dto.members.map((m) => getUserByIdOrFallback(m.userId));
    return transformShoppingListDetailDto(dto, owner, members);
  },

  async createShoppingList(name: string): Promise<ClientShoppingList> {
    await delay();
    const newId = `list_${Date.now()}`;
    const newList: ClientShoppingList = {
      id: newId,
      name,
      owner: getUserByIdOrFallback("user1"),
      members: [],
      items: [],
      archived: false,
    };
    // In a real mock, we'd add this to the mock data store
    return newList;
  },

  async deleteShoppingList(id: string): Promise<void> {
    await delay();
    // In a real mock, we'd remove from the mock data store
  },

  async renameShoppingList(id: string, name: string): Promise<ClientShoppingList> {
    await delay();
    const dto = getMockShoppingListDetail(id);
    if (!dto) {
      throw new Error(`Shopping list with id ${id} not found`);
    }
    const owner = getUserByIdOrFallback(dto.ownerUuIdentity);
    const members = dto.members.map((m) => getUserByIdOrFallback(m.userId));
    const list = transformShoppingListDetailDto(dto, owner, members);
    list.name = name;
    return list;
  },

  async archiveShoppingList(id: string): Promise<ClientShoppingList> {
    await delay();
    const dto = getMockShoppingListDetail(id);
    if (!dto) {
      throw new Error(`Shopping list with id ${id} not found`);
    }
    const owner = getUserByIdOrFallback(dto.ownerUuIdentity);
    const members = dto.members.map((m) => getUserByIdOrFallback(m.userId));
    const list = transformShoppingListDetailDto(dto, owner, members);
    list.archived = true;
    return list;
  },
};

/**
 * Item Mock Services
 */
export const mockItemService = {
  async getItems(shoppingListId: string): Promise<Item[]> {
    await delay();
    return (MOCK_ITEMS[shoppingListId] || []).map(transformItemDto);
  },

  async addItem(
    shoppingListId: string,
    itemData: {
      name: string;
      productId?: string;
      quantity?: number;
      fit?: string;
    }
  ): Promise<Item> {
    await delay();
    const newItem: Item = {
      id: `item_${Date.now()}`,
      name: itemData.name,
      productId: itemData.productId,
      quantity: itemData.quantity,
      fit: itemData.fit,
      completed: false,
    };
    // In a real mock, we'd add this to MOCK_ITEMS
    return newItem;
  },

  async removeItem(shoppingListId: string, itemId: string): Promise<void> {
    await delay();
    // In a real mock, we'd remove from MOCK_ITEMS
  },

  async completeItem(shoppingListId: string, itemId: string): Promise<Item> {
    await delay();
    const items = MOCK_ITEMS[shoppingListId] || [];
    const item = items.find((i) => i.id === itemId);
    if (!item) {
      throw new Error(`Item with id ${itemId} not found`);
    }
    return transformItemDto({ ...item, completed: true });
  },

  async uncompleteItem(shoppingListId: string, itemId: string): Promise<Item> {
    await delay();
    const items = MOCK_ITEMS[shoppingListId] || [];
    const item = items.find((i) => i.id === itemId);
    if (!item) {
      throw new Error(`Item with id ${itemId} not found`);
    }
    return transformItemDto({ ...item, completed: false });
  },
};

/**
 * Member Mock Services
 */
export const mockMemberService = {
  async addMember(shoppingListId: string, userId: string, role?: string): Promise<void> {
    await delay();
    // In a real mock, we'd add to MOCK_MEMBERS
  },

  async removeMember(shoppingListId: string, userId: string): Promise<void> {
    await delay();
    // In a real mock, we'd remove from MOCK_MEMBERS
  },

  async leaveShoppingList(shoppingListId: string): Promise<void> {
    await delay();
    // In a real mock, we'd remove from MOCK_MEMBERS
  },
};

