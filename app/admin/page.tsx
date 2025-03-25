"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/app/lib/supabase"
import { Loader2, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

// Admin stats interface
interface AdminStats {
  userCount: number
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [stats, setStats] = useState<AdminStats>({
    userCount: 0,
  })

  useEffect(() => {
    fetchUserProfile()
    fetchStats()
  }, [])

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    setIsLoading(true)
    try {
      // Get user count
      const { count: userCount, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        throw countError
      }

      setStats({
        userCount: userCount || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Stats Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-medium text-gray-700">Users</h2>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {isLoading ? '...' : stats.userCount}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Total registered users
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Management */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">User Management</h2>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <p className="text-gray-500 text-sm">
            View and manage user accounts
          </p>
        </div>

        {/* System Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">System Settings</h2>
            <Link href="/admin/settings">
              <Button variant="ghost" size="sm">Configure</Button>
            </Link>
          </div>
          <p className="text-gray-500 text-sm">
            Configure application settings
          </p>
        </div>
      </div>
    </div>
  )
} 