import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import { ReanalyzeAudioButton } from '@/components/ReanalyzeAudioButton'
import { SyncAudioButton } from '@/components/SyncAudioButton'

interface CandidateDetailProps {
  params: Promise<{ id: string }>
}

export default async function CandidateDetail({ params }: CandidateDetailProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // Fetch candidate with analysis
  const { data: candidate, error } = await supabase
    .from('candidates')
    .select(`
      *,
      analyses (*)
    `)
    .eq('id', id)
    .single()

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Candidate Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/admin">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const analysis = candidate.analyses?.[0]
  const responses = candidate.responses as Record<string, string>

  const questions = [
    { key: 'question1', text: 'Tell us about a time you helped someone choose a product. What did you do?' },
    { key: 'question2', text: 'Imagine a customer says no to your product. How would you feel and what would you do?' },
    { key: 'question3', text: 'What makes you want to work as a promoter? What excites you about it?' },
    { key: 'question4', text: 'Tell us about a time you had to solve a problem without help. What happened?' },
    { key: 'question5', text: 'How do you get along with people? Give us an example.' },
    { key: 'question6', text: 'What would you do if you had a bad day but still had to work?' },
    { key: 'question7', text: 'Why should we choose you for this position?' },
  ]

  function getScoreBadge(score: number) {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-red-100 text-red-800 border-red-300'
  }

  function getRecommendationBadge(recommendation: string) {
    const colors = {
      Hire: 'bg-green-100 text-green-800 border-green-300',
      Maybe: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'No-Hire': 'bg-red-100 text-red-800 border-red-300',
    }
    return colors[recommendation as keyof typeof colors] || 'bg-stone-100 text-stone-800'
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-stone-900 mb-2">
                {candidate.full_name}
              </h1>
              <p className="text-stone-600">
                Submitted on {new Date(candidate.created_at).toLocaleDateString('en-ZA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              {candidate.audio_urls && Object.keys(candidate.audio_urls as object).length > 0 ? (
                <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-300">
                  🎤 {Object.keys(candidate.audio_urls as object).length} Audio Recording{Object.keys(candidate.audio_urls as object).length > 1 ? 's' : ''} Linked
                </Badge>
              ) : (
                <Badge variant="outline" className="mt-2 bg-yellow-50 text-yellow-700 border-yellow-300">
                  ⚠️ Audio Files Not Linked (Click &quot;Sync &amp; Analyze Audio&quot;)
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <SyncAudioButton candidateId={candidate.id} />
              {candidate.audio_urls && (
                <ReanalyzeAudioButton 
                  candidateId={candidate.id} 
                  hasAudioUrls={!!candidate.audio_urls}
                />
              )}
            </div>
          </div>

          {/* AI Analysis Summary */}
          {analysis ? (
            <Card className="border-2 border-stone-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>AI Analysis {analysis.audio_tone_analysis ? '(Including Voice Analysis)' : ''}</span>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={`text-2xl py-2 px-4 ${getScoreBadge(analysis.overall_score)}`}
                    >
                      {analysis.overall_score}/100
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-lg py-2 px-4 ${getRecommendationBadge(analysis.recommendation)}`}
                    >
                      {analysis.recommendation}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Trait Scores */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Trait Scores</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.trait_scores && (
                      <>
                        <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                          <span className="font-medium">Self-Motivation</span>
                          <Badge variant="outline" className={getScoreBadge(analysis.trait_scores.selfMotivation)}>
                            {analysis.trait_scores.selfMotivation}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                          <span className="font-medium">Sales Aptitude</span>
                          <Badge variant="outline" className={getScoreBadge(analysis.trait_scores.salesAptitude)}>
                            {analysis.trait_scores.salesAptitude}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                          <span className="font-medium">Reliability</span>
                          <Badge variant="outline" className={getScoreBadge(analysis.trait_scores.reliability)}>
                            {analysis.trait_scores.reliability}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                          <span className="font-medium">Dedication</span>
                          <Badge variant="outline" className={getScoreBadge(analysis.trait_scores.dedication)}>
                            {analysis.trait_scores.dedication}
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Strengths */}
                {analysis.strengths && analysis.strengths.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-green-700">Key Strengths</h3>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-600 mr-2">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Red Flags */}
                {analysis.red_flags && analysis.red_flags.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-red-700">Potential Concerns</h3>
                    <ul className="space-y-2">
                      {analysis.red_flags.map((flag: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-600 mr-2">⚠</span>
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Interview Focus */}
                {analysis.interview_focus && analysis.interview_focus.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Interview Focus Areas</h3>
                    <ul className="space-y-2">
                      {analysis.interview_focus.map((focus: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-stone-600 mr-2">→</span>
                          <span>{focus}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Voice & Tone Analysis */}
                {analysis.audio_tone_analysis && analysis.audio_tone_analysis.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <span className="mr-2">🎤</span>
                      Voice & Tone Analysis
                    </h3>
                    
                    {/* Overall Voice Summary */}
                    <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-3">AI Commentary on Vocal Delivery</h4>
                      <div className="space-y-3">
                        {analysis.audio_tone_analysis.map((toneAnalysis: any, index: number) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium text-blue-800">Q{toneAnalysis.questionNumber}:</span>
                            <span className="text-blue-900 ml-2">{toneAnalysis.insights}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Detailed Metrics */}
                    <div className="space-y-4">
                      {analysis.audio_tone_analysis.map((toneAnalysis: any, index: number) => (
                        <details key={index} className="p-4 bg-stone-50 rounded-lg border border-stone-200">
                          <summary className="font-medium cursor-pointer hover:text-stone-600">
                            Question {toneAnalysis.questionNumber} - Detailed Voice Metrics
                          </summary>
                          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div className="p-2 bg-white rounded border border-stone-200">
                              <span className="text-xs text-stone-600">Confidence:</span>
                              <p className="font-medium capitalize text-lg">{toneAnalysis.confidence}</p>
                            </div>
                            <div className="p-2 bg-white rounded border border-stone-200">
                              <span className="text-xs text-stone-600">Enthusiasm:</span>
                              <p className="font-medium capitalize text-lg">{toneAnalysis.enthusiasm}</p>
                            </div>
                            <div className="p-2 bg-white rounded border border-stone-200">
                              <span className="text-xs text-stone-600">Speech Pace:</span>
                              <p className="font-medium capitalize text-lg">{toneAnalysis.speechPace}</p>
                            </div>
                            <div className="p-2 bg-white rounded border border-stone-200">
                              <span className="text-xs text-stone-600">Clarity:</span>
                              <p className="font-medium capitalize text-lg">{toneAnalysis.clarity}</p>
                            </div>
                            <div className="p-2 bg-white rounded border border-stone-200">
                              <span className="text-xs text-stone-600">Naturalness:</span>
                              <p className="font-medium capitalize text-lg">{toneAnalysis.naturalness.replace('-', ' ')}</p>
                            </div>
                            <div className="p-2 bg-white rounded border border-stone-200">
                              <span className="text-xs text-stone-600">Tone:</span>
                              <p className="font-medium capitalize text-sm">{toneAnalysis.tone.join(', ')}</p>
                            </div>
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-stone-500">AI analysis in progress... Please refresh the page in a moment.</p>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-stone-600">Email</label>
                  <p className="text-stone-900">{candidate.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600">Phone</label>
                  <p className="text-stone-900">{candidate.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600">Location</label>
                  <p className="text-stone-900">{candidate.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600">Age Verified</label>
                  <p className="text-stone-900">{candidate.age_verified ? 'Yes (21+)' : 'No'}</p>
                </div>
                {candidate.product_comfort && (
                  <div>
                    <label className="text-sm font-medium text-stone-600">Product Comfort Level</label>
                    <p className="text-stone-900 capitalize">{candidate.product_comfort.replace('-', ' ')}</p>
                  </div>
                )}
              </div>
              {candidate.previous_experience && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-stone-600">Previous Experience</label>
                  <p className="text-stone-900 mt-1">{candidate.previous_experience}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Question Responses */}
          <Card>
            <CardHeader>
              <CardTitle>Question Responses</CardTitle>
              <CardDescription>
                The candidate&apos;s answers to the personality assessment questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.map((question, index) => {
                const audioUrls = candidate.audio_urls as Record<string, string> | null
                const audioUrl = audioUrls?.[`question${index + 1}`]
                
                return (
                  <div key={question.key} className="border-b border-stone-200 pb-4 last:border-0">
                    <h4 className="font-medium text-stone-900 mb-2">
                      {index + 1}. {question.text}
                    </h4>
                    
                    {/* Audio Player */}
                    {audioUrl && (
                      <div className="mb-3 p-3 bg-stone-50 rounded border border-stone-200">
                        <p className="text-xs text-stone-600 mb-2">🎤 Voice Recording:</p>
                        <audio controls className="w-full" preload="metadata">
                          <source src={audioUrl} type="audio/webm" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                    
                    {/* Text Response */}
                    <p className="text-stone-700 whitespace-pre-wrap">
                      {responses[question.key] || 'No response'}
                    </p>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
