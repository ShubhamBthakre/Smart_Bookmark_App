"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/Header";
import BookmarkList from "@/components/BookmarkList";

export default function BookmarksPage() {
  const [userEmail, setUserEmail] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setUserEmail(data.user.email);
      }
    });
  }, []);

  const handleBookmarkAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userEmail={userEmail} />

      <main className="max-w-5xl mx-auto px-4 py-10">
        <BookmarkList
          refreshTrigger={refreshTrigger}
          onDelete={handleBookmarkAdded}
        />
      </main>
    </div>
  );
}
