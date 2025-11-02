"use client";

import Link from "next/link";
import { ShoppingList } from "@/app/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ShoppingListRowProps {
  list: ShoppingList;
  onDelete: (id: string) => void;
  currentUserId: string;
}

export default function ShoppingListRow({
  list,
  onDelete,
  currentUserId,
}: ShoppingListRowProps) {
  const isOwner = list.owner.id === currentUserId;
  
  const getLastUpdated = () => {
    const hours = Math.floor(Math.random() * 72);
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  };

  return (
    <Card className="w-full lg:w-[280px] hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold text-gray-900">{list.name}</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge
            variant={isOwner ? "default" : "secondary"}
            className={
              isOwner
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }
          >
            {isOwner ? "Owner" : "Member"}
          </Badge>
          <span className="text-sm text-gray-500">
            Last updated: {getLastUpdated()}
          </span>
        </div>
        <Button
          asChild
          variant="outline"
          className="w-full bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700"
        >
          <Link href={`/shopping-list/${list.id}`}>View List</Link>
        </Button>
      </CardContent>
    </Card>
  );
}