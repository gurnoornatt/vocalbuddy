"use client"

import { useState, useEffect } from "react"
import { Users, LogOut, BarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { supabase } from "@/app/lib/supabase"
import { useRouter } from "next/navigation"

interface AdminStats {
  waitlistCount: number
  referralCount: number
  topReferrers: { email: string; count: number }[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    waitlistCount: 0,
    referralCount: 0,
    topReferrers: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchStats()
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.email) {
        setUserName(user.email)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchStats = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get waitlist count
      const { count: waitlistCount, error: countError } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })

      if (countError) throw countError

      // Get total referrals
      const { data: referralData, error: referralError } = await supabase
        .from('waitlist')
        .select('referral_count')
        .gt('referral_count', 0)

      if (referralError) throw referralError

      const totalReferrals = referralData.reduce((sum, item) => sum + item.referral_count, 0)

      // Get top referrers
      const { data: topReferrers, error: topError } = await supabase
        .from('waitlist')
        .select('email, referral_count')
        .order('referral_count', { ascending: false })
        .gt('referral_count', 0)
        .limit(5)

      if (topError) throw topError

      setStats({
        waitlistCount: waitlistCount || 0,
        referralCount: totalReferrals,
        topReferrers: topReferrers ? topReferrers.map(item => ({
          email: item.email,
          count: item.referral_count
        })) : [],
      })
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stats')
      console.error('Error fetching admin stats:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            {userName && (
              <span className="text-sm text-gray-500">
                Logged in as <span className="font-medium">{userName}</span>
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-700">Waitlist Users</h2>
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {isLoading ? '...' : stats.waitlistCount}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Total users on the waitlist
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-700">Total Referrals</h2>
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {isLoading ? '...' : stats.referralCount}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Successful referrals made
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-700">Conversion Rate</h2>
              <BarChart className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {isLoading || stats.waitlistCount === 0
                ? '...'
                : `${((stats.referralCount / stats.waitlistCount) * 100).toFixed(1)}%`}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Referrals per user
            </div>
          </div>
        </div>

        {/* Management Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/admin/waitlist" className="block">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-800">Waitlist Management</h2>
                  <p className="text-sm text-gray-500">
                    View and manage waitlist entries
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Top Referrers */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Top Referrers</h2>
          
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">Loading...</div>
          ) : stats.topReferrers.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No referrals yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referrals
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.topReferrers.map((referrer, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {referrer.email}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {referrer.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 