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

      <main className="container mx-auto px-4 py-6 space-y-4">
        <CandidateTable candidates={candidateList} />
      </main>
    </div>
  )
}
