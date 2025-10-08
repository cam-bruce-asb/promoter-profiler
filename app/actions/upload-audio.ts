'use server'

import { createAdminClient } from '@/lib/supabase/server'

export async function uploadAudioFiles(candidateId: string, audioData: { [key: string]: string }) {
  try {
    console.log(`Uploading audio files for candidate ${candidateId}`)
    console.log(`Number of audio files:`, Object.keys(audioData).length)
    
    const supabase = await createAdminClient()
    const audioUrls: { [key: string]: string } = {}

    // Upload each audio file
    for (const [questionKey, base64Data] of Object.entries(audioData)) {
      if (base64Data) {
        try {
          // Convert base64 to buffer
          const buffer = Buffer.from(base64Data, 'base64')
          console.log(`Uploading ${questionKey}, size: ${buffer.length} bytes`)
          
          const fileName = `${candidateId}/${questionKey}-${Date.now()}.webm`
          
          const { data, error } = await supabase.storage
            .from('candidate-audio')
            .upload(fileName, buffer, {
              contentType: 'audio/webm',
              upsert: false,
            })

          if (error) {
            console.error(`Error uploading ${questionKey}:`, error)
            continue
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('candidate-audio')
            .getPublicUrl(fileName)

          audioUrls[questionKey] = publicUrl
          console.log(`Successfully uploaded ${questionKey}`)
        } catch (uploadError) {
          console.error(`Error processing ${questionKey}:`, uploadError)
          continue
        }
      }
    }

    // Update candidate record with audio URLs
    if (Object.keys(audioUrls).length > 0) {
      const { error: updateError } = await supabase
        .from('candidates')
        .update({ audio_urls: audioUrls })
        .eq('id', candidateId)

      if (updateError) {
        console.error('Error updating candidate with audio URLs:', updateError)
        return { success: false, error: 'Failed to save audio URLs' }
      }
    }

    return { success: true, audioUrls }
  } catch (error) {
    console.error('Error uploading audio files:', error)
    return { success: false, error: 'Failed to upload audio files' }
  }
}
