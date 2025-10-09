import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { analyzeAudioTone, type AudioToneAnalysis } from '@/app/actions/analyze-audio-tone'

export async function POST(request: NextRequest) {
  try {
    const { candidateId } = await request.json()
    
    if (!candidateId) {
      return NextResponse.json({ error: 'Candidate ID required' }, { status: 400 })
    }

    console.log(`Starting audio analysis for candidate ${candidateId}`)
    
    const supabase = await createAdminClient()
    
    // Get candidate record to fetch audio URLs
    const { data: candidate } = await supabase
      .from('candidates')
      .select('audio_urls')
      .eq('id', candidateId)
      .single()

    if (!candidate?.audio_urls) {
      console.log('No audio URLs found for candidate', candidateId)
      return NextResponse.json({ message: 'No audio files to analyze' }, { status: 200 })
    }

    const audioUrls = candidate.audio_urls as Record<string, string>
    const analyses: AudioToneAnalysis[] = []
    
    const questions = [
      "Tell us about a time you helped someone choose a product. What did you do?",
      "Imagine a customer says no to your product. How would you feel and what would you do?",
      "Why do you want to work? What motivates you?",
      "Tell us about a time you had to solve a problem without help. What happened?",
      "How do you get along with people? Give us an example.",
      "What would you do if you had a bad day but still had to work?",
      "Why should we choose you for this position?",
    ]

    // Analyze each audio file
    for (let i = 1; i <= 7; i++) {
      const audioUrl = audioUrls[`question${i}`]
      if (audioUrl) {
        try {
          console.log(`Analyzing audio for question ${i}`)
          
          // Fetch audio file from URL
          const audioResponse = await fetch(audioUrl)
          if (!audioResponse.ok) {
            console.error(`Failed to fetch audio for question ${i}`)
            continue
          }
          
          const audioBlob = await audioResponse.blob()
          const audioFile = new File([audioBlob], `question${i}.webm`, { type: 'audio/webm' })
          
          const toneAnalysis = await analyzeAudioTone(audioFile, i, questions[i - 1])
          if (toneAnalysis) {
            analyses.push(toneAnalysis)
            console.log(`Successfully analyzed question ${i}`)
          }
        } catch (error) {
          console.error(`Error analyzing audio for question ${i}:`, error)
        }
      }
    }

    // Update the existing analysis with audio tone data
    if (analyses.length > 0) {
      const { error: updateError } = await supabase
        .from('analyses')
        .update({ audio_tone_analysis: analyses })
        .eq('candidate_id', candidateId)

      if (updateError) {
        console.error('Error updating analysis with audio tone:', updateError)
        return NextResponse.json({ error: 'Failed to save audio analysis' }, { status: 500 })
      }
      
      console.log(`Successfully added audio analysis for candidate ${candidateId}`)
      return NextResponse.json({ 
        success: true, 
        message: `Analyzed ${analyses.length} audio recordings` 
      })
    }

    return NextResponse.json({ message: 'No audio files analyzed' }, { status: 200 })
  } catch (error) {
    console.error('Audio analysis API error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// No timeout - let it run as long as needed
export const maxDuration = 300 // 5 minutes
