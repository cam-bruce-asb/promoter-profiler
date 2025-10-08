'use server'

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface AudioToneAnalysis {
  questionNumber: number
  confidence: 'high' | 'medium' | 'low'
  enthusiasm: 'high' | 'medium' | 'low'
  tone: string[]
  speechPace: 'fast' | 'moderate' | 'slow'
  clarity: 'clear' | 'moderate' | 'unclear'
  naturalness: 'natural' | 'somewhat-rehearsed' | 'rehearsed'
  insights: string
}

export async function analyzeAudioTone(audioFile: File, questionNumber: number, questionText: string): Promise<AudioToneAnalysis | null> {
  try {
    // First, get the transcription with detailed response
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
      language: 'en',
    })

    // Analyze the transcription metadata and use GPT to analyze tone
    const prompt = `You are analyzing a voice recording from a job candidate for an in-store promoter position.

QUESTION ASKED: "${questionText}"

TRANSCRIPTION: "${transcription.text}"

AUDIO METADATA:
- Duration: ${transcription.duration} seconds
- Language: ${transcription.language}

Analyze the candidate's voice and delivery style based on the transcription and metadata. Consider:
1. Confidence level (how assured they sound)
2. Enthusiasm (energy and excitement in their response)
3. Tone qualities (warm, professional, hesitant, etc.)
4. Speech pace (too fast, well-paced, too slow)
5. Clarity and articulation
6. Naturalness (spontaneous vs rehearsed)

Respond ONLY with valid JSON in this format:
{
  "confidence": "high|medium|low",
  "enthusiasm": "high|medium|low",
  "tone": ["warm", "professional", "genuine", etc.],
  "speechPace": "fast|moderate|slow",
  "clarity": "clear|moderate|unclear",
  "naturalness": "natural|somewhat-rehearsed|rehearsed",
  "insights": "Brief 2-3 sentence summary of their vocal delivery and what it reveals about their personality"
}`

    const analysis = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in analyzing voice recordings to assess personality traits, confidence, and communication style for job candidates.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const result = analysis.choices[0].message.content
    if (!result) {
      return null
    }

    const parsed = JSON.parse(result)

    return {
      questionNumber,
      confidence: parsed.confidence,
      enthusiasm: parsed.enthusiasm,
      tone: parsed.tone || [],
      speechPace: parsed.speechPace,
      clarity: parsed.clarity,
      naturalness: parsed.naturalness,
      insights: parsed.insights,
    }
  } catch (error) {
    console.error(`Error analyzing audio tone for question ${questionNumber}:`, error)
    return null
  }
}
