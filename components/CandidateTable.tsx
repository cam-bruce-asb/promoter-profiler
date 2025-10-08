'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'

interface Candidate {
  id: string
  full_name: string
  email: string
  phone: string
  location: string
  created_at: string
  analyses: Array<{
    overall_score: number
    recommendation: string
  }>
}

interface CandidateTableProps {
  candidates: Candidate[]
}

export function CandidateTable({ candidates }: CandidateTableProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCandidates = candidates.filter((candidate) => {
    const query = searchQuery.toLowerCase()
    return (
      candidate.full_name.toLowerCase().includes(query) ||
      candidate.email.toLowerCase().includes(query) ||
      candidate.location.toLowerCase().includes(query)
    )
  })

  function getRecommendationBadge(recommendation: string) {
    const colors = {
      Hire: 'bg-green-100 text-green-800 border-green-300',
      Maybe: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'No-Hire': 'bg-red-100 text-red-800 border-red-300',
    }
    return colors[recommendation as keyof typeof colors] || 'bg-stone-100 text-stone-800'
  }

  function getScoreBadge(score: number) {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-red-100 text-red-800 border-red-300'
  }

  return (
    <>
      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-white border-y border-stone-200 py-3 px-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            type="text"
            placeholder="Search by name, email, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 rounded-none border-stone-200"
          />
        </div>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="h-9"
          >
            Clear
          </Button>
        )}
        <div className="text-sm text-stone-600 ml-auto">
          {filteredCandidates.length} of {candidates.length}
        </div>
      </div>

      {/* Table */}
      {filteredCandidates.length === 0 ? (
        <div className="text-center py-12 text-stone-500 bg-white border-b border-stone-200">
          {searchQuery ? 'No candidates found matching your search.' : 'No candidates yet. Applications will appear here once submitted.'}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border-b border-stone-200">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-stone-200 hover:bg-transparent">
                <TableHead className="h-9 text-xs font-semibold border-r border-stone-200">Name</TableHead>
                <TableHead className="h-9 text-xs font-semibold border-r border-stone-200">Location</TableHead>
                <TableHead className="h-9 text-xs font-semibold border-r border-stone-200">Contact</TableHead>
                <TableHead className="h-9 text-xs font-semibold border-r border-stone-200">Submitted</TableHead>
                <TableHead className="h-9 text-xs font-semibold border-r border-stone-200">Score</TableHead>
                <TableHead className="h-9 text-xs font-semibold border-r border-stone-200">Recommendation</TableHead>
                <TableHead className="h-9 text-xs font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.map((candidate) => {
                const analysis = candidate.analyses?.[0]
                const hasAnalysis = !!analysis

                return (
                  <TableRow key={candidate.id} className="border-b border-stone-200">
                    <TableCell className="font-medium py-2 text-sm border-r border-stone-200">
                      {candidate.full_name}
                    </TableCell>
                    <TableCell className="py-2 text-sm border-r border-stone-200">{candidate.location}</TableCell>
                    <TableCell className="py-2 border-r border-stone-200">
                      <div className="text-xs space-y-0.5">
                        <div className="text-stone-900">{candidate.email}</div>
                        <div className="text-stone-500">{candidate.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-sm border-r border-stone-200">
                      {new Date(candidate.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="py-2 border-r border-stone-200">
                      {hasAnalysis ? (
                        <Badge
                          variant="outline"
                          className={`${getScoreBadge(analysis.overall_score)} rounded-none text-xs py-0.5`}
                        >
                          {analysis.overall_score}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-stone-100 text-stone-600 rounded-none text-xs py-0.5">
                          Analyzing...
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-2 border-r border-stone-200">
                      {hasAnalysis ? (
                        <Badge
                          variant="outline"
                          className={`${getRecommendationBadge(analysis.recommendation)} rounded-none text-xs py-0.5`}
                        >
                          {analysis.recommendation}
                        </Badge>
                      ) : (
                        <span className="text-stone-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      <Link href={`/admin/candidate/${candidate.id}`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs rounded-none">
                          View Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}
