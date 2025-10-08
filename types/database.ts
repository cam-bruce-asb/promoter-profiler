export interface Candidate {
  id: string
  full_name: string
  email: string
  phone: string
  location: string
  availability: string
  age_verified: boolean
  product_comfort: string | null
  previous_experience: string | null
  responses: {
    question1: string
    question2: string
    question3: string
    question4: string
    question5: string
    question6: string
    question7: string
  }
  created_at: string
}

export interface Analysis {
  id: string
  candidate_id: string
  overall_score: number
  trait_scores: {
    selfMotivation: number
    salesAptitude: number
    reliability: number
    dedication: number
  }
  strengths: string[]
  red_flags: string[]
  recommendation: 'Hire' | 'Maybe' | 'No-Hire'
  interview_focus: string[]
  raw_ai_response: string
  created_at: string
}

export interface CandidateWithAnalysis extends Candidate {
  analyses: Analysis[]
}
