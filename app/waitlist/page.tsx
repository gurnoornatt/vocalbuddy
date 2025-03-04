"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
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

// Client component that uses useSearchParams
function WaitlistForm() {
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
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <motion.div
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          Joining...
                        </span>
                      ) : (
                        "Join Waitlist"
                      )}
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
                  {/* Thank You Animation */}
                  <AnimatePresence>
                    {showThankYou && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.2, opacity: 0 }}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-8 py-4 rounded-full text-xl font-bold z-50"
                      >
                        Thank you!
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      You're on the waitlist!
                    </h3>
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      #{formatPosition(position!)}
                    </div>
                    
                    {finalPosition !== position && (
                      <div className="text-sm text-green-600 font-medium mb-4">
                        Improved to #{formatPosition(finalPosition!)} thanks to your referrals!
                      </div>
                    )}
                  </div>

                  <div className="bg-purple-50 p-4 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      Share your referral link
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      For every 3 friends who join using your link, you'll move up 100 positions in the waitlist!
                    </p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="text"
                        value={referralUrl || ''}
                        readOnly
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0"
                        onClick={copyToClipboard}
                      >
                        {copied ? (
                          <span className="text-green-600">Copied!</span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Copy className="w-4 h-4" />
                            Copy
                          </span>
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex justify-center gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={shareOnTwitter}
                      >
                        <Twitter className="w-4 h-4 text-blue-400" />
                        Twitter
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={shareOnFacebook}
                      >
                        <Facebook className="w-4 h-4 text-blue-600" />
                        Facebook
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={copyToClipboard}
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </Button>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      {getReferralMilestoneText(referralCount)}
                    </p>
                    
                    {referralCount > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Referral Progress</p>
                        <div className="relative pt-1">
                          <Progress value={(referralCount % 3) * 33.33} className="h-2" />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading fallback
function WaitlistFormLoading() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12 z-10">
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    </div>
  )
}

// Main page component
export default function WaitlistPage() {
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

      {/* Wrap the component that uses useSearchParams in Suspense */}
      <Suspense fallback={<WaitlistFormLoading />}>
        <WaitlistForm />
      </Suspense>
    </div>
  )
} 