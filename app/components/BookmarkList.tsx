"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { bookmarkService } from "@/api_services/bookmarkService";
import BookmarkForm from "./BookmarkForm";
import type { Bookmark } from "@/types/database.types";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/hooks/useAuth";
import Button from "./form-fields/Button";
import Input from "./form-fields/Input";
import ConfirmModal from "./form-fields/ConfirmModal";

interface BookmarkListProps {
  refreshTrigger?: number;
  onDelete?: () => void;
}

const ITEMS_PER_PAGE = 10;

export default function BookmarkList({
  refreshTrigger = 0,
  onDelete,
}: BookmarkListProps) {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookmarkToDelete, setBookmarkToDelete] = useState<string | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch bookmarks with pagination and search from backend
  const fetchBookmarks = async (page: number, query: string = "") => {
    setLoading(true);
    try {
      const { data, count } = await bookmarkService.getBookmarks(page, ITEMS_PER_PAGE, query);
      setBookmarks(data);
      setTotalCount(count);
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bookmarks when page, debounced search query, or refresh trigger changes
  useEffect(() => {
    fetchBookmarks(currentPage, debouncedSearchQuery);
  }, [currentPage, debouncedSearchQuery, refreshTrigger]);

  // Setup real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`bookmarks-realtime-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (
            payload.eventType === "INSERT" ||
            payload.eventType === "DELETE" ||
            payload.eventType === "UPDATE"
          ) {
            // Refetch current page and debounced query to reflect changes
            fetchBookmarks(currentPage, debouncedSearchQuery);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentPage, debouncedSearchQuery, user?.id]);

  const handleEdit = (bookmark: Bookmark) => {
    setEditingId(bookmark.id);
    setEditingData({ url: bookmark.url, title: bookmark.title });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setBookmarkToDelete(id);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!bookmarkToDelete) return;

    setDeletingId(bookmarkToDelete);
    try {
      await bookmarkService.deleteBookmark(bookmarkToDelete);
      onDelete?.();
      setDeleteModalOpen(false);
      setBookmarkToDelete(null);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete bookmark");
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = () => {
    setEditingId(null);
    setEditingData(null);
    setIsFormOpen(false);
  };

  const handleFormClose = () => {
    setEditingId(null);
    setEditingData(null);
    setIsFormOpen(false);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold">Your Bookmarks ({totalCount})</h2>

        <div className="flex gap-3 flex-col sm:flex-row sm:items-center">
          {/* Search Input */}
          <Input
            type="text"
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on new search
            }}
            className="sm:w-64"
            leftIcon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
          />

          {/* Add Button */}
          <Button
            onClick={() => {
              setEditingId(null);
              setEditingData(null);
              setIsFormOpen(true);
            }}
            className="whitespace-nowrap"
          >
            + Add
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="professional-card p-12 text-center">
          <p className="text-gray-600">Loading bookmarks...</p>
        </div>
      ) : bookmarks.length > 0 ? (
        <div className="overflow-x-auto professional-card rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Added
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookmarks.map((bookmark) => (
                <tr
                  key={bookmark.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                    {bookmark.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-blue-600">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline truncate max-w-xs block"
                    >
                      {getDomain(bookmark.url)}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(bookmark.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(bookmark)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        aria-label="Edit bookmark"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(bookmark.id)}
                        isLoading={deletingId === bookmark.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        aria-label="Delete bookmark"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="professional-card p-12 text-center">
          <p className="text-gray-600">No Bookmarks found</p>
        </div>
      )}




      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  disabled={loading}
                  className={`px-3 py-2 rounded-lg transition-colors ${currentPage === page
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                    }`}
                >
                  {page}
                </button>
              ),
            )}
          </div>

          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
            disabled={currentPage === totalPages || loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal Form */}
      <BookmarkForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        editingId={editingId}
        editingData={editingData}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={executeDelete}
        title="Delete Bookmark"
        message="Are you sure you want to delete this bookmark? This action cannot be undone."
        confirmLabel="Delete"
        isLoading={deletingId !== null}
      />
    </div>
  );
}
