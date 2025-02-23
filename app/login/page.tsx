"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Facebook, Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function LoginPage() {
  const [characters, setCharacters] = useState<{ x: number; y: number; rotate: number }[]>([])
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/'

  useEffect(() => {
    // Create floating characters positions
    const newCharacters = [
      { x: 20, y: -20, rotate: -15 }, // Monkey 1
      { x: -30, y: -10, rotate: 15 }, // Monkey 2
      { x: 40, y: 10, rotate: 10 }, // Elephant 1
      { x: -20, y: 20, rotate: -10 }, // Elephant 2
      { x: 30, y: -30, rotate: 20 }, // Bird 1
      { x: -40, y: 0, rotate: -20 }, // Bird 2
    ]
    setCharacters(newCharacters)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Redirect to the specified path or home
      router.push(redirectPath)
    } catch (error: any) {
      setError(error.message || "Failed to log in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-100 to-amber-100 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Back Button */}
      <Link href="/" className="absolute top-4 left-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Back
      </Link>

      {/* Background Characters */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Bouncing Tiger */}
        <motion.div
          className="absolute left-[15%] top-1/4 -translate-y-1/2"
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 bg-orange-400 rounded-3xl transform rotate-6">
              <div className="absolute inset-x-0 top-1/4 h-2 bg-orange-600 rounded-full" />
              <div className="absolute inset-x-0 top-1/2 h-2 bg-orange-600 rounded-full" />
              <div className="absolute inset-x-0 bottom-1/4 h-2 bg-orange-600 rounded-full" />
            </div>

            {/* Eyes */}
            <div className="absolute top-1/3 left-1/4 w-8 h-8 bg-white rounded-full">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-black rounded-full">
                <div className="absolute top-1/4 right-1/4 w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            </div>
            <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-white rounded-full">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-black rounded-full">
                <div className="absolute top-1/4 right-1/4 w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            </div>

            {/* Nose */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-pink-300 rounded-lg" />

            {/* Mouth */}
            <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 w-12 h-6">
              <div className="absolute w-full h-full border-b-2 border-orange-600 rounded-full" />
            </div>
          </div>
        </motion.div>

        {/* Floating Characters */}
        {characters.map((char, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: `${(i * 20) + 10}%`, top: `${((i % 3) * 30) + 20}%` }}
            animate={{
              x: [char.x - 10, char.x + 10],
              y: [char.y - 10, char.y + 10],
              rotate: [char.rotate - 5, char.rotate + 5],
            }}
            transition={{
              duration: 2 + i * 0.2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          >
            <div className={`w-12 h-12 ${
              i < 2 ? "bg-amber-700" : 
              i < 4 ? "bg-gray-400" : 
              "bg-black"
            } rounded-full`} />
          </motion.div>
        ))}

        {/* Floating Coins */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`coin-${i}`}
            className="absolute"
            style={{
              left: `${(i * 25) + 5}%`,
              top: `${((i % 2) * 40) + 30}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-6 h-6 bg-yellow-400 rounded-full shadow-lg" />
          </motion.div>
        ))}
      </div>

      {/* Login Form */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Welcome Back!</h2>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div className="relative">
              <input
                type="email"
                placeholder="Email or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                required
              />
              <button type="button" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 text-sm font-medium hover:text-blue-600">
                FORGOT?
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xl py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "LOG IN"}
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-gray-500 text-sm font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            {/* Social Logins */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full border-gray-200 hover:bg-gray-50 gap-3"
                onClick={() => {/* Implement Facebook login */}}
              >
                <Facebook className="w-5 h-5 text-[#1877F2]" />
                Continue with Facebook
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-200 hover:bg-gray-50 gap-3"
                onClick={() => {/* Implement Google login */}}
              >
                <Mail className="w-5 h-5 text-red-500" />
                Continue with Google
              </Button>
            </div>

            {/* Terms */}
            <p className="text-gray-500 text-xs text-center mt-6">
              By signing in to SpeechBuddy, you agree to our{" "}
              <a href="#" className="text-blue-500 hover:text-blue-600">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-500 hover:text-blue-600">
                Privacy Policy
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
} 