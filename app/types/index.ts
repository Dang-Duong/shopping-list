/**
 * Type definitions matching database collection structures
 */

/**
 * Users Collection Structure
 */
export interface User {
  _id?: string; // ObjectId
  id: string;
  name: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * ShoppingLists Collection Structure
 */
export interface ShoppingList {
  _id?: string; // ObjectId
  id: string;
  name: string;
  ownerId: string;
  items: Item[];
  createdAt?: Date;
  updatedAt?: Date;
  archived?: boolean;
}

/**
 * Items within ShoppingLists Collection
 */
export interface Item {
  id: string;
  name: string;
  productId?: string;
  quantity?: number;
  fit?: string;
  completed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Members Collection Structure
 */
export interface Member {
  _id?: string; // ObjectId
  id: string;
  userId: string;
  shoppingListId: string;
  role: string;
  joinedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Products Collection Structure
 */
export interface Product {
  _id?: string; // ObjectId
  id: string;
  name: string;
  description?: string;
  category?: string;
  fit?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
