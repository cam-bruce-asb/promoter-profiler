'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface TriggerAnalysisButtonProps {
  candidateId: string
  candidateName: string
  onAnalysisComplete?: () => void
}

export function TriggerAnalysisButton({ 
  candidateId, 
  candidateName, 
  onAnalysisComplete 
}: TriggerAnalysisButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const triggerAnalysis = async () => {
    setIsAnalyzing(true)
    
    try {
      const response = await fetch('/api/trigger-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId,
          candidateName,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to trigger analysis')
      }

      const result = await response.json()
      
      if (result.success) {
        // Wait a moment for the analysis to complete
        setTimeout(() => {
          onAnalysisComplete?.()
          window.location.reload()
        }, 2000)
      } else {
        throw new Error(result.error || 'Analysis failed')
      }
    } catch (error) {
      console.error('Error triggering analysis:', error)
      alert('Failed to trigger analysis. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-stone-500">
        AI analysis is missing for this candidate. Click below to trigger the analysis.
      </p>
      <Button 
        onClick={triggerAnalysis} 
        disabled={isAnalyzing}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {isAnalyzing ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Trigger AI Analysis
          </>
        )}
      </Button>
    </div>
  )
}
