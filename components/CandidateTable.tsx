'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, X, Users } from 'lucide-react'

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

  const filteredCandidates = useMemo(() => {
    if (!searchQuery) return candidates

    const query = searchQuery.toLowerCase()
    return candidates.filter((candidate) =>
      candidate.full_name.toLowerCase().includes(query) ||
      candidate.email.toLowerCase().includes(query) ||
      candidate.location.toLowerCase().includes(query)
    )
  }, [candidates, searchQuery])

  const clearSearch = () => setSearchQuery('')

  function getRecommendationBadge(recommendation: string) {
    const colors = {
      Hire: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Maybe: 'bg-amber-50 text-amber-700 border-amber-200',
      'No-Hire': 'bg-red-50 text-red-700 border-red-200',
    }
    return colors[recommendation as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200'
  }

  function getScoreBadge(score: number) {
    if (score >= 70) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (score >= 60) return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-red-50 text-red-700 border-red-200'
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="border-0 shadow-sm bg-white">
        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by name, email, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>
                {filteredCandidates.length} of {candidates.length} candidates
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm bg-white overflow-hidden">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No candidates found' : 'No candidates yet'}
            </h3>
            <p className="text-sm text-gray-500">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Applications will appear here once submitted'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 border-b border-gray-200 hover:bg-gray-50/50">
                  <TableHead className="font-semibold text-gray-900 py-4 px-6">Name</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4 px-6">Location</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4 px-6">Contact</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4 px-6">Submitted</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4 px-6 text-center">Score</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4 px-6 text-center">Recommendation</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4 px-6 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.map((candidate) => {
                  const analysis = candidate.analyses?.[0]
                  const hasAnalysis = !!analysis

                  return (
                    <TableRow 
                      key={candidate.id} 
                      className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="py-4 px-6">
                        <div className="font-medium text-gray-900">{candidate.full_name}</div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-gray-600">
                        {candidate.location}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900">{candidate.email}</div>
                          <div className="text-sm text-gray-500">{candidate.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-gray-600">
                        {new Date(candidate.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        {hasAnalysis ? (
                          <Badge
                            variant="outline"
                            className={`font-semibold ${getScoreBadge(analysis.overall_score)}`}
                          >
                            {analysis.overall_score}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                            Analyzing...
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        {hasAnalysis ? (
                          <Badge
                            variant="outline"
                            className={`font-medium ${getRecommendationBadge(analysis.recommendation)}`}
                          >
                            {analysis.recommendation}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <Link href={`/admin/candidate/${candidate.id}`}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                          >
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
      </Card>
    </div>
  )
}