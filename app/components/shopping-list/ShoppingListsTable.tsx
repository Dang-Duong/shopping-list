"use client";

import { ShoppingList } from "@/app/types";
import ShoppingListRow from "./ShoppingListRow";

interface ShoppingListsTableProps {
  lists: ShoppingList[];
  onSelectList: (id: string) => void;
  onDelete: (id: string) => void;
  currentUserId: string;
}

export default function ShoppingListsTable({
  lists,
  onSelectList,
  onDelete,
  currentUserId,
}: ShoppingListsTableProps) {
  if (lists.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center">
        <p className="text-gray-600">No shopping lists yet</p>
        <p className="text-sm text-gray-500 mt-2">
          Create your first shopping list to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row lg:flex-wrap gap-4">
      {lists.map((list) => (
        <ShoppingListRow
          key={list.id}
          list={list}
          onDelete={onDelete}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}