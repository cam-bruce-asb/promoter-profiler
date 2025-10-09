'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Trash2, AlertTriangle, FileAudio, BarChart3, User } from 'lucide-react'

interface DeleteCandidateButtonProps {
  candidateId: string
  candidateName: string
}

export function DeleteCandidateButton({ 
  candidateId, 
  candidateName 
}: DeleteCandidateButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const response = await fetch('/api/delete-candidate', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete candidate')
      }

      const result = await response.json()
      
      if (result.success) {
        // Redirect to admin dashboard after successful deletion
        router.push('/admin')
      } else {
        throw new Error(result.error || 'Delete failed')
      }
    } catch (error) {
      console.error('Error deleting candidate:', error)
      alert('Failed to delete candidate. Please try again.')
    } finally {
      setIsDeleting(false)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete candidate</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Candidate
          </DialogTitle>
          <DialogDescription className="text-left">
            This action cannot be undone. The following data will be permanently deleted:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <User className="h-4 w-4 text-gray-600" />
            <div>
              <div className="font-medium text-gray-900">{candidateName}</div>
              <div className="text-sm text-gray-600">Candidate profile and contact information</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <BarChart3 className="h-4 w-4 text-gray-600" />
            <div>
              <div className="font-medium text-gray-900">AI Analysis</div>
              <div className="text-sm text-gray-600">Scores, recommendations, and assessment data</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <FileAudio className="h-4 w-4 text-gray-600" />
            <div>
              <div className="font-medium text-gray-900">Audio Recordings</div>
              <div className="text-sm text-gray-600">All voice recordings and transcripts</div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeleting ? (
              <>
                <Trash2 className="mr-2 h-4 w-4 animate-pulse" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Permanently
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
