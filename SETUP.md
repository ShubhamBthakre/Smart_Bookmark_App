End-to-End Project Setup

Next.js (App Router) + Supabase + Google OAuth

This document explains how to initialize a project from scratch with:

Google OAuth authentication

Supabase backend (DB + Auth + Realtime)

Row Level Security (RLS)

Next.js App Router frontend

By following this guide, you can bootstrap any future project with the same stack securely and correctly.

1. Prerequisites

Make sure you have:

Node.js v18+

npm or yarn

A Google account

A Supabase account

Basic knowledge of React / Next.js

2. Create Next.js Project
npx create-next-app@latest smart-bookmark-app
cd smart-bookmark-app
npm run dev


Recommended options:

TypeScript → ✅ Yes

App Router → ✅ Yes

Tailwind CSS → ✅ Yes

ESLint → ✅ Yes

3. Create Supabase Project

Go to https://supabase.com

Click New Project

Fill:

Project name

Database password

Region

Create project

After creation, copy:

Project URL

Anon Public Key

4. Enable Data API & Automatic RLS

In Supabase project setup (or Settings):

✅ Enable Data API

✅ Enable Automatic Row Level Security (RLS)

This ensures:

REST APIs are available

All new tables are secure by default

5. Create Database Table

Example table: bookmarks

create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  url text not null,
  created_at timestamp with time zone default now()
);

6. Enable Row Level Security (RLS)

If automatic RLS is not enabled:

alter table bookmarks enable row level security;

7. Add RLS Policies (CRITICAL)

These policies ensure users can only access their own data.

Read (SELECT)
create policy "Users can read own bookmarks"
on bookmarks
for select
using (auth.uid() = user_id);

Create (INSERT)
create policy "Users can insert own bookmarks"
on bookmarks
for insert
with check (auth.uid() = user_id);

Delete
create policy "Users can delete own bookmarks"
on bookmarks
for delete
using (auth.uid() = user_id);


⚠️ Never rely on frontend filtering for security.
Always use RLS.

8. Configure Google OAuth (Google Cloud Console)
8.1 Create Google Cloud Project

Go to https://console.cloud.google.com

Create a new project

Select the project

8.2 Configure OAuth Consent Screen

Go to:

APIs & Services → OAuth consent screen


User Type: External

App name: Your app name

User support email: your email

Developer contact email: your email

Save and Publish

⚠️ OAuth must be Published, not in Testing mode.

8.3 Create OAuth Client ID

Go to:

APIs & Services → Credentials


Click:

Create Credentials → OAuth Client ID


Choose:

Application type: Web Application

Add Authorized Redirect URI:

https://<SUPABASE_PROJECT_ID>.supabase.co/auth/v1/callback


Save and copy:

Client ID

Client Secret

9. Enable Google Provider in Supabase

Supabase Dashboard →

Authentication → Providers → Google


Enable Google provider

Paste Client ID

Paste Client Secret

Save

10. Configure Supabase Auth URLs

Supabase Dashboard →

Authentication → URL Configuration


Set:

Site URL
http://localhost:3000

Redirect URLs
http://localhost:3000/**
http://localhost:3000/auth/callback


Save changes.

11. Install Supabase Client
npm install @supabase/supabase-js

12. Create Supabase Client

Create file:

src/lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

13. Environment Variables

Create .env.local:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key


Restart dev server after this.

14. Setup Path Alias (Optional but Recommended)

Update tsconfig.json:

{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}


Restart dev server and VS Code.

15. Implement Google Login (Frontend)

Example login function:

await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});

16. Handle OAuth Callback (REQUIRED for App Router)

Create file:

src/app/auth/callback/page.tsx

'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth
      .exchangeCodeForSession(window.location.search)
      .then(() => router.replace('/'))
      .catch(console.error);
  }, [router]);

  return <p>Signing you in...</p>;
}


⚠️ This step is mandatory in Next.js App Router.
Without it, users will not be created in Supabase.

17. Verify Authentication

After login:

Supabase Dashboard →

Authentication → Users


You should see:

Provider: Google

Email: user’s Gmail

18. Security Best Practices

❌ Never use service_role key in frontend

❌ Never trust frontend for user_id

✅ Always rely on RLS

✅ Use auth.uid() in policies

19. Deployment (Vercel)

After deploying to production:

Update Supabase Site URL

https://your-domain.com


Add Redirect URLs

https://your-domain.com/**
https://your-domain.com/auth/callback

20. Common Issues & Fixes
Issue	Cause	Fix
Google popup opens but no user created	Missing callback exchange	Add exchangeCodeForSession
403 DB errors	Missing RLS policies	Add correct RLS
Import alias error	baseUrl missing	Fix tsconfig
Works locally, fails in prod	URLs not updated	Update Supabase URLs