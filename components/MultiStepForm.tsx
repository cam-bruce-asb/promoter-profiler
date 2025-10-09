'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { VoiceRecorder } from '@/components/VoiceRecorder'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { submitCandidateForm } from '@/app/actions/submit-form'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'

interface FormData {
  // Step 1 - Basic Info (simplified)
  fullName: string
  email: string
  phone: string
  
  // Steps 2-8 - Questions
  question1: string
  question2: string
  question3: string
  question4: string
  question5: string
  question6: string
  question7: string
}

const initialFormData: FormData = {
  fullName: '',
  email: '',
  phone: '',
  question1: '',
  question2: '',
  question3: '',
  question4: '',
  question5: '',
  question6: '',
  question7: '',
}

const questions = [
  "Tell us about a time you helped someone choose a product. What did you do?",
  "Imagine a customer says no to your product. How would you feel and what would you do?",
  "What makes you want to work as a promoter? What excites you about it?",
  "Tell us about a time you had to solve a problem without help. What happened?",
  "How do you get along with people? Give us an example.",
  "What would you do if you had a bad day but still had to work?",
  "Why should we choose you for this position?",
]

const TOTAL_STEPS = 9 // 1 basic info + 7 questions + 1 review

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData, clearFormData] = useLocalStorage<FormData>('candidate-form-progress', initialFormData)
  const [audioBlobs, setAudioBlobs] = useState<{[key: string]: Blob | null}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value })
  }

  const updateAudioBlob = (questionNumber: number, blob: Blob | null) => {
    console.log(`updateAudioBlob called for question${questionNumber}, blob:`, blob ? `${blob.size} bytes` : 'null')
    const newBlobs = { ...audioBlobs, [`question${questionNumber}`]: blob }
    console.log('Updated audioBlobs state:', Object.keys(newBlobs))
    setAudioBlobs(newBlobs)
  }

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.fullName && formData.email && formData.phone)
      case 2: return !!(formData.question1 && audioBlobs.question1)
      case 3: return !!(formData.question2 && audioBlobs.question2)
      case 4: return !!(formData.question3 && audioBlobs.question3)
      case 5: return !!(formData.question4 && audioBlobs.question4)
      case 6: return !!(formData.question5 && audioBlobs.question5)
      case 7: return !!(formData.question6 && audioBlobs.question6)
      case 8: return !!(formData.question7 && audioBlobs.question7)
      default: return true
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      // Debug: Log audioBlobs state
      console.log('Audio blobs state:', Object.keys(audioBlobs))
      console.log('Audio blob sizes:', Object.entries(audioBlobs).map(([k, v]) => `${k}: ${v?.size || 0}`))
      
      // Validate that all questions have audio recordings
      const missingAudio = []
      for (let i = 1; i <= 7; i++) {
        if (!audioBlobs[`question${i}`]) {
          missingAudio.push(i)
        }
      }

      if (missingAudio.length > 0) {
        setError(`Voice recording is required for question${missingAudio.length > 1 ? 's' : ''} ${missingAudio.join(', ')}. Please go back and record your answers.`)
        setIsSubmitting(false)
        return
      }

      const formDataToSubmit = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        // Convert ageVerified boolean to 'on' if true (checkbox behavior)
        if (key === 'ageVerified' && value === true) {
          formDataToSubmit.append(key, 'on')
        } else {
          formDataToSubmit.append(key, value.toString())
        }
      })

      const result = await submitCandidateForm(formDataToSubmit)

      if (result.success && result.candidateId) {
        console.log('Form submitted successfully, candidateId:', result.candidateId)
        console.log('Audio blobs to upload:', Object.keys(audioBlobs))
        console.log('Audio blob details:', Object.entries(audioBlobs).map(([k, v]) => `${k}: ${v ? 'exists' : 'null'}`))
        
        // Upload audio files directly to Supabase storage from client
        if (Object.keys(audioBlobs).length > 0) {
          console.log('Starting audio upload...')
          try {
            const supabase = createClient()
            const audioUrls: { [key: string]: string } = {}
            
            for (const [key, blob] of Object.entries(audioBlobs)) {
              if (blob) {
                const fileName = `${result.candidateId}/${key}-${Date.now()}.webm`
                
                const { data, error } = await supabase.storage
                  .from('candidate-audio')
                  .upload(fileName, blob, {
                    contentType: 'audio/webm',
                    upsert: false,
                  })

                if (error) {
                  console.error(`Error uploading ${key}:`, error)
                  continue
                }

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                  .from('candidate-audio')
                  .getPublicUrl(fileName)

                audioUrls[key] = publicUrl
              }
            }
            
            // Update candidate record with audio URLs
            if (Object.keys(audioUrls).length > 0) {
              const { error: updateError } = await supabase
                .from('candidates')
                .update({ audio_urls: audioUrls })
                .eq('id', result.candidateId)

              if (updateError) {
                console.error('Error updating candidate with audio URLs:', updateError)
              } else {
                console.log('Audio files uploaded successfully')
                
                // Trigger audio analysis via API route
                fetch('/api/analyze-audio', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ candidateId: result.candidateId })
                }).then(res => res.json())
                  .then(data => console.log('Audio analysis triggered:', data))
                  .catch(err => console.error('Failed to trigger audio analysis:', err))
              }
            }
          } catch (audioError) {
            console.error('Error processing audio:', audioError)
            // Continue anyway - form submission was successful
          }
        }

        setIsSubmitted(true)
        clearFormData()
      } else {
        setError(result.error || 'Something went wrong. Please try again.')
      }
    } catch (err) {
      console.error('Form submission error:', err)
      setError(`Failed to submit form: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl text-green-600">Thank You!</CardTitle>
            <CardDescription className="text-lg mt-4">
              We&apos;ve received your application. Our team will review your responses and get back to you soon.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-stone-900 mb-3">
            In-Store Promoter Application
          </h1>
          <p className="text-lg text-stone-600">
            Step {currentStep} of {TOTAL_STEPS}
          </p>
          {currentStep >= 2 && currentStep <= 8 && (
            <p className="text-sm text-stone-500 mt-2">
              🎤 Voice recording required for all questions
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-stone-200 rounded-full h-3">
            <div
              className="bg-stone-900 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Your Information</h2>
                  <p className="text-stone-600">Let us know how to reach you</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="e.g., 073 123 4567"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Steps 2-8: Voice Questions */}
            {currentStep >= 2 && currentStep <= 8 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Question {currentStep - 1}</h2>
                  <p className="text-lg text-stone-700 leading-relaxed">
                    {questions[currentStep - 2]}
                  </p>
                </div>

                <VoiceRecorder
                  key={currentStep} // Force re-render when step changes
                  questionNumber={currentStep - 1}
                  initialText={formData[`question${currentStep - 1}` as keyof FormData] as string}
                  onTranscriptionComplete={(text) => 
                    updateField(`question${currentStep - 1}` as keyof FormData, text)
                  }
                  onAudioRecorded={(blob) => updateAudioBlob(currentStep - 1, blob)}
                  onAutoAdvance={nextStep}
                />
              </div>
            )}

            {/* Step 9: Review */}
            {currentStep === 9 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Review Your Application</h2>
                  <p className="text-stone-600">Please review your answers before submitting</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-stone-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <div className="text-sm space-y-1 text-stone-700">
                      <p><strong>Name:</strong> {formData.fullName}</p>
                      <p><strong>Email:</strong> {formData.email}</p>
                      <p><strong>Phone:</strong> {formData.phone}</p>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => goToStep(1)}
                      className="mt-2 p-0 h-auto"
                    >
                      Edit
                    </Button>
                  </div>

                  {questions.map((question, index) => {
                    const hasAudio = !!audioBlobs[`question${index + 1}`]
                    return (
                      <div key={index} className="p-4 bg-stone-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">Question {index + 1}</h3>
                          {hasAudio ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              🎤 Voice recorded
                            </span>
                          ) : (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                              ⚠️ No audio
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-stone-600 mb-2">{question}</p>
                        <p className="text-sm text-stone-800">
                          {formData[`question${index + 1}` as keyof FormData] || '(No answer)'}
                        </p>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => goToStep(index + 2)}
                          className="mt-2 p-0 h-auto"
                        >
                          Edit
                        </Button>
                      </div>
                    )
                  })}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {currentStep < TOTAL_STEPS && (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedFromStep(currentStep)}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}

              {currentStep === TOTAL_STEPS && (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save Progress Indicator */}
        <p className="text-center text-sm text-stone-500 mt-4">
          Your progress is automatically saved
        </p>
      </div>
    </div>
  )
}
