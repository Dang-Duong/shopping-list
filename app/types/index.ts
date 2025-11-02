export interface User {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  quantity?: number;
  completed: boolean;
}

export interface ShoppingList {
  id: string;
  name: string;
  owner: User;
  members: User[];
  items: Item[];
}
