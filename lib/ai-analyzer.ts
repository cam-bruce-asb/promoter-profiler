import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface CandidateResponses {
  question1: string
  question2: string
  question3: string
  question4: string
  question5: string
  question6: string
  question7: string
}

export interface TraitScores {
  selfMotivation: number
  salesAptitude: number
  reliability: number
  dedication: number
}

export interface AnalysisResult {
  overallScore: number
  traitScores: TraitScores
  strengths: string[]
  redFlags: string[]
  recommendation: 'Hire' | 'Maybe' | 'No-Hire'
  problemAreas: string[]
  rawResponse: string
}

export async function analyzeCandidate(
  candidateName: string,
  responses: CandidateResponses,
  audioAnalyses?: any[] | null
): Promise<AnalysisResult> {
  const prompt = `You are evaluating a candidate named ${candidateName} for an in-store promoter position in South Africa.

IMPORTANT EVALUATION CONTEXT:
- Evaluate for natural sales talent and work ethic, NOT educational sophistication
- Don't automatically trust what the person says about themselves, rather look for evidence of the traits you are evaluating through a combination of other answers
- Value authenticity, practical intelligence, and life experience
- Simple language or grammatical errors should NOT penalize scores if the core message shows promise
- Look for hustle mentality, street smarts, and natural people skills
- Recognize that many excellent salespeople lack formal credentials
- Value life experience and community connections

CANDIDATE'S RESPONSES:

Question 1 - "Tell us about a time you helped someone choose a product. What did you do?":
${responses.question1}

Question 2 - "Imagine a customer says no to your product. How would you feel and what would you do?":
${responses.question2}

Question 3 - "Why do you want to work? What motivates you?":
${responses.question3}

Question 4 - "Tell us about a time you had to solve a problem without help. What happened?":
${responses.question4}

Question 5 - "How do you get along with people? Give us an example.":
${responses.question5}

Question 6 - "What would you do if you had a bad day but still had to work?":
${responses.question6}

Question 7 - "Why should we choose you for this position?":
${responses.question7}

${audioAnalyses && audioAnalyses.length > 0 ? `
VOICE & TONE ANALYSIS:
Based on audio recordings, here are insights about the candidate's vocal delivery:

${audioAnalyses.map((analysis: any) => `
Question ${analysis.questionNumber}:
- Confidence Level: ${analysis.confidence}
- Enthusiasm: ${analysis.enthusiasm}
- Tone Qualities: ${analysis.tone.join(', ')}
- Speech Pace: ${analysis.speechPace}
- Clarity: ${analysis.clarity}
- Naturalness: ${analysis.naturalness}
- Vocal Insights: ${analysis.insights}
`).join('\n')}

IMPORTANT: Factor in these vocal characteristics when assessing:
- Sales Aptitude: High enthusiasm and warm tone indicate natural sales ability
- Confidence: Voice confidence correlates with self-motivation and reliability
- Authenticity: Natural, spontaneous delivery suggests genuine responses
- Communication Skills: Clarity and pace reveal customer-facing suitability
` : ''}

PROVIDE YOUR ANALYSIS IN THE FOLLOWING JSON FORMAT (respond ONLY with valid JSON, no markdown):
{
  "overallScore": <number 0-100>,
  "traitScores": {
    "selfMotivation": <number 0-100>,
    "salesAptitude": <number 0-100>,
    "reliability": <number 0-100>,
    "dedication": <number 0-100>
  },
  "strengths": [<array of 3-5 specific strength points>],
  "redFlags": [<array of potential concerns, or empty array if none>],
  "recommendation": "<Hire|Maybe|No-Hire>",
  "problemAreas": [<array of 2-4 specific areas where the candidate could improve or potential weaknesses>],
  "reasoning": "<brief paragraph explaining the overall assessment>"
}

KEY EVALUATION CRITERIA:
- Self-Motivation: Hustle mentality, entrepreneurial spirit, initiative, making-a-plan attitude
- Sales Aptitude: Natural storytelling, warmth, persuasion through relationships, enthusiasm, ability to connect
- Reliability: Family/community responsibility, overcoming challenges, consistency, values-based commitment
- Dedication: Seeing job as opportunity (not just income), family provider mindset, desire for stability, brand pride`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert talent evaluator specializing in identifying natural sales talent in diverse, non-traditional candidate pools. You prioritize potential over polish and authenticity over perfection.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0].message.content
    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    const parsed = JSON.parse(responseText)

    return {
      overallScore: parsed.overallScore,
      traitScores: {
        selfMotivation: parsed.traitScores.selfMotivation,
        salesAptitude: parsed.traitScores.salesAptitude,
        reliability: parsed.traitScores.reliability,
        dedication: parsed.traitScores.dedication,
      },
      strengths: parsed.strengths,
      redFlags: parsed.redFlags || [],
      recommendation: parsed.recommendation,
      problemAreas: parsed.problemAreas,
      rawResponse: responseText,
    }
  } catch (error) {
    console.error('Error analyzing candidate:', error)
    throw new Error('Failed to analyze candidate responses')
  }
}
