# Quick Setup Guide

Follow these steps to get your Promoter Profiler up and running.

## Prerequisites

- Node.js installed
- Supabase account (free tier works)
- OpenAI API key

## Step-by-Step Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for it to initialize
4. Note your project URL and keys from Settings → API

### 2. Link Supabase Locally

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

You'll find your project ref in the Supabase Dashboard URL:
`https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

### 3. Push Database Schema

```bash
supabase db push
```

This creates your tables and sets up security policies.

### 4. Create Environment File

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
OPENAI_API_KEY=sk-your-openai-key-here
```

**Getting your keys:**

**Supabase:**
- Dashboard → Settings → API
- Copy "Project URL" for `NEXT_PUBLIC_SUPABASE_URL`
- Copy "anon public" for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy "service_role" for `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

**OpenAI:**
- Go to https://platform.openai.com/api-keys
- Create new secret key
- Copy for `OPENAI_API_KEY`

### 5. Create Admin User

In Supabase Dashboard:
1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter email and password
4. Save these credentials - you'll use them to log into the admin dashboard

### 6. Run the App

```bash
npm run dev
```

Visit:
- **Public Form**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin/login

### 7. Test It Out

1. Fill out a test application on the homepage
2. Log in to admin dashboard with your Supabase user credentials
3. Wait a few seconds for AI analysis to complete
4. Refresh the admin dashboard to see results

## Common Issues

### "Invalid API key" Error
- Check your OpenAI API key is correct
- Make sure you have credits in your OpenAI account

### "Failed to save application"
- Check your Supabase connection
- Verify the migration ran successfully with `supabase db push`

### Can't log into admin
- Make sure you created a user in Supabase Authentication
- Check your email/password are correct
- Verify environment variables are set correctly

### Analysis not showing
- AI analysis runs in the background (takes 5-10 seconds)
- Refresh the page to see updated results
- Check browser console for errors

## Next Steps

1. Customize the questions in `/app/page.tsx` if needed
2. Adjust AI prompts in `/lib/ai-analyzer.ts` for your specific needs
3. Deploy to Vercel when ready (remember to add environment variables there too)

## Need Help?

- Check the main README.md for detailed documentation
- Review the brief.md for project requirements
- Check Supabase and OpenAI documentation
