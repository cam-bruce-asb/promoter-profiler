import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/LogoutButton'
import { CandidateTable } from '@/components/CandidateTable'

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

      return (
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-6 py-5 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                  Candidate Dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage and review candidate applications
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <LogoutButton />
              </div>
            </div>
          </header>

          <main className="container mx-auto px-6 py-8">
            <CandidateTable candidates={candidateList} />
          </main>
        </div>
      )
}
