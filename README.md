# Smart Bookmark App 📚

A professional, real-time bookmark manager built with **Next.js 16**, **Supabase**, and **Tailwind CSS v4**. This app features secure Google OAuth authentication, optimized searching with debouncing, and a robust real-time synchronization system.

## 🎯 Features

- ✅ **Google OAuth Authentication** - Secure, one-tap login (no passwords needed).
- ✅ **Optimized Search** - Debounced search logic to reduce API load.
- ✅ **Real-time Synchronization** - Instant updates across browser tabs using Supabase Realtime.
- ✅ **Private & Secure** - Row Level Security (RLS) ensures users only access their own data.
- ✅ **Design System** - Reusable UI components (Button, Input) for a consistent, premium look.
- ✅ **Modular Architecture** - Clean separation of concerns with dedicated API services and custom hooks.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **State Management**: React Hooks (Custom Auth & Search hooks)

## 📋 Requirements Met

1. ✅ **Google OAuth**: Only Google sign-in is supported.
2. ✅ **Bookmark Management**: Logged-in users can add, view, and delete bookmarks.
3. ✅ **Data Privacy**: Bookmarks are strictly private per user.
4. ✅ **Real-time Sync**: List updates across tabs without page refresh.
5. ✅ **Clean UI**: Professional, minimalist design with responsive layouts.
6. ✅ **Deployment**: Fully ready for Vercel deployment.

## 📁 Project Structure

```bash
smart-bookmark-app/
├── app/
│   ├── api_services/        # Centralized Supabase API logic (Auth, Bookmarks)
│   ├── bookmarks/           # Private dashboard page
│   ├── components/
│   │   ├── form-fields/     # Reusable UI components (Button, Input)
│   │   ├── BookmarkForm.tsx # Modal form for Add/Edit
│   │   ├── BookmarkList.tsx # Main list with Realtime logic
│   │   └── Header.tsx       # Unified navigation & user info
│   ├── hooks/               # Custom hooks (useAuth, useDebounce)
│   ├── lib/                 # Supabase client config
│   ├── login/               # Dedicated login page
│   ├── types/               # TypeScript definitions
│   └── page.tsx             # Landing hero page
├── public/                  # Static assets
├── README.md                # Documentation
└── package.json
```

## 🚀 Getting Started

### 1. Supabase Database Setup

Run the following SQL in your Supabase SQL Editor to create the table and enable security:

```sql
-- Create bookmarks table
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Policies: Only allowing users to access their own data
CREATE POLICY "Users can view own bookmarks" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookmarks" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookmarks" ON bookmarks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```

### 2. Environment Configuration

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Google OAuth Setup
1. In Google Cloud Console, create an OAuth 2.0 Client ID.
2. Add your Supabase Auth callback URL to the "Authorized redirect URIs".
3. Add the Client ID and Secret to your Supabase Dashboard under **Authentication > Providers > Google**.

## 🐛 Problems Encountered & Solutions

### 1. Excessive API Calls during Search
**Problem**: Initially, every keystroke in the search bar triggered an API call to Supabase.
**Solution**: Implemented a custom `useDebounce` hook. It delays the search query update by 500ms, ensuring calls only happen when the user pauses typing.

### 2. Boilerplate Code in UI Components
**Problem**: Many components had direct Supabase SDK calls, making them hard to read and test.
**Solution**: Created an `api_services` layer. Components now call clean methods like `bookmarkService.addBookmark()`, abstractions that keep the UI code focused on layout.

### 3. Real-time Subscription Efficiency
**Problem**: A generic real-time subscription might trigger re-renders even when other users add data.
**Solution**: Optimized the subscription in `BookmarkList.tsx` by applying a filter directly in the channel (`user_id=eq.${user.id}`). This ensures the client only listens to relevant changes.

### 4. Fragmented Auth State
**Problem**: Checking for a user session was repeated across the Title, Header, and Private pages.
**Solution**: Developed the `useAuth` hook. It centralizes session management and provides a simple `isAuthenticated` boolean used for automatic routing and protection.


