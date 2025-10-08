'use server'

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function transcribeAudio(formData: FormData) {
  try {
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return { success: false, error: 'No audio file provided' }
    }

    // Transcribe using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en', // Can auto-detect but specifying helps with South African English
      response_format: 'text',
    })

    return { 
      success: true, 
      text: transcription 
    }
  } catch (error) {
    console.error('Error transcribing audio:', error)
    return { 
      success: false, 
      error: 'Failed to transcribe audio. Please try again or type your answer.' 
    }
  }
}
