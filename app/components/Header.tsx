"use client";

import { useAuth } from "@/hooks/useAuth";
import Button from "./form-fields/Button";

export default function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">📚</span>
          </div>
          <span className="font-semibold text-gray-900">Smart Bookmarks</span>
        </div>

        {user?.email && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              {user.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
