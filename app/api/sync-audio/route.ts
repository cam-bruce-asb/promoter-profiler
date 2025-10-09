import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { candidateId } = await request.json()
    
    if (!candidateId) {
      return NextResponse.json({ error: 'Candidate ID required' }, { status: 400 })
    }

    console.log(`Syncing audio files for candidate ${candidateId}`)
    
    const supabase = await createAdminClient()
    
    // List files in the candidate's folder
    const { data: files, error: listError } = await supabase.storage
      .from('candidate-audio')
      .list(candidateId)

    if (listError) {
      console.error('Error listing files:', listError)
      return NextResponse.json({ error: 'Failed to list audio files' }, { status: 500 })
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ message: 'No audio files found in storage' }, { status: 200 })
    }

    console.log(`Found ${files.length} audio files`)

    // Create URL mappings for each question
    const audioUrls: { [key: string]: string } = {}
    
    files.forEach((file) => {
      // Extract question number from filename (e.g., "question1-123456.webm" or "question1.webm")
      const match = file.name.match(/question(\d+)/)
      if (match) {
        const questionNumber = match[1]
        const fileName = `${candidateId}/${file.name}`
        
        const { data: { publicUrl } } = supabase.storage
          .from('candidate-audio')
          .getPublicUrl(fileName)
        
        audioUrls[`question${questionNumber}`] = publicUrl
        console.log(`Mapped question${questionNumber} to ${fileName}`)
      }
    })

    if (Object.keys(audioUrls).length === 0) {
      return NextResponse.json({ message: 'No valid audio files found' }, { status: 200 })
    }

    // Update candidate record with audio URLs
    const { error: updateError } = await supabase
      .from('candidates')
      .update({ audio_urls: audioUrls })
      .eq('id', candidateId)

    if (updateError) {
      console.error('Error updating candidate:', updateError)
      return NextResponse.json({ error: 'Failed to update candidate record' }, { status: 500 })
    }

    console.log(`Successfully synced ${Object.keys(audioUrls).length} audio files`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Synced ${Object.keys(audioUrls).length} audio recordings`,
      audioUrls 
    })
  } catch (error) {
    console.error('Audio sync API error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
