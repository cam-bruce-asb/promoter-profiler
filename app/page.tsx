'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { submitCandidateForm } from './actions/submit-form'

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await submitCandidateForm(formData)
      
      if (result.success) {
        setIsSubmitted(true)
      } else {
        setError(result.error || 'Something went wrong. Please try again.')
      }
    } catch (err) {
      setError('Failed to submit form. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-green-600">Thank You!</CardTitle>
            <CardDescription className="text-lg mt-4">
              We've received your application. Our team will review your responses and get back to you soon.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-stone-900 mb-3">
            In-Store Promoter Application
          </h1>
          <p className="text-lg text-stone-600">
            Tell us about yourself! We want to know what makes you great at connecting with people.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>
                Let us know how to reach you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  required
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="e.g., 073 123 4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Where do you live? *</Label>
                <Input
                  id="location"
                  name="location"
                  required
                  placeholder="City or area"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">When can you work? *</Label>
                <Select name="availability" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="weekends">Weekends only</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="ageVerified" name="ageVerified" required />
                <Label
                  htmlFor="ageVerified"
                  className="text-sm font-normal cursor-pointer"
                >
                  I confirm I am 21 years or older *
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="productComfort">
                  How comfortable are you promoting alcohol products?
                </Label>
                <Select name="productComfort">
                  <SelectTrigger>
                    <SelectValue placeholder="Select comfort level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="very-comfortable">Very comfortable</SelectItem>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="somewhat-uncomfortable">Somewhat uncomfortable</SelectItem>
                    <SelectItem value="uncomfortable">Uncomfortable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="previousExperience">
                  Previous sales or retail experience (optional)
                </Label>
                <Textarea
                  id="previousExperience"
                  name="previousExperience"
                  placeholder="Tell us about any previous work experience you have..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tell Us About You</CardTitle>
              <CardDescription>
                Answer these questions honestly. There are no wrong answers - we just want to know the real you!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="question1" className="text-base font-medium">
                  1. Tell us about a time you helped someone choose a product. What did you do? *
                </Label>
                <Textarea
                  id="question1"
                  name="question1"
                  required
                  placeholder="Share your story here..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="question2" className="text-base font-medium">
                  2. Imagine a customer says no to your product. How would you feel and what would you do? *
                </Label>
                <Textarea
                  id="question2"
                  name="question2"
                  required
                  placeholder="Tell us how you would handle this..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="question3" className="text-base font-medium">
                  3. What makes you want to work as a promoter? What excites you about it? *
                </Label>
                <Textarea
                  id="question3"
                  name="question3"
                  required
                  placeholder="Share what motivates you..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="question4" className="text-base font-medium">
                  4. Tell us about a time you had to solve a problem without help. What happened? *
                </Label>
                <Textarea
                  id="question4"
                  name="question4"
                  required
                  placeholder="Describe the situation..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="question5" className="text-base font-medium">
                  5. How do you get along with people? Give us an example. *
                </Label>
                <Textarea
                  id="question5"
                  name="question5"
                  required
                  placeholder="Tell us about your people skills..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="question6" className="text-base font-medium">
                  6. What would you do if you had a bad day but still had to work? *
                </Label>
                <Textarea
                  id="question6"
                  name="question6"
                  required
                  placeholder="How would you handle this situation..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="question7" className="text-base font-medium">
                  7. Why should we choose you for this position? *
                </Label>
                <Textarea
                  id="question7"
                  name="question7"
                  required
                  placeholder="Tell us what makes you special..."
                  rows={4}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </form>
      </div>
    </main>
  )
}