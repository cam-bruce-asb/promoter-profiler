'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Link as LinkIcon, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SyncAudioButtonProps {
  candidateId: string
}

export function SyncAudioButton({ candidateId }: SyncAudioButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSync = async () => {
    setIsSyncing(true)
    setMessage('')

    try {
      // First, sync the audio files from storage
      const syncResponse = await fetch('/api/sync-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId })
      })

      const syncData = await syncResponse.json()

      if (!syncResponse.ok) {
        setMessage(`Error: ${syncData.error || 'Failed to sync audio files'}`)
        setIsSyncing(false)
        return
      }

      if (syncData.audioUrls && Object.keys(syncData.audioUrls).length > 0) {
        setMessage(`✓ Synced ${Object.keys(syncData.audioUrls).length} audio files. Analyzing tone...`)
        
        // Then trigger audio analysis
        const analysisResponse = await fetch('/api/analyze-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateId })
        })

        const analysisData = await analysisResponse.json()

        if (analysisResponse.ok) {
          setMessage('✓ Audio synced and analyzed! Refreshing page...')
          setTimeout(() => {
            router.refresh()
          }, 1500)
        } else {
          setMessage(`✓ Audio synced. Analysis failed: ${analysisData.error || 'Unknown error'}`)
        }
      } else {
        setMessage(syncData.message || 'No audio files found in storage')
      }
    } catch (error) {
      setMessage('Failed to sync audio files')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSync}
        disabled={isSyncing}
        variant="default"
        size="sm"
      >
        <LinkIcon className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-pulse' : ''}`} />
        {isSyncing ? 'Syncing Audio...' : 'Sync & Analyze Audio'}
      </Button>
      {message && (
        <p className={`text-sm ${message.includes('Error') || message.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
