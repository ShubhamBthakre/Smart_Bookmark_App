import { supabase } from "@/lib/supabaseClient";
import type { Bookmark } from "@/types/database.types";

export const bookmarkService = {
  /**
   * Fetches bookmarks with pagination and search filtering.
   */
  async getBookmarks(page: number, itemsPerPage: number, query: string = "") {
    const offset = (page - 1) * itemsPerPage;

    let supabaseQuery = supabase
      .from("bookmarks")
      .select("*", { count: "exact" });

    if (query.trim()) {
      supabaseQuery = supabaseQuery.or(
        `title.ilike.%${query}%,url.ilike.%${query}%`
      );
    }

    const { data, count, error } = await supabaseQuery
      .order("created_at", { ascending: false })
      .range(offset, offset + itemsPerPage - 1);

    if (error) throw error;

    return {
      data: (data as Bookmark[]) || [],
      count: count || 0,
    };
  },

  /**
   * Adds a new bookmark.
   */
  async addBookmark(url: string, title: string, userId: string) {
    const { data, error } = await supabase.from("bookmarks").insert({
      url: url.trim(),
      title: title.trim(),
      user_id: userId,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Updates an existing bookmark.
   */
  async updateBookmark(id: string, url: string, title: string) {
    const { data, error } = await supabase
      .from("bookmarks")
      .update({
        url: url.trim(),
        title: title.trim(),
      })
      .eq("id", id);

    if (error) throw error;
    return data;
  },

  /**
   * Deletes a bookmark by ID.
   */
  async deleteBookmark(id: string) {
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);

    if (error) throw error;
  },
};
