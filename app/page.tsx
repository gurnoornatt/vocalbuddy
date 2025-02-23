"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { createClient } from "@supabase/supabase-js"
import { AnimatePresence, motion } from "framer-motion"
import AuthScreen from "./auth-screen"
import QuickSurveyScreen from "./quick-survey-screen"
import { Loader2 } from "lucide-react"
import MainScreen from "./main-screen"

const LoadingScreen = dynamic(() => import("./loading-screen"), { ssr: false })

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// Animation variants for page transitions
const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  enter: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    transition: {
      duration: 0.5,
      ease: "easeIn",
    },
  },
}

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<"auth" | "loading" | "survey" | "main">("auth")
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true)
  const [isCheckingUser, setIsCheckingUser] = useState(true)

  useEffect(() => {
    checkUserStatus()
  }, [])

  const checkUserStatus = async () => {
    setIsCheckingUser(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase.from("users").select("surveyResponses").eq("id", user.id).single()

      if (error) {
        console.error("Error fetching user data:", error)
      } else {
        setIsFirstTimeUser(!data.surveyResponses)
        setCurrentScreen(data.surveyResponses ? "main" : "survey")
      }
    }
    setIsCheckingUser(false)
  }

  const handleStart = () => {
    setCurrentScreen("loading")
    setTimeout(() => {
      setCurrentScreen(isFirstTimeUser ? "survey" : "main")
    }, 6000)
  }

  const handleSurveyComplete = () => {
    setIsFirstTimeUser(false)
    setCurrentScreen("main")
  }

  if (isCheckingUser) {
    return (
      <motion.div
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        className="flex items-center justify-center min-h-screen bg-gradient-to-b from-sky-100 to-amber-100"
      >
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </motion.div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {currentScreen === "loading" && (
        <motion.div
          key="loading"
          initial="initial"
          animate="enter"
          exit="exit"
          variants={pageVariants}
          className="w-full h-full"
        >
          <LoadingScreen />
        </motion.div>
      )}
      {currentScreen === "survey" && (
        <motion.div
          key="survey"
          initial="initial"
          animate="enter"
          exit="exit"
          variants={pageVariants}
          className="w-full h-full"
        >
          <QuickSurveyScreen onComplete={handleSurveyComplete} />
        </motion.div>
      )}
      {currentScreen === "main" && (
        <motion.div
          key="main"
          initial="initial"
          animate="enter"
          exit="exit"
          variants={pageVariants}
          className="w-full h-full"
        >
          <MainScreen />
        </motion.div>
      )}
      {currentScreen === "auth" && (
        <motion.div
          key="auth"
          initial="initial"
          animate="enter"
          exit="exit"
          variants={pageVariants}
          className="w-full h-full"
        >
          <AuthScreen onStart={handleStart} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

