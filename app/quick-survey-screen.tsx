"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Mic, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "./lib/supabase"

interface QuickSurveyScreenProps {
  onComplete: () => void
}

type Answer = "Yes" | "No" | "Sometimes" | null

export default function QuickSurveyScreen({ onComplete }: QuickSurveyScreenProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>(Array(6).fill(null))
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Define condition options with descriptions
  const conditions = [
    {
      id: "autism",
      label: "Autism",
      description: "I prefer clear routines and may be sensitive to sounds or lights",
    },
    {
      id: "adhd",
      label: "ADHD",
      description: "I sometimes find it hard to focus and might feel very energetic",
    },
    {
      id: "dyslexia",
      label: "Dyslexia",
      description: "I might find reading challenging sometimes",
    },
    {
      id: "none",
      label: "None",
      description: "I'm here to practice speaking and have fun!",
    },
  ]

  const questions = [
    {
      text: "First, let's understand you better! Which of these describes you?",
      type: "condition",
      options: conditions,
    },
    {
      text: "Do you talk a lot?",
      type: "standard",
    },
    {
      text: "Do you repeat words?",
      type: "standard",
    },
    {
      text: "Do you stutter?",
      type: "standard",
    },
    {
      text: "Do you move a lot?",
      type: "standard",
    },
    {
      text: "Is talking hard?",
      type: "standard",
    },
  ]

  const handleAnswer = useCallback(
    (answer: Answer | string) => {
      const newAnswers = [...answers]
      if (currentQuestion === 0) {
        setSelectedCondition(answer as string)
        newAnswers[currentQuestion] = "Yes" // Use standard answer type for storage
      } else {
        newAnswers[currentQuestion] = answer as Answer
      }
      setAnswers(newAnswers)

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      }
    },
    [answers, currentQuestion],
  )

  const handleVoiceInput = useCallback(() => {
    setIsListening(true)
    setError(null)

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError("Sorry, your browser doesn't support speech recognition. Please use the buttons.")
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase()
      setIsListening(false)

      if (transcript.includes("yes")) {
        handleAnswer("Yes")
      } else if (transcript.includes("no")) {
        handleAnswer("No")
      } else if (transcript.includes("sometimes")) {
        handleAnswer("Sometimes")
      } else {
        setError("Sorry, I didn't catch that. Please try again or use the buttons.")
      }
    }

    recognition.onerror = (event) => {
      setIsListening(false)
      if (event.error === "not-allowed") {
        setError("Microphone access was denied. Please enable microphone access or use the buttons.")
      } else {
        setError("There was an error with voice recognition. Please try again or use the buttons.")
      }
    }

    recognition.start()
  }, [handleAnswer])

  const handleSubmit = async () => {
    if (answers.some((answer) => answer === null)) {
      setError("Please answer all questions before submitting.")
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      
      // If there's no user, just proceed with navigation
      if (!user) {
        console.log("No authenticated user, proceeding with navigation")
        onComplete()
        router.push(`/vocal?condition=${selectedCondition || 'none'}`)
        return
      }

      // If there is a user, try to save their responses
      const { error } = await supabase
        .from("users")
        .update({ 
          surveyResponses: answers,
          condition: selectedCondition 
        })
        .eq("id", user.id)

      if (error) {
        console.error("Error saving responses:", error)
      }

      // Proceed with navigation
      onComplete()
      router.push(`/vocal?condition=${selectedCondition || 'none'}`)
    } catch (error) {
      console.error("Error submitting survey:", error)
      onComplete()
      router.push(`/vocal?condition=${selectedCondition || 'none'}`)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-100 to-amber-100 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-3 bg-gray-200">
        <motion.div
          className="h-full bg-green-500"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Back Button */}
      <button
        onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
        className="absolute top-8 left-4 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        disabled={currentQuestion === 0}
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      {/* Nature Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Trees */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0"
            style={{ left: `${i * 20}%` }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, delay: i * 0.2, repeat: Infinity, repeatType: "reverse" }}
          >
            <div className="w-32 h-32 bg-green-400 rounded-full opacity-30" />
            <div className="w-8 h-24 bg-amber-700 rounded-lg mx-auto -mt-8 opacity-30" />
          </motion.div>
        ))}

        {/* Clouds */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ top: `${20 + i * 15}%`, left: `${i * 30}%` }}
            animate={{ x: [0, 30, 0] }}
            transition={{ duration: 4, delay: i * 1.5, repeat: Infinity, repeatType: "reverse" }}
          >
            <div className="w-24 h-12 bg-white rounded-full opacity-20" />
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-8"
          >
            {/* Tiger Character */}
            <motion.div
              className="w-32 h-32 relative"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="absolute inset-0 bg-orange-400 rounded-3xl transform rotate-6">
                <div className="absolute inset-x-0 top-1/4 h-1 bg-orange-600 rounded-full" />
                <div className="absolute inset-x-0 top-1/2 h-1 bg-orange-600 rounded-full" />
                <div className="absolute inset-x-0 bottom-1/4 h-1 bg-orange-600 rounded-full" />
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
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 w-4 h-3 bg-pink-300 rounded-lg" />
              {/* Mouth */}
              <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 w-8 h-4">
                <div className="absolute w-full h-full border-b-2 border-orange-600 rounded-full" />
              </div>
            </motion.div>

            {/* Question */}
            <div className="bg-white rounded-3xl p-8 shadow-xl w-full max-w-xl">
              <h2 className="text-3xl font-bold text-center mb-8">{questions[currentQuestion].text}</h2>

              {/* Condition Selection or Standard Answers */}
              {questions[currentQuestion].type === "condition" ? (
                <div className="grid grid-cols-1 gap-4">
                  {conditions.map((condition) => (
                    <motion.div
                      key={condition.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        className={`w-full p-6 rounded-2xl text-left transition-colors ${
                          selectedCondition === condition.id
                            ? "bg-purple-100 border-2 border-purple-500"
                            : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                        }`}
                        onClick={() => handleAnswer(condition.id)}
                      >
                        <h3 className="text-xl font-semibold mb-2">{condition.label}</h3>
                        <p className="text-gray-600">{condition.description}</p>
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="lg"
                      className="w-full bg-green-500 hover:bg-green-600 text-white text-xl py-8 rounded-2xl"
                      onClick={() => handleAnswer("Yes")}
                    >
                      Yes
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="lg"
                      className="w-full bg-red-500 hover:bg-red-600 text-white text-xl py-8 rounded-2xl"
                      onClick={() => handleAnswer("No")}
                    >
                      No
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="lg"
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xl py-8 rounded-2xl"
                      onClick={() => handleAnswer("Sometimes")}
                    >
                      Sometimes
                    </Button>
                  </motion.div>
                </div>
              )}

              {/* Voice Input (only for standard questions) */}
              {questions[currentQuestion].type !== "condition" && (
                <div className="mt-6 flex justify-center">
                  <Button
                    size="lg"
                    variant="outline"
                    className={`gap-2 text-gray-600 ${isListening ? "animate-pulse" : ""}`}
                    onClick={handleVoiceInput}
                    disabled={isListening}
                  >
                    <Mic className="w-5 h-5" />
                    {isListening ? "Listening..." : "Or speak your answer"}
                  </Button>
                </div>
              )}

              {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
            </div>

            {/* Progress Dots */}
            <div className="flex gap-2">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i === currentQuestion
                      ? "bg-green-500"
                      : i < currentQuestion
                      ? "bg-green-200"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Submit Button */}
      {currentQuestion === questions.length - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8"
        >
          <Button
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white text-xl px-12 py-6 rounded-2xl shadow-lg"
            onClick={handleSubmit}
          >
            Complete
          </Button>
        </motion.div>
      )}
    </div>
  )
}

