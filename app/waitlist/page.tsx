"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Copy, Share2, Twitter, Facebook, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { 
  calculateFinalPosition, 
  formatPosition, 
  getReferralMilestoneText,
  isValidEmail
} from "@/app/lib/utils"
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

export default function WaitlistPage() {
  const searchParams = useSearchParams()
  const referralCode = searchParams.get('ref')
  
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [position, setPosition] = useState<number | null>(null)
  const [userReferralCode, setUserReferralCode] = useState<string | null>(null)
  const [referralCount, setReferralCount] = useState(0)
  const [copied, setCopied] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)

  // Calculate final position after referrals
  const finalPosition = position !== null 
    ? calculateFinalPosition(position, referralCount) 
    : null

  // Generate referral URL
  const referralUrl = userReferralCode 
    ? `${window.location.origin}/waitlist?ref=${userReferralCode}`
    : null

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: name || undefined,
          referralCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist')
      }

      setPosition(data.position)
      setUserReferralCode(data.referralCode)
      setReferralCount(data.referralCount || 0)
      setSuccess(true)
      setShowThankYou(true)
      
      // Hide thank you message after 3 seconds
      setTimeout(() => {
        setShowThankYou(false)
      }, 3000)
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Copy referral link to clipboard
  const copyToClipboard = useCallback(() => {
    if (referralUrl) {
      navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [referralUrl])

  // Share on Twitter
  const shareOnTwitter = useCallback(() => {
    if (referralUrl) {
      const text = `I just joined the SpeechBuddy waitlist! Skip the line and join me using my referral link:`
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralUrl)}`,
        '_blank'
      )
    }
  }, [referralUrl])

  // Share on Facebook
  const shareOnFacebook = useCallback(() => {
    if (referralUrl) {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`,
        '_blank'
      )
    }
  }, [referralUrl])

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-purple-100 to-blue-100 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Back Button */}
      <Link href="/" className="absolute top-4 left-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Back to Home
      </Link>
      
      {/* Status Check Link */}
      <Link href="/waitlist/status" className="absolute top-4 right-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
        <Search className="w-5 h-5" />
        Check Status
      </Link>

      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Clouds */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`cloud-${i}`}
            className="absolute"
            style={{ top: `${20 + i * 25}%`, left: `${i * 30}%` }}
            animate={{
              x: [0, 30, 0],
            }}
            transition={{
              duration: 4,
              delay: i * 1.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <div className="w-24 h-12 bg-white rounded-full opacity-40" />
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="w-full max-w-3xl mx-auto px-4 py-12 z-10">
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6">
            Join the SpeechBuddy Waitlist
          </h1>

          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Left Side - Tiger Animation */}
            <div className="w-full md:w-1/2 flex justify-center">
              <motion.div
                className="w-64 h-64"
                animate={{ 
                  y: [-8, 8],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut"
                }}
              >
                <DotLottieReact
                  src="https://lottie.host/5c808e54-c571-465d-b8f2-35efddd7a5e8/rQz8RiplFt.lottie"
                  loop
                  autoplay
                  style={{
                    width: "100%",
                    height: "100%"
                  }}
                />
              </motion.div>
            </div>

            {/* Right Side - Form or Success */}
            <div className="w-full md:w-1/2">
              <AnimatePresence mode="wait">
                {!success ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-gray-600 mb-6">
                      Be among the first to experience SpeechBuddy, the interactive speech learning companion for children.
                    </p>

                    {referralCode && (
                      <div className="bg-purple-50 p-4 rounded-xl mb-6">
                        <p className="text-purple-700 font-medium">
                          You've been referred! You'll get priority access.
                        </p>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Name (optional)
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Your name"
                        />
                      </div>

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
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Joining..." : "Join the Waitlist"}
                      </Button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <AnimatePresence>
                      {showThankYou && (
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="bg-green-50 p-4 rounded-xl mb-4"
                        >
                          <p className="text-green-700 font-medium text-center">
                            Thank you for joining! Check your email for confirmation.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        Your Waitlist Position
                      </h3>
                      <div className="text-4xl font-bold text-purple-600 mb-2">
                        #{position !== null ? formatPosition(position) : "..."}
                      </div>
                      
                      {finalPosition !== position && finalPosition !== null && (
                        <div className="text-sm text-green-600 font-medium mb-4">
                          Improved to #{formatPosition(finalPosition)} thanks to your referrals!
                        </div>
                      )}
                    </div>

                    <div className="bg-purple-50 p-4 rounded-xl">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        Skip the line!
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Share your referral link and move up the waitlist. For every 3 people who join, you'll skip ahead 100 positions!
                      </p>
                      
                      {referralCount > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Referral progress</span>
                            <span>{referralCount % 3}/3</span>
                          </div>
                          <Progress value={(referralCount % 3) * 33.33} className="h-2" />
                          <p className="text-xs text-purple-600 mt-1">
                            {getReferralMilestoneText(referralCount)}
                          </p>
                        </div>
                      )}

                      {referralUrl && (
                        <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 mb-4">
                          <div className="text-gray-600 text-sm truncate flex-1">
                            {referralUrl}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={copyToClipboard}
                            className="flex-shrink-0"
                          >
                            {copied ? "Copied!" : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={shareOnTwitter}
                          className="flex-1 bg-[#1DA1F2] hover:bg-[#1a94da] text-white"
                        >
                          <Twitter className="w-4 h-4 mr-2" />
                          Twitter
                        </Button>
                        <Button
                          onClick={shareOnFacebook}
                          className="flex-1 bg-[#4267B2] hover:bg-[#365899] text-white"
                        >
                          <Facebook className="w-4 h-4 mr-2" />
                          Facebook
                        </Button>
                        <Button
                          onClick={copyToClipboard}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 