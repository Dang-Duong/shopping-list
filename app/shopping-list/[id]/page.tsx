"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Item, User } from "@/app/types";
import {
  ClientShoppingList,
  shoppingListService,
  itemService,
  memberService,
  ApiError,
} from "@/app/services";
import MemberList from "@/app/components/shopping-list/MemberList";
import ProductTable from "@/app/components/shopping-list/ProductTable";
import { Button } from "@/components/ui/button";
import Sidebar from "@/app/components/layout/Sidebar";
import LoadingSpinner from "@/app/components/shopping-list/LoadingSpinner";
import ErrorDisplay from "@/app/components/shopping-list/ErrorDisplay";
import { ArrowLeft, Menu } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ShoppingListDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [shoppingList, setShoppingList] = useState<ClientShoppingList | null>(
    null
  );
  const [items, setItems] = useState<Item[]>([]);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = "user1";

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const resolvedParams = await params;
      const [listData, itemsData] = await Promise.all([
        shoppingListService.getShoppingListDetail(resolvedParams.id),
        itemService.getItems(resolvedParams.id),
      ]);
      setShoppingList(listData);
      setItems(itemsData);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to load shopping list";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params]);

  const handleRename = async (newName: string) => {
    if (!shoppingList) return;
    try {
      setError(null);
      const updated = await shoppingListService.renameShoppingList(
        shoppingList.id,
        newName
      );
      setShoppingList(updated);
      setIsEditingName(false);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Failed to rename shopping list";
      setError(message);
    }
  };

  const handleAddMemberByEmail = async (email: string) => {
    if (!shoppingList) return;
    try {
      setError(null);
      // In a real app, we'd need to resolve email to userId first
      // For now, we'll use a mock userId
      const userId = email.split("@")[0];
      await memberService.addMember(shoppingList.id, userId);
      // Reload to get updated members
      const updated = await shoppingListService.getShoppingListDetail(
        shoppingList.id
      );
      setShoppingList(updated);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to add member";
      setError(message);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!shoppingList) return;
    try {
      setError(null);
      await memberService.removeMember(shoppingList.id, userId);
      // Reload to get updated members
      const updated = await shoppingListService.getShoppingListDetail(
        shoppingList.id
      );
      setShoppingList(updated);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to remove member";
      setError(message);
    }
  };

  const handleLeaveList = async () => {
    if (!shoppingList) return;
    try {
      setError(null);
      await memberService.leaveShoppingList(shoppingList.id);
      router.push("/");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to leave shopping list";
      setError(message);
    }
  };

  const handleAddItem = async (itemData: {
    name: string;
    quantity?: number;
  }) => {
    if (!shoppingList) return;
    try {
      setError(null);
      const newItem = await itemService.addItem(shoppingList.id, itemData);
      setItems([...items, newItem]);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to add item";
      setError(message);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!shoppingList) return;
    try {
      setError(null);
      await itemService.removeItem(shoppingList.id, itemId);
      setItems(items.filter((item) => item.id !== itemId));
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to remove item";
      setError(message);
    }
  };

  const handleToggleDone = async (itemId: string) => {
    if (!shoppingList) return;
    try {
      setError(null);
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      if (item.completed) {
        await itemService.uncompleteItem(shoppingList.id, itemId);
      } else {
        await itemService.completeItem(shoppingList.id, itemId);
      }

      setItems(
        items.map((i) =>
          i.id === itemId ? { ...i, completed: !i.completed } : i
        )
      );
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to update item";
      setError(message);
    }
  };

  const handleArchive = async () => {
    if (!shoppingList) return;
    try {
      setError(null);
      await shoppingListService.archiveShoppingList(shoppingList.id);
      router.push("/archived");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Failed to archive shopping list";
      setError(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error && !shoppingList) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <ErrorDisplay message={error} onRetry={loadData} />
        </div>
      </div>
    );
  }

  if (!shoppingList) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Shopping list not found</p>
        </div>
      </div>
    );
  }

  const isOwner = shoppingList.owner.id === currentUserId;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 bg-gray-50 p-4 lg:p-8 w-full">
        <div className="lg:hidden flex items-center justify-between mb-4 relative">
          <Link
            href="/"
            className="text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700"
          >
            <ArrowLeft className="w-5 h-5" />
            My Lists
          </Link>
          <Menu className="w-6 h-6 text-gray-700" />
        </div>

        <div className="hidden lg:block mb-4">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lists
          </Link>
        </div>

        {error && (
          <div className="mb-4">
            <ErrorDisplay message={error} />
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {shoppingList.name}
          </h1>
          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                <Button
                  onClick={() => setIsEditingName(true)}
                  variant="outline"
                  size="sm"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                >
                  Edit
                </Button>
                {!shoppingList.archived && (
                  <Button
                    onClick={handleArchive}
                    variant="outline"
                    size="sm"
                    className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-300"
                  >
                    Archive
                  </Button>
                )}
              </>
            )}
            {isEditingName && (
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  defaultValue={shoppingList.name}
                  onBlur={(e) => {
                    if (
                      e.target.value.trim() &&
                      e.target.value !== shoppingList.name
                    ) {
                      handleRename(e.target.value.trim());
                    } else {
                      setIsEditingName(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const target = e.target as HTMLInputElement;
                      if (
                        target.value.trim() &&
                        target.value !== shoppingList.name
                      ) {
                        handleRename(target.value.trim());
                      } else {
                        setIsEditingName(false);
                      }
                    }
                    if (e.key === "Escape") {
                      setIsEditingName(false);
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
          <div>
            <MemberList
              members={shoppingList.members}
              owner={shoppingList.owner}
              currentUserId={currentUserId}
              isOwner={isOwner}
              onRemoveMember={handleRemoveMember}
              onLeaveList={handleLeaveList}
              onAddMember={handleAddMemberByEmail}
            />
          </div>

          <div>
            <ProductTable
              items={items}
              onRemoveItem={handleRemoveItem}
              onToggleDone={handleToggleDone}
              showActiveOnly={showActiveOnly}
              onToggleShowActiveOnly={setShowActiveOnly}
              onAddItem={handleAddItem}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
