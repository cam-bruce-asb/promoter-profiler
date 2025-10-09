'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleLogout}
      className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
    >
      Logout
    </Button>
  )
}
