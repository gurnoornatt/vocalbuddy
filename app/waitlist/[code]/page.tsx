import { redirect } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'

interface ReferralPageProps {
  params: {
    code: string
  }
}

export default async function ReferralPage({ params }: ReferralPageProps) {
  const { code } = params
  
  // Check if referral code exists
  const { data, error } = await supabase
    .from('waitlist')
    .select('id')
    .eq('referral_code', code)
    .single()
  
  // Redirect to waitlist page with referral code as query param
  // Even if code doesn't exist, we'll still redirect but the backend
  // will handle the invalid code
  redirect(`/waitlist?ref=${code}`)
} 