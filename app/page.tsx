"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingList } from "@/app/types";
import ShoppingListsTable from "@/app/components/shopping-list/ShoppingListsTable";
import CreateListModal from "@/app/components/shopping-list/CreateListModal";
import Sidebar from "@/app/components/layout/Sidebar";

const INITIAL_MOCK_LISTS: ShoppingList[] = [
  {
    id: "1",
    name: "Groceries",
    owner: { id: "user1", name: "John Doe" },
    members: [{ id: "user2", name: "Jane Smith" }],
    items: [
      { id: "item1", name: "Milk", completed: false },
      { id: "item2", name: "Bread", completed: false },
      { id: "item3", name: "Eggs", completed: true },
    ],
  },
  {
    id: "2",
    name: "Party Supplies",
    owner: { id: "user2", name: "Jane Smith" },
    members: [{ id: "user1", name: "John Doe" }],
    items: [
      { id: "item4", name: "Balloons", completed: false },
      { id: "item5", name: "Cake", completed: false },
    ],
  },
  {
    id: "3",
    name: "Hardware Store",
    owner: { id: "user1", name: "John Doe" },
    members: [],
    items: [
      { id: "item6", name: "Screws", completed: false },
      { id: "item7", name: "Paint", completed: false },
    ],
  },
];

export default function ShoppingListsPage() {
  const router = useRouter();
  const [lists, setLists] = useState<ShoppingList[]>(() => [
    ...INITIAL_MOCK_LISTS,
  ]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const currentUserId = "user1";

  const filteredLists = useMemo(() => lists, [lists]);

  const handleCreateList = (name: string) => {
    const newList: ShoppingList = {
      id: `list_${Date.now()}`,
      name,
      owner: { id: currentUserId, name: "John Doe" },
      members: [],
      items: [],
    };
    setLists([...lists, newList]);
    router.push(`/shopping-list/${newList.id}`);
  };

  const handleDeleteList = (id: string) => {
    if (!confirm("Are you sure you want to delete this list?")) {
      return;
    }
    setLists(lists.filter((list) => list.id !== id));
  };

  const handleSelectList = (id: string) => {
    router.push(`/shopping-list/${id}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onCreateList={() => setIsCreateModalOpen(true)} />
      <main className="flex-1 bg-white lg:bg-white lg:ml-0 p-4 lg:p-8 w-full lg:w-auto">
        <div className="lg:hidden flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Shopping Lists</h1>
        </div>

        <div className="hidden lg:block mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Shopping Lists
          </h1>
          <p className="text-gray-600">Here are your active shopping lists.</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="lg:hidden w-full mb-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span>
          Create New List
        </button>

        <div className="lg:hidden mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Active Lists
          </h2>
          <p className="text-sm text-gray-600">
            Here are your currently active shopping lists.
          </p>
        </div>

        <ShoppingListsTable
          lists={filteredLists}
          onSelectList={handleSelectList}
          onDelete={handleDeleteList}
          currentUserId={currentUserId}
        />

        <CreateListModal
          isOpen={isCreateModalOpen}
          onSubmit={handleCreateList}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </main>
    </div>
  );
}
