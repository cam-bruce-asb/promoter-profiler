import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { LogoutButton } from '@/components/LogoutButton'

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

export default async function AdminDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // Fetch all candidates with their analyses
  const { data: candidates, error } = await supabase
    .from('candidates')
    .select(`
      id,
      full_name,
      email,
      phone,
      location,
      created_at,
      analyses (
        overall_score,
        recommendation
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching candidates:', error)
  }

  const candidateList = (candidates || []) as Candidate[]

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
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-stone-900">
            Candidate Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-stone-600">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>All Candidates ({candidateList.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {candidateList.length === 0 ? (
              <div className="text-center py-12 text-stone-500">
                No candidates yet. Applications will appear here once submitted.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Recommendation</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidateList.map((candidate) => {
                      const analysis = candidate.analyses?.[0]
                      const hasAnalysis = !!analysis

                      return (
                        <TableRow key={candidate.id}>
                          <TableCell className="font-medium">
                            {candidate.full_name}
                          </TableCell>
                          <TableCell>{candidate.location}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{candidate.email}</div>
                              <div className="text-stone-500">{candidate.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(candidate.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {hasAnalysis ? (
                              <Badge
                                variant="outline"
                                className={getScoreBadge(analysis.overall_score)}
                              >
                                {analysis.overall_score}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-stone-100 text-stone-600">
                                Analyzing...
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {hasAnalysis ? (
                              <Badge
                                variant="outline"
                                className={getRecommendationBadge(analysis.recommendation)}
                              >
                                {analysis.recommendation}
                              </Badge>
                            ) : (
                              <span className="text-stone-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Link href={`/admin/candidate/${candidate.id}`}>
                              <Button variant="outline" size="sm">
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
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
