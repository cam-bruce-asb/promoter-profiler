'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Mic, Square, Play, Trash2, Loader2 } from 'lucide-react'
import { transcribeAudio } from '@/app/actions/transcribe-audio'

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void
  onAudioRecorded?: (audioBlob: Blob | null) => void
  onAutoAdvance?: () => void
  initialText?: string
  questionNumber: number
}

export function VoiceRecorder({ onTranscriptionComplete, onAudioRecorded, onAutoAdvance, initialText = '', questionNumber }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcribedText, setTranscribedText] = useState(initialText)
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState('')
  const [liveTranscript, setLiveTranscript] = useState('')
  const [currentAudioBlob, setCurrentAudioBlob] = useState<Blob | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<any>(null)

  // Reset state when question changes
  useEffect(() => {
    setTranscribedText(initialText)
    setAudioURL(null)
    setIsRecording(false)
    setIsTranscribing(false)
    setLiveTranscript('')
    setError('')
    setRecordingTime(0)
  }, [questionNumber, initialText])

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      setError('')
      setLiveTranscript('')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Start Web Speech API for real-time transcription
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-ZA' // South African English
        
        recognition.onresult = (event: any) => {
          let interimTranscript = ''
          let finalTranscript = ''
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' '
            } else {
              interimTranscript += transcript
            }
          }
          
          setLiveTranscript(finalTranscript + interimTranscript)
        }
        
        recognition.start()
        recognitionRef.current = recognition
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        setCurrentAudioBlob(audioBlob)
        
        console.log(`Audio recorded for question ${questionNumber}, size: ${audioBlob.size} bytes`)
        
        // Notify parent component about the audio recording
        if (onAudioRecorded) {
          console.log(`Calling onAudioRecorded for question ${questionNumber}`)
          onAudioRecorded(audioBlob)
        } else {
          console.warn('onAudioRecorded callback not provided!')
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
        
        // Stop speech recognition
        if (recognitionRef.current) {
          recognitionRef.current.stop()
        }
        
        // Auto-advance immediately to next question
        if (onAutoAdvance) {
          onAutoAdvance()
        }
        
        // Auto-transcribe with Whisper in the background
        await handleTranscribe(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      setError('Could not access microphone. Please check permissions or type your answer below.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const handleTranscribe = async (audioBlob: Blob) => {
    setIsTranscribing(true)
    setError('')
    
    try {
      // Convert blob to file
      const audioFile = new File([audioBlob], `recording-q${questionNumber}.webm`, {
        type: 'audio/webm',
      })

      const formData = new FormData()
      formData.append('audio', audioFile)

      const result = await transcribeAudio(formData)

      if (result.success && result.text) {
        setTranscribedText(result.text)
        onTranscriptionComplete(result.text)
      } else {
        setError(result.error || 'Transcription failed')
      }
    } catch (err) {
      console.error('Error transcribing:', err)
      setError('Failed to transcribe. Please type your answer below.')
    } finally {
      setIsTranscribing(false)
    }
  }

  const deleteRecording = () => {
    setAudioURL(null)
    setTranscribedText('')
    setRecordingTime(0)
    setCurrentAudioBlob(null)
    
    // Notify parent that audio was deleted
    if (onAudioRecorded) {
      onAudioRecorded(null)
    }
    
    if (audioURL) {
      URL.revokeObjectURL(audioURL)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleTextChange = (text: string) => {
    setTranscribedText(text)
    onTranscriptionComplete(text)
  }

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="flex flex-col items-center space-y-4 p-6 bg-stone-50 rounded-lg border-2 border-stone-200">
        {!isRecording && !audioURL && (
          <Button
            type="button"
            onClick={startRecording}
            size="lg"
            className="w-full h-20 text-lg"
          >
            <Mic className="mr-2 h-6 w-6" />
            Record Your Answer
          </Button>
        )}

        {isRecording && (
          <div className="w-full space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                <span className="text-lg font-medium">Recording...</span>
              </div>
              <span className="text-2xl font-mono">{formatTime(recordingTime)}</span>
            </div>
            
            {/* Live Transcript */}
            {liveTranscript && (
              <div className="p-3 bg-stone-100 rounded border border-stone-300">
                <p className="text-xs text-stone-500 mb-1">Live transcription:</p>
                <p className="text-sm text-stone-700 italic">{liveTranscript}</p>
              </div>
            )}
            
            <Button
              type="button"
              onClick={stopRecording}
              size="lg"
              variant="destructive"
              className="w-full h-16"
            >
              <Square className="mr-2 h-5 w-5" />
              Stop Recording
            </Button>
          </div>
        )}

        {audioURL && !isTranscribing && (
          <div className="w-full space-y-3">
            <audio src={audioURL} controls className="w-full" />
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={deleteRecording}
                variant="outline"
                className="flex-1"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Re-record
              </Button>
            </div>
          </div>
        )}

        {isTranscribing && (
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg">Transcribing your answer...</span>
          </div>
        )}

        {error && (
          <div className="w-full p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            {error}
          </div>
        )}
      </div>

      {/* Transcribed Text / Manual Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-700">
          {transcribedText ? 'Your transcribed answer (you can edit if needed):' : 'Voice recording is required for this question'}
        </label>
        {transcribedText ? (
          <Textarea
            value={transcribedText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Your transcribed answer..."
            rows={6}
            className="resize-none"
          />
        ) : (
          <div className="p-6 border-2 border-dashed border-stone-300 rounded-lg text-center text-stone-500">
            <Mic className="mx-auto h-8 w-8 mb-2 text-stone-400" />
            <p className="text-sm">Please record your voice answer using the button above</p>
            <p className="text-xs mt-1">Voice recording helps us understand your personality and communication style</p>
          </div>
        )}
      </div>
    </div>
  )
}
