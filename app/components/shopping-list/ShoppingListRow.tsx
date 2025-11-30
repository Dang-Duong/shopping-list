"use client";

import { useState } from "react";
import Link from "next/link";
import { ClientShoppingList } from "@/app/services/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

interface ShoppingListRowProps {
  list: ClientShoppingList;
  onDelete: (id: string) => void;
  currentUserId: string;
}

export default function ShoppingListRow({
  list,
  onDelete,
  currentUserId,
}: ShoppingListRowProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isOwner = list.owner.id === currentUserId;

  const handleDeleteConfirm = () => {
    onDelete(list.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Card className="w-full lg:w-[280px] hover:shadow-md transition-shadow border-gray-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{list.name}</h3>
            {isOwner && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                aria-label="Delete list"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
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
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        listName={list.name}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </>
  );
}
