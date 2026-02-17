"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Header({ userEmail }: { userEmail?: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">📚</span>
          </div>
          <span className="font-semibold text-gray-900">Smart Bookmarks</span>
        </div>

        {userEmail && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              {userEmail}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
