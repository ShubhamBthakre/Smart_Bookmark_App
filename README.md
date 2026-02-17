# Smart Bookmark App 📚

A beautiful, real-time bookmark manager built with Next.js, Supabase, and Tailwind CSS. Features Google OAuth authentication, real-time synchronization, and a premium glassmorphic UI.

## 🎯 Features

✅ **Google OAuth Authentication** - No email/password required  
✅ **Real-time Sync** - Updates across tabs instantly without page refresh  
✅ **Private & Secure** - Each user's bookmarks are completely private  
✅ **Beautiful UI** - Premium glassmorphic design with smooth animations  
✅ **Responsive** - Works perfectly on desktop, tablet, and mobile  
✅ **Fast** - Built with Next.js 16 App Router for optimal performance  

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Deployment**: Vercel (recommended)

## 📋 Requirements Met

1. ✅ User can sign up and log in using Google (Google OAuth only)
2. ✅ A logged-in user can add a bookmark (URL + title)
3. ✅ Bookmarks are private to each user
4. ✅ Bookmark list updates in real-time without page refresh
5. ✅ User can delete their own bookmarks
6. ✅ Ready to deploy on Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account
- A Google Cloud Console project (for OAuth)

### 1. Clone and Install

\`\`\`bash
git clone <your-repo-url>
cd smart-bookmark-app
npm install
\`\`\`

### 2. Supabase Setup

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned

#### Create the Bookmarks Table

Run this SQL in the Supabase SQL Editor:

\`\`\`sql
-- Create bookmarks table
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only see their own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own bookmarks
CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own bookmarks
CREATE POLICY "Users can update own bookmarks"
  ON bookmarks FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
\`\`\`

#### Enable Realtime

1. Go to Database → Replication in your Supabase dashboard
2. Enable replication for the `bookmarks` table

### 3. Google OAuth Setup

#### In Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen
6. Add authorized redirect URIs:
   - `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/v1/callback` (for local development)
7. Copy the Client ID and Client Secret

#### In Supabase Dashboard

1. Go to Authentication → Providers
2. Enable Google provider
3. Paste your Google Client ID and Client Secret
4. Save

### 4. Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

Get these values from your Supabase project settings → API.

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

### Update Google OAuth Redirect URI

After deployment, add your Vercel domain to Google OAuth authorized redirect URIs:
- `https://your-app.vercel.app/auth/v1/callback`

## 📁 Project Structure

\`\`\`
smart-bookmark-app/
├── app/
│   ├── bookmarks/
│   │   └── page.tsx          # Main bookmarks dashboard
│   ├── components/
│   │   ├── BookmarkForm.tsx  # Add bookmark form
│   │   └── BookmarkList.tsx  # List with real-time updates
│   ├── lib/
│   │   └── supabaseClient.ts # Supabase client configuration
│   ├── login/
│   │   └── page.tsx          # Login page
│   ├── types/
│   │   └── database.types.ts # TypeScript types
│   ├── globals.css           # Global styles & animations
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── .env.local                # Environment variables (not in git)
├── package.json
└── README.md
\`\`\`

## 🎨 Design Features

- **Animated Gradient Background** - Smooth, infinite gradient animation
- **Glassmorphism** - Modern glass-effect cards with backdrop blur
- **Micro-animations** - Fade-in, hover-lift, and smooth transitions
- **Custom Scrollbar** - Styled to match the theme
- **Responsive Grid** - Adapts beautifully to all screen sizes
- **Premium Typography** - Inter font for clean, modern look

## 🐛 Problems Encountered & Solutions

### 1. CSS Lint Warning: Unknown @theme Rule

**Problem**: Tailwind CSS v4 uses a new `@theme` directive that some CSS linters don't recognize yet.

**Solution**: This is a false positive. The `@theme` directive is valid in Tailwind CSS v4. You can safely ignore this warning, or update your CSS linter configuration to support Tailwind v4 syntax.

### 2. Real-time Subscription Setup

**Problem**: Initially, real-time updates weren't working because the table wasn't added to the replication publication.

**Solution**: Added `ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;` to the SQL setup and enabled replication in the Supabase dashboard.

### 3. Row Level Security (RLS)

**Problem**: Without RLS policies, users could potentially see other users' bookmarks.

**Solution**: Implemented comprehensive RLS policies to ensure users can only access their own bookmarks. Each policy checks `auth.uid() = user_id`.

### 4. TypeScript Import Paths

**Problem**: Import paths needed to use the `@/` alias for cleaner imports.

**Solution**: The project is already configured with TypeScript path aliases in `tsconfig.json`, allowing imports like `@/lib/supabaseClient` instead of relative paths.

## 🔒 Security Features

- **Row Level Security (RLS)** - Database-level security ensuring data privacy
- **Google OAuth** - Secure authentication without storing passwords
- **Environment Variables** - Sensitive keys stored securely
- **HTTPS Only** - All production traffic encrypted
- **User Isolation** - Complete data separation between users

## 📊 Database Schema

\`\`\`sql
bookmarks
├── id (UUID, Primary Key)
├── user_id (UUID, Foreign Key → auth.users)
├── url (TEXT, NOT NULL)
├── title (TEXT, NOT NULL)
├── created_at (TIMESTAMP WITH TIME ZONE)
└── updated_at (TIMESTAMP WITH TIME ZONE)
\`\`\`

## 🎯 Future Enhancements (Optional)

- [ ] Search and filter bookmarks
- [ ] Tags/categories for organization
- [ ] Bookmark folders
- [ ] Import/export bookmarks
- [ ] Browser extension
- [ ] Bookmark preview/screenshots
- [ ] Sharing bookmarks with others

## 📝 License

MIT License - feel free to use this project for learning or production!

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the excellent backend platform
- Tailwind CSS for the utility-first styling approach

---

**Built with ❤️ using Next.js, Supabase & Tailwind CSS**
