"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingList, Item, User } from "@/app/types";
import MemberList from "@/app/components/shopping-list/MemberList";
import ProductTable from "@/app/components/shopping-list/ProductTable";
import { Button } from "@/components/ui/button";
import Sidebar from "@/app/components/layout/Sidebar";
import { ArrowLeft, Menu } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

const MOCK_LISTS_DATA: Record<string, ShoppingList> = {
  "1": {
    id: "1",
    name: "Groceries for the Week",
    owner: { id: "user1", name: "John Doe" },
    members: [
      { id: "user2", name: "Jane Smith" },
      { id: "user3", name: "Peter Jones" },
    ],
    items: [
      { id: "item1", name: "Milk", completed: false },
      { id: "item2", name: "Bread", completed: false },
      { id: "item3", name: "Eggs", completed: true },
      { id: "item4", name: "Apples", completed: false },
      { id: "item5", name: "Chicken Breast", completed: false },
    ],
  },
  "2": {
    id: "2",
    name: "Party Supplies",
    owner: { id: "user2", name: "Jane Smith" },
    members: [{ id: "user1", name: "John Doe" }],
    items: [
      { id: "item4", name: "Balloons", completed: false },
      { id: "item5", name: "Cake", completed: false },
      { id: "item6", name: "Candles", completed: true },
    ],
  },
  "3": {
    id: "3",
    name: "Hardware Store",
    owner: { id: "user1", name: "John Doe" },
    members: [],
    items: [
      { id: "item7", name: "Screws", completed: false },
      { id: "item8", name: "Paint", completed: false },
      { id: "item9", name: "Brushes", completed: false },
    ],
  },
};

const DEFAULT_MOCK_DATA: ShoppingList = {
  id: "1",
  name: "Groceries for the Week",
  owner: { id: "user1", name: "John Doe" },
  members: [
    { id: "user2", name: "Jane Smith" },
    { id: "user3", name: "Peter Jones" },
  ],
  items: [
    { id: "item1", name: "Milk", completed: false },
    { id: "item2", name: "Bread", completed: false },
    { id: "item3", name: "Eggs", completed: true },
    { id: "item4", name: "Apples", completed: false },
    { id: "item5", name: "Chicken Breast", completed: false },
  ],
};

export default function ShoppingListDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const currentUserId = "user1";

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      const listData = MOCK_LISTS_DATA[resolvedParams.id] || {
        ...DEFAULT_MOCK_DATA,
        id: resolvedParams.id,
      };
      setShoppingList(listData);
      setItems([...listData.items]);
    }
    loadParams();
  }, [params]);

  const handleRename = (newName: string) => {
    if (!shoppingList) return;
    setShoppingList({ ...shoppingList, name: newName });
    setIsEditingName(false);
  };

  const handleAddMemberByEmail = (email: string) => {
    if (!shoppingList) return;
    const newMember: User = {
      id: `user_${Date.now()}`,
      name: email.split("@")[0],
    };
    setShoppingList({
      ...shoppingList,
      members: [...shoppingList.members, newMember],
    });
  };

  const handleRemoveMember = (userId: string) => {
    if (!shoppingList) return;
    setShoppingList({
      ...shoppingList,
      members: shoppingList.members.filter((m) => m.id !== userId),
    });
  };

  const handleLeaveList = () => {
    router.push("/");
  };

  const handleAddItem = (itemData: { name: string; quantity?: number }) => {
    const newItem: Item = {
      id: `item_${Date.now()}`,
      name: itemData.name,
      quantity: itemData.quantity,
      completed: false,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  const handleToggleDone = (itemId: string) => {
    setItems(
      items.map((i) =>
        i.id === itemId ? { ...i, completed: !i.completed } : i
      )
    );
  };

  if (!shoppingList) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
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

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {shoppingList.name}
          </h1>
          <div className="flex items-center gap-2">
            {isOwner && (
              <Button
                onClick={() => setIsEditingName(true)}
                variant="outline"
                size="sm"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
              >
                Edit
              </Button>
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
