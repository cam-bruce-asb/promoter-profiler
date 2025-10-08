# Brief Explanation

I need to build a form to send to potential new recruits for a in store promoter position.  I need to get a sense of their personality and if they’re fit for a sales role.  Importantly there shouldn’t be too many questions but the questions should be appropriate to get determine this information.  Once submitted, I want an AI that will analyse their answers and summarise a conclusion of whether they are self motivated, correct personality for a sales role, reliable and dedicated etc.

## Tech Stack

1. Next.JS 15 (App Router with Server Actions)
2. Shadcn UI - Stone Theme
3. TailwindCSS
4. Supabase (Database & Authentication)
5. OpenAI GPT-4o (AI Analysis Engine) 

## Current State & Problem Statement

### Current Process

Recruiters conduct phone screenings to gauge job fit
No standardized assessment criteria
Lack of personality profiling before training commitment
Poor correlation between screening outcomes and actual performance

### Key Pain Points

Blind Investment: Training resources allocated without understanding candidate personality fit
Inconsistent Screening: Subjective recruiter assessments yield variable results
High Turnover: Poor initial fit identification leads to early departures
Time Wastage: Training unsuitable candidates drains resources

### Business Impact

Wasted training costs on unsuitable candidates
Delayed time-to-productivity for retail locations
Reduced sales performance from poor promoter-customer interactions
Administrative burden of constant recruitment cycles

## Target Candidate Profile

### Demographics & Context

Location: South Africa (various provinces)
Education Level: Generally no tertiary education or formal qualifications
Skills Background: Limited formal skillsets or professional training
Language: Potentially multilingual (English, Afrikaans, Zulu, Xhosa, etc.)
Technology Access: Primarily mobile phone users
Economic Context: Often from lower-income communities seeking stable employment

## Key Considerations

### Hidden Talent Identification

Many excellent salespeople lack formal credentials
Natural charisma and street smarts don't show in traditional CVs
Life experience often translates to sales resilience
Community connections can drive local sales success

### Assessment Design Implications

Use simple, clear language (Grade 8-10 reading level)
Avoid jargon or corporate terminology
Focus on practical scenarios over theoretical concepts
Allow for conversational/informal response styles


### Success Indicators for This Demographics

Natural ability to connect with people
Hustle mentality and entrepreneurial spirit
Community standing and local influence
Practical problem-solving skills
Resilience and positive attitude despite challenges

## Project Objectives

### Primary Goals

Create standardized personality assessment for all candidates
Generate AI-powered candidate profiles before training decisions
Identify key success predictors for in-store promoter roles
Reduce training dropout rate by 40%
Improve first-90-day retention by 30%

### Success Criteria

Screen approximately 100 candidates efficiently
Generate actionable profiles within 24 hours of submission
Achieve 75%+ accuracy in predicting training completion
Provide clear hire/no-hire recommendations with confidence scores


## Functional Requirements
1. Candidate Form Interface
Essential Information Capture

### Basic Information

Full name
Contact details (email, phone)
Location/region
Availability (full-time, part-time, weekends)

### Personality Assessment Questions (5-7 questions maximum)

Open-ended situational questions to assess:

Customer interaction approach
Problem-solving ability
Self-motivation indicators
Team collaboration style
Handling rejection/difficult situations

### Industry-Specific Screening

Age verification (21+ for alcohol products)
Comfort level with product categories
Understanding of compliance requirements
Previous retail/sales experience (optional field)

## AI Analysis Engine

### Adjusted Analysis Approach for Target Demographic

Focus on potential over polish - Look for raw talent indicators
Value authenticity - Genuine responses over "correct" answers
Recognize street smarts - Practical intelligence and hustle
Identify natural connectors - Community influence and relationships
Assess resilience differently - Life challenges as strength indicators

### Personality Traits to Evaluate

#### Self-Motivation

Hustle mentality / entrepreneurial indicators
Making-a-plan attitude
Pride in work regardless of education level
Initiative despite limited resources


#### Sales Aptitude

Natural storytelling ability
Warmth and approachability
Persuasion through relationship-building
Energy and enthusiasm (even in simple language)
Ability to relate to everyday customers


#### Reliability Indicators

Family/community responsibility mentions
Overcoming transportation/logistics challenges
Consistency in informal work history
Values-based commitment language

#### Dedication Markers

Seeing job as opportunity, not just income
Family provider mindset
Desire for stable, long-term work
Pride in representing brands

AI Prompting Adjustments

Instruction to AI: "Evaluate for natural sales talent and work ethic, not educational sophistication. Value authenticity, practical intelligence, and life experience. Simple language or grammatical errors should not penalize scores if the core message shows promise."

## Output Requirements

### Candidate Profile Summary (1-page maximum)

Overall fit score (0-100)
Trait breakdown with scores
Key strengths identified
Potential red flags
Hire/Maybe/No-Hire recommendation
Suggested interview focus areas


Batch Analysis Capability

