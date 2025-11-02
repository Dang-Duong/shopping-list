"use client";

import { Item } from "@/app/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";

interface ProductRowProps {
  item: Item;
  onRemove: (itemId: string) => void;
  onToggleDone: (itemId: string) => void;
}

export default function ProductRow({
  item,
  onRemove,
  onToggleDone,
}: ProductRowProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <Checkbox
          checked={item.completed}
          onCheckedChange={() => onToggleDone(item.id)}
          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
        <span
          className={
            item.completed
              ? "text-gray-400 line-through flex-1"
              : "text-gray-900 flex-1 font-medium"
          }
        >
          {item.name}
        </span>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="text-gray-400 hover:text-red-600 transition-colors p-1"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}