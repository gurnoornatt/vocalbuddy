"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  calculateFinalPosition, 
  formatPosition, 
  getReferralMilestoneText,
  isValidEmail
} from "@/app/lib/utils"

export default function WaitlistStatusPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<{
    position: number;
    referralCode: string;
    referralCount: number;
  } | null>(null)

  // Calculate final position after referrals
  const finalPosition = userData 
    ? calculateFinalPosition(userData.position, userData.referralCount) 
    : null

  // Generate referral URL
  const referralUrl = userData 
    ? `${window.location.origin}/waitlist?ref=${userData.referralCode}`
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/waitlist?email=${encodeURIComponent(email)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find your waitlist position')
      }

      setUserData({
        position: data.position,
        referralCode: data.referralCode,
        referralCount: data.referralCount || 0,
      })
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-purple-100 to-blue-100 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Back Button */}
      <Link href="/waitlist" className="absolute top-4 left-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Back to Waitlist
      </Link>

      {/* Main Content */}
      <div className="w-full max-w-2xl mx-auto px-4 py-12 z-10">
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Check Your Waitlist Status
          </h1>

          {!userData ? (
            <div>
              <p className="text-gray-600 mb-6 text-center">
                Enter your email address to check your current position on the waitlist.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Checking...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Search className="w-4 h-4" />
                      Check Status
                    </span>
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Your Waitlist Position
                </h3>
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  #{formatPosition(userData.position)}
                </div>
                
                {finalPosition !== userData.position && (
                  <div className="text-sm text-green-600 font-medium mb-4">
                    Improved to #{formatPosition(finalPosition!)} thanks to your referrals!
                  </div>
                )}
              </div>

              <div className="bg-purple-50 p-4 rounded-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Your Referral Stats
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-3 rounded-lg text-center">
                    <div className="text-sm text-gray-500">Referral Code</div>
                    <div className="font-bold text-purple-600">{userData.referralCode}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <div className="text-sm text-gray-500">People Referred</div>
                    <div className="font-bold text-purple-600">{userData.referralCount}</div>
                  </div>
                </div>
                
                <p className="text-sm text-purple-600">
                  {getReferralMilestoneText(userData.referralCount)}
                </p>
              </div>

              <div className="flex justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => setUserData(null)}
                  className="flex-1"
                >
                  Check Another Email
                </Button>
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  asChild
                >
                  <Link href="/waitlist">Back to Waitlist</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 