'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface ReanalyzeAudioButtonProps {
  candidateId: string
  hasAudioUrls: boolean
}

export function ReanalyzeAudioButton({ candidateId, hasAudioUrls }: ReanalyzeAudioButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [message, setMessage] = useState('')

  // Debug on mount
  useEffect(() => {
    console.log('ReanalyzeAudioButton - candidateId:', candidateId)
    console.log('ReanalyzeAudioButton - hasAudioUrls:', hasAudioUrls)
  }, [candidateId, hasAudioUrls])

  const handleReanalyze = async () => {
    if (!hasAudioUrls) {
      setMessage('No audio recordings found for this candidate')
      return
    }

    setIsAnalyzing(true)
    setMessage('')

    try {
      const response = await fetch('/api/analyze-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Audio analysis complete! Refresh the page to see results.')
      } else {
        setMessage(`Error: ${data.error || 'Failed to analyze audio'}`)
      }
    } catch (error) {
      setMessage('Failed to trigger audio analysis')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleReanalyze}
        disabled={isAnalyzing || !hasAudioUrls}
        variant="outline"
        size="sm"
        title={!hasAudioUrls ? 'No audio recordings found' : 'Click to analyze audio tone'}
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
        {isAnalyzing ? 'Analyzing Audio...' : 'Analyze Audio Tone'}
      </Button>
      {!hasAudioUrls && (
        <p className="text-xs text-stone-500">
          No audio recordings found for this candidate
        </p>
      )}
      {message && (
        <p className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
