# Promoter Profiler

A candidate screening application for in-store promoter positions with AI-powered personality analysis.

## Features

- **Multi-Step Voice Form**: Mobile-first wizard interface with voice recording capability
- **Voice-to-Text**: Automatic transcription using OpenAI Whisper API
- **Progress Saving**: Candidates can resume their application from where they left off
- **AI Analysis**: Automatic personality assessment using OpenAI GPT-4o
- **Admin Dashboard**: Protected dashboard to review all candidates
- **Detailed Profiles**: View candidate responses and AI-generated insights

## Tech Stack

- Next.js 15 (App Router)
- Supabase (Database & Authentication)
- OpenAI GPT-4o (AI Analysis)
- OpenAI Whisper (Voice Transcription)
- Shadcn/ui (Stone Theme)
- TailwindCSS
- Web MediaRecorder API (Voice Recording)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

#### Link to Your Supabase Project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

#### Push Database Migrations

```bash
supabase db push
```

This will create the `candidates` and `analyses` tables with proper Row Level Security policies.

#### Create Admin User

In the Supabase Dashboard:
1. Go to Authentication > Users
2. Click "Add User"
3. Create an admin account with email and password

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
```

**Where to find these values:**

- Supabase URL and Keys: Supabase Dashboard → Project Settings → API
- OpenAI API Key: https://platform.openai.com/api-keys

### 4. Run Development Server

```bash
npm run dev
```

Visit:
- Public form: http://localhost:3000
- Admin login: http://localhost:3000/admin/login

## Usage

### For Candidates

The application uses a **9-step wizard format** optimized for mobile devices:

**Step 1**: Basic Information
- Enter name, email, phone, location, and availability
- Regular text inputs

**Steps 2-8**: Voice Questions (one question per step)
- Click "Record Your Answer" to use voice
- Speak your answer naturally
- Audio automatically transcribes using OpenAI Whisper
- Edit the transcribed text if needed
- Alternatively, type your answer in the text box
- Progress is automatically saved in your browser

**Step 9**: Review & Submit
- Review all your answers
- Edit any response by clicking the "Edit" button
- Submit your completed application

**Key Features:**
- Voice recording with auto-transcription
- Fallback to typing if voice doesn't work
- Progress saved automatically (can close and resume later)
- Mobile-friendly interface
- Works with South African accents

### For Admins

1. Navigate to `/admin/login`
2. Sign in with your Supabase credentials
3. View all candidates in the dashboard
4. Click "View Details" to see full analysis

## AI Analysis Features

The AI evaluates candidates on:

- **Self-Motivation**: Hustle mentality, entrepreneurial spirit
- **Sales Aptitude**: Natural storytelling, warmth, persuasion
- **Reliability**: Responsibility, consistency, values
- **Dedication**: Long-term commitment, pride in work

Each candidate receives:
- Overall score (0-100)
- Individual trait scores
- Key strengths
- Potential concerns
- Hire/Maybe/No-Hire recommendation
- Interview focus areas

## Database Schema

### Candidates Table
- Personal information (name, email, phone, location)
- Availability and age verification
- Question responses (stored as JSONB)

### Analyses Table
- Links to candidate
- Overall and trait scores
- Strengths, red flags, recommendations
- Raw AI response for reference

## Security

- Row Level Security (RLS) enabled on all tables
- Public can only INSERT candidates
- Only authenticated users can READ/UPDATE
- Admin routes protected by middleware
- Service role key used only server-side

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Supabase Production Setup

Use `supabase db push` to sync your local migrations to production:

```bash
supabase link --project-ref YOUR_PROD_PROJECT_REF
supabase db push
```

## Support

For issues or questions, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
