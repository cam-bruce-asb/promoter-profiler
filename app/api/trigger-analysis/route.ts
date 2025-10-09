import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { analyzeCandidate } from '@/lib/ai-analyzer'

export async function POST(request: NextRequest) {
  try {
    const { candidateId, candidateName } = await request.json()

    if (!candidateId || !candidateName) {
      return NextResponse.json(
        { success: false, error: 'Missing candidate ID or name' },
        { status: 400 }
      )
    }

    // Get the candidate's responses from the database
    const supabase = await createAdminClient()
    
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('responses')
      .eq('id', candidateId)
      .single()

    if (candidateError || !candidate) {
      console.error('Error fetching candidate:', candidateError)
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      )
    }

    const responses = candidate.responses as Record<string, string>

    // Check if analysis already exists
    const { data: existingAnalysis } = await supabase
      .from('analyses')
      .select('id')
      .eq('candidate_id', candidateId)
      .single()

    if (existingAnalysis) {
      return NextResponse.json(
        { success: false, error: 'Analysis already exists for this candidate' },
        { status: 400 }
      )
    }

    // Perform AI analysis
    console.log(`Triggering manual AI analysis for candidate ${candidateId}`)
    const analysis = await analyzeCandidate(candidateName, responses as any)
    console.log('Manual analysis completed:', analysis.overallScore)

    // Store the analysis
    const { error: analysisError } = await supabase
      .from('analyses')
      .insert({
        candidate_id: candidateId,
        overall_score: analysis.overallScore,
        trait_scores: analysis.traitScores,
        strengths: analysis.strengths,
        red_flags: analysis.redFlags,
        recommendation: analysis.recommendation,
        problem_areas: analysis.problemAreas,
        raw_ai_response: analysis.rawResponse,
      })

    if (analysisError) {
      console.error('Error storing manual analysis:', analysisError)
      return NextResponse.json(
        { success: false, error: 'Failed to store analysis' },
        { status: 500 }
      )
    }

    console.log(`Successfully completed manual analysis for candidate ${candidateId}`)

    return NextResponse.json({
      success: true,
      message: 'Analysis completed successfully'
    })

  } catch (error) {
    console.error('Error in trigger-analysis API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      },
      { status: 500 }
    )
  }
}
