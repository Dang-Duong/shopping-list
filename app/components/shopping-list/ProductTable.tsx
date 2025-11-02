"use client";

import { Item } from "@/app/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ProductRow from "./ProductRow";
import AddProductForm from "./AddProductForm";

interface ProductTableProps {
  items: Item[];
  onRemoveItem: (itemId: string) => void;
  onToggleDone: (itemId: string) => void;
  showActiveOnly: boolean;
  onToggleShowActiveOnly: (show: boolean) => void;
  onAddItem: (item: { name: string; quantity?: number }) => void;
}

export default function ProductTable({
  items,
  onRemoveItem,
  onToggleDone,
  showActiveOnly,
  onToggleShowActiveOnly,
  onAddItem,
}: ProductTableProps) {
  const displayedItems = showActiveOnly
    ? items.filter((item) => !item.completed)
    : items;

  return (
    <Card className="shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Shopping Items
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <button
              onClick={() => onToggleShowActiveOnly(true)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                showActiveOnly
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => onToggleShowActiveOnly(false)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                !showActiveOnly
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayedItems.length > 0 ? (
            displayedItems.map((item) => (
              <ProductRow
                key={item.id}
                item={item}
                onRemove={onRemoveItem}
                onToggleDone={onToggleDone}
              />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              {showActiveOnly ? "No active items" : "No items in this list"}
            </div>
          )}
        </div>

        <div className="pt-4 mt-4 border-t border-gray-200">
          <AddProductForm onAddItem={onAddItem} />
        </div>
      </CardContent>
    </Card>
  );
}
