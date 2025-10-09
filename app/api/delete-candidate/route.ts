import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function DELETE(request: NextRequest) {
  try {
    const { candidateId } = await request.json()

    if (!candidateId) {
      return NextResponse.json(
        { success: false, error: 'Missing candidate ID' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()

    // First, get the candidate to check for audio files
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('audio_urls')
      .eq('id', candidateId)
      .single()

    if (candidateError || !candidate) {
      console.error('Error fetching candidate:', candidateError)
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      )
    }

    console.log(`Deleting candidate ${candidateId}`)

    // Delete audio files if they exist
    if (candidate.audio_urls && typeof candidate.audio_urls === 'object') {
      const audioUrls = candidate.audio_urls as Record<string, string>
      const filePaths = Object.values(audioUrls)
      
      if (filePaths.length > 0) {
        console.log(`Deleting ${filePaths.length} audio files`)
        
        const { error: storageError } = await supabase.storage
          .from('audio-files')
          .remove(filePaths)

        if (storageError) {
          console.error('Error deleting audio files:', storageError)
          // Continue with candidate deletion even if audio deletion fails
        } else {
          console.log('Audio files deleted successfully')
        }
      }
    }

    // Delete the candidate (this will cascade delete analyses due to foreign key constraint)
    const { error: deleteError } = await supabase
      .from('candidates')
      .delete()
      .eq('id', candidateId)

    if (deleteError) {
      console.error('Error deleting candidate:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete candidate' },
        { status: 500 }
      )
    }

    console.log(`Successfully deleted candidate ${candidateId}`)

    return NextResponse.json({
      success: true,
      message: 'Candidate and all related data deleted successfully'
    })

  } catch (error) {
    console.error('Error in delete-candidate API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      },
      { status: 500 }
    )
  }
}
