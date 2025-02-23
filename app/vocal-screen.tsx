"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Star, Flame, Gift, Trophy, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "./lib/supabase"
import Link from "next/link"
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

// Import speechService lazily
let speechService: any = null

interface Reward {
  id: string
  type: "star" | "xp"
  amount: number
  position: { x: number; y: number }
}

interface ChatMessage {
  id: string
  text: string
  sender: "user" | "ai"
  timestamp: number
}

// Add new interface for user rewards
interface UserRewards {
  equippedAccessory?: string
  equippedBackground?: string
  unlockedItems: string[]
}

type TigerState = "idle" | "speaking" | "happy" | "wave"

export default function VocalScreen() {
  const searchParams = useSearchParams()
  const condition = searchParams.get("condition") || "none"
  const router = useRouter()
  const [isServiceReady, setIsServiceReady] = useState(false)
  const [userRewards, setUserRewards] = useState<UserRewards>({
    unlockedItems: []
  })

  // Initialize speech service on mount
  useEffect(() => {
    const initSpeechService = async () => {
      try {
        const { speechService: service } = await import('./services/speech')
        speechService = service
        // Check if speech recognition is supported
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
          throw new Error("Speech recognition not supported")
        }
        setIsServiceReady(true)
      } catch (error) {
        console.error('Failed to initialize speech service:', error)
        setSpeechBubbleText("Sorry, speech recognition isn't available in your browser.")
        setIsServiceReady(false)
      }
    }
    
    initSpeechService()
  }, [])

  // Fetch user rewards on mount
  useEffect(() => {
    const fetchUserRewards = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data, error } = await supabase
            .from("users")
            .select("rewards")
            .eq("id", user.id)
            .single()
          
          if (data?.rewards) {
            setUserRewards(data.rewards)
          }
        }
      } catch (error) {
        console.error("Failed to fetch user rewards:", error)
      }
    }

    fetchUserRewards()
  }, [])

  // Condition-specific settings
  const settings = {
    autism: {
      backgroundColor: "from-blue-50 to-purple-50", // Calming colors
      animationSpeed: 0.7, // Slower animations
      soundVolume: 0.2, // Lower volume
      tigerSize: "w-1/4", // Smaller tiger
      uiDensity: "sparse", // Less visual clutter
      rewardIntensity: "gentle", // Subtle rewards
      speechRate: 0.9, // Slightly slower speech
    },
    adhd: {
      backgroundColor: "from-orange-50 to-yellow-50", // Energetic colors
      animationSpeed: 1.2, // Faster animations
      soundVolume: 0.4, // Normal volume
      tigerSize: "w-1/3", // Regular tiger
      uiDensity: "dynamic", // More interactive elements
      rewardIntensity: "frequent", // More frequent, smaller rewards
      speechRate: 1.1, // Slightly faster speech
    },
    dyslexia: {
      backgroundColor: "from-green-50 to-blue-50", // Easy on the eyes
      animationSpeed: 1, // Normal animations
      soundVolume: 0.3, // Normal volume
      tigerSize: "w-1/3", // Regular tiger
      uiDensity: "clear", // Very clear layout
      rewardIntensity: "visual", // More visual rewards
      speechRate: 1, // Normal speech
    },
    none: {
      backgroundColor: "from-sky-100 to-amber-100", // Default colors
      animationSpeed: 1, // Normal animations
      soundVolume: 0.3, // Normal volume
      tigerSize: "w-1/3", // Regular tiger
      uiDensity: "balanced", // Standard layout
      rewardIntensity: "standard", // Standard rewards
      speechRate: 1, // Normal speech
    },
  }

  const currentSettings = settings[condition as keyof typeof settings]

  const [isListening, setIsListening] = useState(false)
  const [userInput, setUserInput] = useState("")
  const [rewards, setRewards] = useState<Reward[]>([])
  const [xp, setXp] = useState(75)
  const [stars, setStars] = useState(0)
  const [level, setLevel] = useState(1)
  const [streak, setStreak] = useState(3)
  const [showSpeechBubble, setShowSpeechBubble] = useState(true)
  const [speechBubbleText, setSpeechBubbleText] = useState("Hi, buddy! Say anything!")
  const [tigerState, setTigerState] = useState<TigerState>("wave")
  const [chestState, setChestState] = useState<"closed" | "cracked" | "open">("closed")
  const [flameIntensity, setFlameIntensity] = useState(1)
  const [hasWaved, setHasWaved] = useState(false)

  // Initialize tiger with wave animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasWaved(true)
      setTigerState("idle")
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Sound effects with condition-specific volume
  useEffect(() => {
    const audio = new Audio("/sounds/ding.mp3")
    audio.volume = currentSettings.soundVolume
    return () => {
      audio.pause()
      audio.currentTime = 0
    }
  }, [currentSettings.soundVolume])

  // Tiger animation variants
  const tigerVariants = {
    idle: {
      y: [0, -10, 0],
      transition: {
        duration: 2 / currentSettings.animationSpeed,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    speaking: {
      y: [0, -20],
      transition: {
        duration: 0.5 / currentSettings.animationSpeed,
        yoyo: true,
      },
    },
    happy: {
      rotate: [-2, 2],
      y: [0, -5, 0],
      transition: {
        duration: 0.5 / currentSettings.animationSpeed,
        repeat: condition === "adhd" ? 3 : 2,
      },
    },
    success: {
      scale: [1, 1.1, 1],
      rotate: [-5, 5, -5, 0],
      transition: {
        duration: 0.8 / currentSettings.animationSpeed,
      },
    },
  }

  const bubbleVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        duration: 0.5,
      }
    },
    exit: { 
      scale: 0, 
      opacity: 0,
      transition: {
        duration: 0.3,
      }
    }
  }

  const addReward = useCallback((type: "star" | "xp", amount: number) => {
    const id = Math.random().toString()
    
    // Adjust reward behavior based on condition
    let adjustedAmount = amount
    if (currentSettings.rewardIntensity === "frequent") {
      adjustedAmount = Math.ceil(amount / 2) // More frequent but smaller rewards
    } else if (currentSettings.rewardIntensity === "gentle") {
      adjustedAmount = Math.floor(amount * 0.8) // Slightly reduced rewards
    }

    // Position rewards based on UI density
    const position = type === "star" ? {
      x: window.innerWidth - 100 + Math.random() * 50,
      y: window.innerHeight - 100 + Math.random() * 50,
    } : {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
    }

    setRewards((prev) => [...prev, { id, type, amount: adjustedAmount, position }])

    if (type === "star") {
      setStars((prev) => {
        const newStars = prev + adjustedAmount
        if (newStars % (currentSettings.rewardIntensity === "frequent" ? 3 : 5) === 0) {
          setChestState("open")
          setTimeout(() => setChestState("closed"), 2000 / currentSettings.animationSpeed)
        } else {
          setChestState("cracked")
          setTimeout(() => setChestState("closed"), 1000 / currentSettings.animationSpeed)
        }
        return newStars
      })
    } else {
      setXp((prev) => {
        const newXp = prev + adjustedAmount
        if (newXp >= 100) {
          setLevel(l => l + 1)
          setFlameIntensity(f => Math.min(f + 0.2, currentSettings.rewardIntensity === "gentle" ? 1.5 : 2))
          return newXp - 100
        }
        return newXp
      })
    }

    setTimeout(() => {
      setRewards((prev) => prev.filter((reward) => reward.id !== id))
    }, 2000 / currentSettings.animationSpeed)
  }, [currentSettings])

  const handleUserInput = useCallback((input: string) => {
    if (!input) return // Guard against empty input
    
    setIsListening(true)
    setTigerState("speaking")
    setShowSpeechBubble(true)

    // Add some XP for speaking
    addReward("xp", 5)

    // Example responses based on input
    const lowerInput = input.toLowerCase()
    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      setSpeechBubbleText("Hi there! I'm your VocalPal!")
      setTimeout(() => {
        setTigerState("wave")
        setTimeout(() => setTigerState("idle"), 2000)
      }, 1000)
      addReward("star", 1)
    } else if (lowerInput.includes("dog")) {
      setSpeechBubbleText("Woof! I love dogs too!")
      setTimeout(() => {
        setTigerState("happy")
        setTimeout(() => setTigerState("idle"), 2000)
      }, 1000)
      addReward("star", 1)
    } else {
      setSpeechBubbleText("I heard you say: " + input)
      setTimeout(() => setTigerState("idle"), 2000)
    }

    setIsListening(false)
  }, [addReward])

  const handleSpeechInput = useCallback(async () => {
    if (!isServiceReady || !speechService) {
      console.error("Speech service not ready")
      setSpeechBubbleText("Oops! I'm still waking up. Try again in a moment!")
      return
    }

    if (isListening) {
      try {
        speechService.stopListening()
      } catch (error) {
        console.error("Error stopping speech recognition:", error)
      }
      setIsListening(false)
      return
    }

    setIsListening(true)
    setSpeechBubbleText("I'm listening...")
    setTigerState("speaking")

    try {
      await speechService.startListening(
        // On result
        (transcript: string) => {
          handleUserInput(transcript)
        },
        // On error
        (error: string) => {
          console.error("Speech recognition error:", error)
          setSpeechBubbleText("I couldn't hear you. Could you try again?")
          setIsListening(false)
          setTigerState("idle")
        },
        // On end
        () => {
          setIsListening(false)
          if (tigerState === "speaking") {
            setTigerState("idle")
          }
        },
      )
    } catch (error: unknown) {
      console.error("Failed to start speech recognition:", error)
      setSpeechBubbleText("I'm having trouble hearing you. Please try again!")
      setIsListening(false)
      setTigerState("idle")
    }
  }, [isListening, isServiceReady, handleUserInput, tigerState])

  const handleTigerStateChange = useCallback((state: string) => {
    if (state === "idle" || state === "speaking" || state === "happy" || state === "wave") {
      setTigerState(state)
    }
  }, [])

  return (
    <div className={`relative min-h-screen w-full overflow-hidden bg-gradient-to-b ${
      userRewards.equippedBackground === "beach" 
        ? "from-blue-200 to-yellow-200"
        : userRewards.equippedBackground === "starry-sky"
        ? "from-indigo-900 to-purple-900"
        : currentSettings.backgroundColor
    }`}>
      {/* Parent Mode Link */}
      <Link
        href="/parent"
        className="absolute bottom-4 right-4 text-gray-500 text-sm hover:text-gray-700 transition-colors flex items-center gap-1"
      >
        <Lock className="w-3 h-3" />
        Parent Mode
      </Link>

      {/* Add Rewards Button - moved up slightly to make room for parent mode link */}
      <Button
        variant="ghost"
        className="absolute bottom-16 right-4 text-white gap-2 bg-yellow-400/80 hover:bg-yellow-500/80"
        onClick={() => router.push("/rewards")}
      >
        <Star className="w-5 h-5" />
        Rewards
      </Button>

      {/* Animated Background Elements */}
      <div className={`absolute inset-0 pointer-events-none opacity-${
        condition === "autism" ? "20" : condition === "adhd" ? "40" : "30"
      }`}>
        {/* Trees */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`tree-${i}`}
            className="absolute bottom-0"
            style={{ left: `${i * 20}%` }}
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
            <div className="w-32 h-32 bg-green-400 rounded-full opacity-30">
              <div className="absolute inset-2 bg-green-300 rounded-full" />
            </div>
            <div className="w-8 h-24 bg-amber-700 rounded-lg mx-auto -mt-8 opacity-30" />
          </motion.div>
        ))}

        {/* Clouds */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`cloud-${i}`}
            className="absolute top-20"
            style={{ left: `${i * 30}%` }}
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
            <div className="w-24 h-12 bg-white rounded-full opacity-20" />
          </motion.div>
        ))}

        {/* Butterflies */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`butterfly-${i}`}
            className="absolute"
            style={{ top: `${20 + i * 15}%` }}
            animate={{
              x: ["0%", "100%"],
              y: [0, 10, -10, 0],
            }}
            transition={{
              x: { duration: 10, repeat: Infinity },
              y: { duration: 2, repeat: Infinity },
            }}
          >
            <div className="w-4 h-4 bg-pink-400 rounded-full opacity-30" />
          </motion.div>
        ))}
      </div>

      {/* Gamification Elements */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/80 rounded-full px-4 py-2 shadow-lg">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            filter: [`brightness(${100 * flameIntensity}%)`]
          }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Flame className="w-8 h-8 text-orange-500" />
        </motion.div>
        <span className="text-lg font-bold font-comic">{streak} Days</span>
      </div>

      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-white/80 rounded-full px-4 py-2 shadow-lg">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <span className="text-lg font-bold font-comic">Level {level}</span>
        </div>
        <div className="bg-white/80 rounded-full p-2 shadow-lg">
          <div className="relative w-32 h-4 bg-gray-300 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-green-500"
              initial={{ width: "0%" }}
              animate={{ width: `${xp}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-center mt-1 font-comic">{xp}/100 XP</p>
        </div>
      </div>

      {/* Centered Tiger with equipped accessories */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]">
        <AnimatePresence>
          {showSpeechBubble && (
            <motion.div
              variants={bubbleVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-white border-2 border-purple-500 p-6 rounded-3xl shadow-lg w-72 z-50"
            >
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white border-2 border-purple-500 rotate-45" />
              <p className="text-purple-500 text-xl font-bold text-center font-comic">
                {speechBubbleText}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="w-full h-full"
          animate={{ 
            y: [-8, 8],
            scale: tigerState === "happy" ? 1.1 : 1,
            translateY: tigerState === "speaking" ? -8 : 0,
            rotate: tigerState === "wave" ? -5 : 0
          }}
          transition={{
            y: { 
              duration: 2.5, 
              repeat: Infinity, 
              repeatType: "reverse", 
              ease: "easeInOut" 
            },
            scale: { duration: 0.4, ease: "easeOut" },
            translateY: { duration: 0.4, ease: "easeOut" },
            rotate: { duration: 0.4, ease: "easeOut" }
          }}
        >
          <DotLottieReact
            src="https://lottie.host/5c808e54-c571-465d-b8f2-35efddd7a5e8/rQz8RiplFt.lottie"
            loop
            autoplay
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              willChange: "transform",
              imageRendering: "crisp-edges",
              transform: "translate3d(0,0,0)",
              backfaceVisibility: "hidden"
            }}
            speed={0.8}
          />
        </motion.div>
      </div>

      {/* Microphone Button */}
      <motion.button
        className={`absolute bottom-20 left-1/2 -translate-x-1/2 w-16 h-16 ${
          condition === "dyslexia" ? "bg-purple-500" : "bg-orange-500"
        } rounded-full flex items-center justify-center ${
          isListening ? "animate-pulse shadow-[0_0_10px_#FF6B00]" : ""
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleSpeechInput}
      >
        <Mic className="w-8 h-8 text-white" />
      </motion.button>

      {/* Treasure Chest */}
      <motion.div
        className="absolute bottom-4 right-4 w-20 h-20"
        animate={
          chestState === "open"
            ? { scale: 1.2, rotate: [-5, 5, 0] }
            : chestState === "cracked"
            ? { scale: 1.1 }
            : {}
        }
      >
        <Gift 
          className={`w-full h-full transition-colors duration-300 ${
            chestState === "open" 
              ? "text-yellow-500" 
              : chestState === "cracked"
              ? "text-amber-600"
              : "text-amber-700"
          }`} 
        />
        <motion.div 
          className="absolute -top-2 -right-2 bg-yellow-400 rounded-full px-2 py-1"
          animate={{ scale: rewards.length > 0 ? [1, 1.2, 1] : 1 }}
        >
          <Star className="w-4 h-4 text-white inline" />
          <span className="text-white font-bold ml-1">{stars}</span>
        </motion.div>
      </motion.div>

      {/* Rewards Animation */}
      <AnimatePresence>
        {rewards.map((reward) => (
          <motion.div
            key={reward.id}
            className="absolute pointer-events-none z-50"
            initial={{ scale: 0, x: reward.position.x, y: reward.position.y }}
            animate={{
              scale: [1, 1.2, 1],
              y: reward.position.y - 100,
              opacity: [1, 0],
            }}
            exit={{ scale: 0 }}
            transition={{ duration: 1 }}
          >
            {reward.type === "star" ? (
              <Star className="w-8 h-8 text-yellow-400" />
            ) : (
              <div className="text-xl font-bold text-purple-600 font-comic">+{reward.amount}XP</div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
} 