"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { supabase } from "@/app/lib/supabase"
import { formatPosition } from "@/app/lib/utils"

interface WaitlistEntry {
  id: string
  email: string
  name: string | null
  position: number
  referral_code: string
  referral_count: number
  created_at: string
  referrer_id: string | null
  ip_address: string | null
}

export default function AdminWaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const pageSize = 20

  useEffect(() => {
    fetchWaitlistEntries()
  }, [page, searchTerm])

  const fetchWaitlistEntries = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // First get the total count
      const { count, error: countError } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .ilike('email', `%${searchTerm}%`)

      if (countError) throw countError
      setTotalCount(count || 0)

      // Then get the paginated data
      let query = supabase
        .from('waitlist')
        .select('*')
        .order('position', { ascending: true })
        .range((page - 1) * pageSize, page * pageSize - 1)
      
      if (searchTerm) {
        query = query.ilike('email', `%${searchTerm}%`)
      }

      const { data, error: dataError } = await query

      if (dataError) throw dataError
      setEntries(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch waitlist entries')
      console.error('Error fetching waitlist:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const exportToCsv = () => {
    if (!entries.length) return

    const headers = ['Position', 'Email', 'Name', 'Referral Code', 'Referrals', 'Date Joined']
    const csvRows = [
      headers.join(','),
      ...entries.map(entry => [
        entry.position,
        entry.email,
        entry.name || '',
        entry.referral_code,
        entry.referral_count,
        new Date(entry.created_at).toLocaleDateString()
      ].join(','))
    ]

    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `waitlist-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Waitlist Management</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchWaitlistEntries}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportToCsv}
              disabled={!entries.length}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-500">
              Total entries: <span className="font-medium">{totalCount}</span>
            </div>
            <div className="w-64">
              <input
                type="text"
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referral Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referrals
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">
                      No waitlist entries found
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        #{formatPosition(entry.position)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {entry.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {entry.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                        {entry.referral_code}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {entry.referral_count}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalCount > pageSize && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {page} of {Math.ceil(totalCount / pageSize)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(totalCount / pageSize)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 