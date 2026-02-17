"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface BookmarkFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingId?: string | null;
  editingData?: { url: string; title: string } | null;
}

export default function BookmarkForm({
  isOpen,
  onClose,
  onSuccess,
  editingId,
  editingData,
}: BookmarkFormProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize form with editing data
  useEffect(() => {
    if (editingData) {
      setUrl(editingData.url);
      setTitle(editingData.title);
    } else {
      setUrl("");
      setTitle("");
    }
    setError("");
  }, [editingData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url.trim() || !title.trim()) {
      setError("Both URL and title are required");
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to add bookmarks.");
        setLoading(false);
        return;
      }

      if (editingId) {
        // Update existing bookmark
        const { error } = await supabase
          .from("bookmarks")
          .update({
            url: url.trim(),
            title: title.trim(),
          })
          .eq("id", editingId);

        if (error) throw error;
      } else {
        // Create new bookmark
        const { error } = await supabase.from("bookmarks").insert({
          url: url.trim(),
          title: title.trim(),
          user_id: user.id,
        });

        if (error) throw error;
      }

      setUrl("");
      setTitle("");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Error saving bookmark:", err);

      if (err instanceof Error) {
        if (err.message.includes("row-level security")) {
          setError(
            "You must be logged in to add bookmarks. Please log in again.",
          );
        } else if (err.message.includes("Invalid URL")) {
          setError("Please enter a valid URL.");
        } else {
          setError(err.message || "Failed to save bookmark. Please try again.");
        }
      } else {
        setError("Failed to save bookmark. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-2xl max-w-md w-full p-6 fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {editingId ? "Edit Bookmark" : "Add New Bookmark"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-red-700 text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="url"
              className="block text-gray-700 font-medium mb-2 text-sm"
            >
              URL
            </label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={loading}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="title"
              className="block text-gray-700 font-medium mb-2 text-sm"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Favorite Website"
              disabled={loading}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:shadow-md hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : editingId ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
