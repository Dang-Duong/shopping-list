"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ListTodo, Archive, User, Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/contexts/AuthContext";

export default function Sidebar({ onCreateList }: { onCreateList?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const userName = user?.name || "Guest";
  const userEmail = user?.email || "";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isShoppingListsActive = pathname === "/";
  const isArchivedActive = pathname === "/archived";

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden absolute top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-md"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          "w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col fixed lg:static z-40 transform transition-transform duration-300",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2"
          aria-label="Close menu"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>

        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{userName}</p>
              <p className="text-sm text-gray-600">{userEmail}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors",
              isShoppingListsActive
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <ListTodo className="w-5 h-5" />
            <span className="font-medium">Shopping Lists</span>
          </Link>
          <Link
            href="/archived"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              isArchivedActive
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <Archive className="w-5 h-5" />
            <span className="font-medium">Archived Lists</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          {onCreateList && (
            <Button
              onClick={() => {
                onCreateList();
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New List
            </Button>
          )}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
}