"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

interface AuthScreenProps {
  onStart: () => void
}

export default function AuthScreen({ onStart }: AuthScreenProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [hasWaved, setHasWaved] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasWaved(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-100 to-amber-100 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Language Selector */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className="text-gray-600">SITE LANGUAGE:</span>
        <Button variant="ghost" size="sm" className="text-gray-600">
          ENGLISH
        </Button>
      </div>

      {/* Simple Background Elements */}
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

        {/* Simple Trees */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`tree-${i}`}
            className="absolute bottom-0"
            style={{ left: `${i * 30}%` }}
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <div className="w-32 h-32 bg-green-400 rounded-full opacity-40" />
            <div className="w-8 h-24 bg-amber-700 rounded-lg mx-auto -mt-8 opacity-40" />
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="w-full max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Left Side - Lottie Tiger */}
        <div className="relative w-full md:w-1/2 h-[400px] flex items-center justify-center">
          <motion.div
            className="w-96 h-96 -translate-x-12 -translate-y-8"
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

          {/* Simple Floating Stars */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute"
              initial={{
                x: Math.random() * 300 - 150,
                y: Math.random() * 300 - 150,
              }}
              animate={{
                y: [0, -20, 0],
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="w-6 h-6 bg-yellow-300 rounded-full shadow-lg" />
            </motion.div>
          ))}
        </div>

        {/* Right Side - Content */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start gap-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 text-center md:text-left">
            The free and fun way to unlock your superpower!
          </h1>

          <div className="flex flex-col gap-4 w-full max-w-md">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              <Button
                size="lg"
                className="w-full bg-green-500 hover:bg-green-600 text-white text-xl px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                onClick={onStart}
              >
                Start Talking!
              </Button>
            </motion.div>

            <Button
              variant="ghost"
              size="lg"
              className="w-full text-blue-500 hover:text-blue-600 text-lg"
              asChild
            >
              <Link href="/login">
                I ALREADY HAVE AN ACCOUNT
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Parent Mode Button */}
      <Button variant="ghost" size="sm" className="absolute top-4 left-4 text-gray-500 gap-2" asChild>
        <Link href="/parent">
          <Lock className="w-4 h-4" />
          Parent Mode
        </Link>
      </Button>
    </div>
  )
}

