"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClientShoppingList, shoppingListService, ApiError } from "@/app/services";
import ShoppingListsTable from "@/app/components/shopping-list/ShoppingListsTable";
import Sidebar from "@/app/components/layout/Sidebar";
import LoadingSpinner from "@/app/components/shopping-list/LoadingSpinner";
import ErrorDisplay from "@/app/components/shopping-list/ErrorDisplay";

type ShoppingList = ClientShoppingList;

export default function ArchivedShoppingListsPage() {
  const router = useRouter();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = "user1";

  const loadLists = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await shoppingListService.getShoppingLists(true);
      setLists(data);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Failed to load archived shopping lists";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  const filteredLists = useMemo(
    () => lists.filter((list) => list.archived),
    [lists]
  );

  const handleDeleteList = async (id: string) => {
    try {
      setError(null);
      await shoppingListService.deleteShoppingList(id);
      setLists(lists.filter((list) => list.id !== id));
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Failed to delete shopping list";
      setError(message);
    }
  };

  const handleSelectList = (id: string) => {
    router.push(`/shopping-list/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 bg-white lg:bg-white lg:ml-0 p-4 lg:p-8 w-full lg:w-auto">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 bg-white lg:bg-white lg:ml-0 p-4 lg:p-8 w-full lg:w-auto">
          <ErrorDisplay message={error} onRetry={loadLists} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 bg-white lg:bg-white lg:ml-0 p-4 lg:p-8 w-full lg:w-auto">
        <div className="lg:hidden flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Archived Lists</h1>
        </div>

        <div className="hidden lg:block mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Archived Shopping Lists
          </h1>
          <p className="text-gray-600">
            Here are your archived shopping lists.
          </p>
        </div>

        <div className="lg:hidden mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Archived Lists
          </h2>
          <p className="text-sm text-gray-600">
            Here are your archived shopping lists.
          </p>
        </div>

        <ShoppingListsTable
          lists={filteredLists}
          onSelectList={handleSelectList}
          onDelete={handleDeleteList}
          currentUserId={currentUserId}
        />
      </main>
    </div>
  );
}

