'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { analyzeCandidate } from '@/lib/ai-analyzer'
import { analyzeAudioTone, type AudioToneAnalysis } from './analyze-audio-tone'

export async function submitCandidateForm(formData: FormData) {
  try {
    // Extract form data
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const location = formData.get('location') as string
    const availability = formData.get('availability') as string
    const ageVerified = formData.get('ageVerified') === 'on'
    const productComfort = formData.get('productComfort') as string
    const previousExperience = formData.get('previousExperience') as string

    // Extract question responses
    const responses = {
      question1: formData.get('question1') as string,
      question2: formData.get('question2') as string,
      question3: formData.get('question3') as string,
      question4: formData.get('question4') as string,
      question5: formData.get('question5') as string,
      question6: formData.get('question6') as string,
      question7: formData.get('question7') as string,
    }

    // Validate required fields
    if (!fullName || !email || !phone || !location || !availability || !ageVerified) {
      return { success: false, error: 'Please fill in all required fields' }
    }

    if (!responses.question1 || !responses.question2 || !responses.question3 ||
        !responses.question4 || !responses.question5 || !responses.question6 ||
        !responses.question7) {
      return { success: false, error: 'Please answer all questions' }
    }

    // Create Supabase admin client
    const supabase = await createAdminClient()

    // Insert candidate into database
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .insert({
        full_name: fullName,
        email,
        phone,
        location,
        availability,
        age_verified: ageVerified,
        product_comfort: productComfort || null,
        previous_experience: previousExperience || null,
        responses,
      })
      .select()
      .single()

    if (candidateError) {
      console.error('Error inserting candidate:', candidateError)
      return { success: false, error: 'Failed to save your application. Please try again.' }
    }

    // Trigger AI analysis asynchronously (don't wait for it)
    analyzeAndStore(candidate.id, fullName, responses).catch((error) => {
      console.error('Error in background analysis:', error)
    })

    return { success: true, candidateId: candidate.id }
  } catch (error) {
    console.error('Error submitting form:', error)
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}

// Background function to analyze and store results
async function analyzeAndStore(
  candidateId: string,
  candidateName: string,
  responses: any
) {
  try {
    // First, do basic text analysis without audio (fast)
    const analysis = await analyzeCandidate(candidateName, responses)
    
    const supabase = await createAdminClient()
    
    const { error: analysisError } = await supabase
      .from('analyses')
      .insert({
        candidate_id: candidateId,
        overall_score: analysis.overallScore,
        trait_scores: analysis.traitScores,
        strengths: analysis.strengths,
        red_flags: analysis.redFlags,
        recommendation: analysis.recommendation,
        interview_focus: analysis.interviewFocus,
        raw_ai_response: analysis.rawResponse,
      })

    if (analysisError) {
      console.error('Error storing analysis:', analysisError)
      throw analysisError
    }

    console.log(`Successfully analyzed candidate ${candidateId}`)
    // Audio analysis will be triggered via API route from client
    
  } catch (error) {
    console.error('Failed to analyze candidate:', error)
    // Don't throw - we don't want to fail the form submission
  }
}
