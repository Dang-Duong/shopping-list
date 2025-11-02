"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface AddProductFormProps {
  onAddItem: (item: { name: string; quantity?: number }) => void;
}

export default function AddProductForm({ onAddItem }: AddProductFormProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddItem({
        name: name.trim(),
      });
      setName("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <Input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Add a new item..."
        className="flex-1"
        required
      />
      <Button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white h-10 w-10 p-0 shrink-0"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </form>
  );
}
