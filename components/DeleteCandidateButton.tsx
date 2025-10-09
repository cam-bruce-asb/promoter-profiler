'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle } from 'lucide-react'

interface DeleteCandidateButtonProps {
  candidateId: string
  candidateName: string
}

export function DeleteCandidateButton({ 
  candidateId, 
  candidateName 
}: DeleteCandidateButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
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
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">Are you sure?</span>
        </div>
        <Button 
          onClick={handleDelete} 
          disabled={isDeleting}
          variant="destructive"
          size="sm"
        >
          {isDeleting ? (
            <>
              <Trash2 className="mr-2 h-4 w-4 animate-pulse" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Yes, Delete
            </>
          )}
        </Button>
        <Button 
          onClick={() => setShowConfirm(false)} 
          disabled={isDeleting}
          variant="outline"
          size="sm"
        >
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Button 
      onClick={() => setShowConfirm(true)} 
      disabled={isDeleting}
      variant="destructive"
      size="sm"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Delete Candidate
    </Button>
  )
}