Process multiple candidates simultaneously
Comparative ranking of candidates
Export to CSV/Excel for ATS integration

## Data Management

### Database Structure

**Candidates Table:**
- Personal information (name, email, phone, location)
- Availability and age verification
- Question responses stored as JSONB
- Timestamps for tracking

**Analyses Table:**
- Links to candidate via foreign key
- Overall score and trait breakdowns
- Strengths, red flags, and recommendations
- Raw AI response for audit trail
- Automatic cascade delete if candidate removed

### Security & Privacy

- Row Level Security (RLS) enabled on all tables
- Public can only INSERT candidate data (form submission)
- Only authenticated admin users can READ candidate data
- Service role key used server-side only for AI analysis
- Environment variables for all sensitive credentials
- GDPR compliance considerations for South African candidates

### Data Retention

- All candidate data stored indefinitely for analysis
- Can be exported or deleted on request
- AI analysis runs asynchronously (5-10 seconds)
- Analysis results cached in database to avoid re-processing

---

## Implementation Status

### ✅ Completed Features

**Public Form (Landing Page):**
- Mobile-first responsive design
- Simple, clear language at Grade 8-10 reading level
- 7 situational assessment questions
- Contact information capture
- Age verification and product comfort assessment
- Immediate submission without login required
- Success confirmation page

**AI Analysis Engine:**
- OpenAI GPT-4o integration
- Custom prompts calibrated for South African demographic
- Evaluates 4 core traits: Self-Motivation, Sales Aptitude, Reliability, Dedication
- Generates overall score (0-100)
- Identifies strengths and red flags
- Provides Hire/Maybe/No-Hire recommendation
- Suggests interview focus areas
- Background processing (doesn't block form submission)

**Admin Dashboard:**
- Protected authentication using Supabase Auth
- Overview table of all candidates
- Color-coded scores and recommendations
- Sortable by date, score, recommendation
- Real-time analysis status indicators

**Candidate Detail View:**
- Full contact information display
- Complete AI analysis breakdown
- Visual trait score cards
- Strengths and concerns highlighted
- Interview focus recommendations
- All question responses displayed

### Technical Architecture

**Frontend:**
- Next.js 15 App Router for optimal performance
- Server Components for initial page loads
- Client Components for interactive forms
- Shadcn UI components with Stone theme
- TailwindCSS for responsive styling
- Lucide React for icons

**Backend:**
- Next.js Server Actions for form submission
- Supabase for database and authentication
- Row Level Security policies for data protection
- OpenAI API for candidate analysis
- Async processing for AI analysis

**Authentication:**
- Supabase Auth for admin login
- Middleware protection for admin routes
- Session-based authentication
- Automatic redirect handling

**Database:**
- PostgreSQL via Supabase
- Migration-based schema management
- Foreign key relationships
- Indexed for performance
- JSONB for flexible response storage

### Deployment

**Hosting:**
- Vercel for application hosting
- Automatic deployments from GitHub
- Edge network for global performance

**Database:**
- Supabase hosted PostgreSQL
- Automatic backups
- Global CDN for low latency

**Environment Configuration:**
- Separate development and production environments
- Environment variables for all secrets
- Local Supabase CLI for development

### Setup Requirements

1. **Supabase Project:**
   - Create project at supabase.com
   - Link locally: `supabase link --project-ref YOUR_REF`
   - Push schema: `supabase db push`
   - Create admin user in Dashboard

2. **OpenAI Account:**
   - API key from platform.openai.com
   - GPT-4o access required
   - Usage monitoring recommended

3. **Environment Variables:**
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - OPENAI_API_KEY

4. **Local Development:**
   - Node.js 18+ required
   - Run `npm install`
   - Configure `.env.local`
   - Run `npm run dev`

### Assessment Questions Implemented

1. "Tell us about a time you helped someone choose a product. What did you do?"
2. "Imagine a customer says no to your product. How would you feel and what would you do?"
3. "What makes you want to work as a promoter? What excites you about it?"
4. "Tell us about a time you had to solve a problem without help. What happened?"
5. "How do you get along with people? Give us an example."
6. "What would you do if you had a bad day but still had to work?"
7. "Why should we choose you for this position?"

### Future Enhancements (Optional)

- CSV export functionality for candidate data
- Batch candidate comparison view
- Email notifications to admins on new submissions
- SMS confirmation to candidates
- Multi-language support (Afrikaans, Zulu, Xhosa)
- Video response option for questions
- Integration with existing ATS systems
- Analytics dashboard for recruitment trends
- Automated scheduling for interviews with top candidates

### Documentation

- **README.md**: Complete technical documentation
- **SETUP.md**: Step-by-step setup guide for beginners
- **brief.md**: This document - project requirements and implementation

### Project Links

- **GitHub**: https://github.com/cam-bruce-asb/promoter-profiler
- **Vercel**: Connected for automatic deployment
- **Local Dev**: http://localhost:3000
- **Admin Login**: http://localhost:3000/admin/login
