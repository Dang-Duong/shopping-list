"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ClientShoppingList,
  shoppingListService,
  ApiError,
} from "@/app/services";
import { useAuth } from "@/app/contexts/AuthContext";
import ShoppingListsTable from "@/app/components/shopping-list/ShoppingListsTable";
import CreateListModal from "@/app/components/shopping-list/CreateListModal";
import Sidebar from "@/app/components/layout/Sidebar";
import LoadingSpinner from "@/app/components/shopping-list/LoadingSpinner";
import ErrorDisplay from "@/app/components/shopping-list/ErrorDisplay";

type ShoppingList = ClientShoppingList;

export default function ShoppingListsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const currentUserId = user?.id || "";

  const loadLists = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await shoppingListService.getShoppingLists(false);
      setLists(data);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to load shopping lists";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  const filteredLists = useMemo(
    () => (user ? lists.filter((list) => !list.archived) : []),
    [lists, user]
  );

  const handleCreateList = async (name: string) => {
    try {
      setError(null);
      const newList = await shoppingListService.createShoppingList(name);
      setLists([...lists, newList]);
      router.push(`/shopping-list/${newList.id}`);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Failed to create shopping list";
      setError(message);
    }
  };

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

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar onCreateList={() => setIsCreateModalOpen(true)} />
        <main className="flex-1 bg-white lg:bg-white lg:ml-0 p-4 lg:p-8 w-full lg:w-auto">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar onCreateList={() => setIsCreateModalOpen(true)} />
        <main className="flex-1 bg-white lg:bg-white lg:ml-0 p-4 lg:p-8 w-full lg:w-auto">
          <ErrorDisplay message={error} onRetry={loadLists} />
        </main>
      </div>
    );
  }

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
