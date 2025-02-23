"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import useSound from "use-sound"

interface ElementPosition {
  left?: string
  top?: string
}

interface Elements {
  trees: ElementPosition[]
  clouds: ElementPosition[]
  flowers: ElementPosition[]
  butterflies: ElementPosition[]
}

const INTRO_MESSAGES = [
  "Hi there! I'm Buddy!",
  "Let's get this party started!",
  "I'll help you become a speech superstar! 🌟",
  "Are you ready to begin?"
]

export default function LoadingScreen() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [showMessage, setShowMessage] = useState(true)
  const [playDing] = useSound("/sounds/ding.mp3")
  const [playBirds] = useSound("/sounds/birds.mp3", { volume: 0.2 })
  const [elements, setElements] = useState<Elements>({
    trees: [],
    clouds: [],
    flowers: [],
    butterflies: [],
  })

  useEffect(() => {
    try {
      playBirds()
    } catch (error) {
      console.warn("Could not play birds sound:", error)
    }
    
    // Message sequence timing
    const messageInterval = setInterval(() => {
      setShowMessage(false)
      setTimeout(() => {
        setCurrentMessageIndex((prev) => {
          if (prev >= INTRO_MESSAGES.length - 1) {
            clearInterval(messageInterval)
            return prev
          }
          try {
            playDing()
          } catch (error) {
            console.warn("Could not play ding sound:", error)
          }
          return prev + 1
        })
        setShowMessage(true)
      }, 300)
    }, 1500)

    setElements({
      trees: Array(6)
        .fill(null)
        .map((_, i) => ({ left: `${i * 20}%` })),
      clouds: Array(3)
        .fill(null)
        .map((_, i) => ({ left: `${i * 30}%` })),
      flowers: Array(8)
        .fill(null)
        .map(() => ({ left: `${Math.random() * 100}%` })),
      butterflies: Array(5)
        .fill(null)
        .map(() => ({ top: `${Math.random() * 100}%` })),
    })

    return () => clearInterval(messageInterval)
  }, [playBirds, playDing])

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-b from-sky-200 via-green-100 to-green-200">
      {/* Nature Background Elements */}
      <div className="absolute inset-0">
        {/* Trees */}
        {elements.trees.map((tree, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0"
            style={{ left: tree.left }}
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <div className="w-32 h-32 bg-green-400 rounded-full relative">
              <div className="absolute inset-2 bg-green-300 rounded-full" />
            </div>
            <div className="w-8 h-24 bg-amber-700 rounded-lg mx-auto -mt-8" />
          </motion.div>
        ))}

        {/* Clouds */}
        {elements.clouds.map((cloud, i) => (
          <motion.div
            key={i}
            className="absolute top-20"
            style={{ left: cloud.left }}
            animate={{ x: [0, 30, 0] }}
            transition={{
              duration: 4,
              delay: i * 1.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <div className="w-24 h-12 bg-white rounded-full opacity-80" />
          </motion.div>
        ))}

        {/* Butterflies */}
        {elements.butterflies.map((butterfly, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ top: butterfly.top }}
            animate={{
              x: ["0%", "100%"],
              y: [0, 10, -10, 0],
            }}
            transition={{
              x: { duration: 10, repeat: Infinity },
              y: { duration: 2, repeat: Infinity },
            }}
          >
            <div className="w-4 h-4 bg-pink-400 rounded-full" />
          </motion.div>
        ))}
      </div>

      {/* Central Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        {/* Message Bubble */}
        <AnimatePresence mode="wait">
          {showMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl p-6 mb-8 shadow-lg relative"
            >
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white rotate-45" />
              <p className="text-2xl font-bold text-gray-800 whitespace-nowrap">
                {INTRO_MESSAGES[currentMessageIndex]}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tiger Character */}
        <motion.div
          className="relative w-48 h-48"
          animate={{
            y: [0, -20, 0],
            rotate: currentMessageIndex === 0 ? [-5, 5, -5] : 0,
          }}
          transition={{
            y: { duration: 2, repeat: Infinity },
            rotate: { duration: 0.5, repeat: 3 },
          }}
        >
          {/* Tiger Body */}
          <div className="absolute inset-0 bg-orange-400 rounded-3xl transform rotate-6">
            <div className="absolute inset-x-0 top-1/4 h-2 bg-orange-600 rounded-full" />
            <div className="absolute inset-x-0 top-1/2 h-2 bg-orange-600 rounded-full" />
            <div className="absolute inset-x-0 bottom-1/4 h-2 bg-orange-600 rounded-full" />
          </div>

          {/* Eyes */}
          <motion.div
            className="absolute top-1/3 left-1/4 w-12 h-12 bg-white rounded-full"
            animate={currentMessageIndex === 0 ? { scaleY: [1, 0.2, 1] } : {}}
            transition={{ duration: 0.3, repeat: 3, repeatDelay: 1 }}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-black rounded-full">
              <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-white rounded-full" />
            </div>
          </motion.div>
          <motion.div
            className="absolute top-1/3 right-1/4 w-12 h-12 bg-white rounded-full"
            animate={currentMessageIndex === 0 ? { scaleY: [1, 0.2, 1] } : {}}
            transition={{ duration: 0.3, repeat: 3, repeatDelay: 1 }}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-black rounded-full">
              <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-white rounded-full" />
            </div>
          </motion.div>

          {/* Nose */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 w-8 h-6 bg-pink-300 rounded-lg" />

          {/* Mouth */}
          <motion.div
            className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 w-16 h-8"
            animate={currentMessageIndex === 1 ? {
              scaleY: [1, 1.2, 1],
              scaleX: [1, 0.8, 1],
            } : {}}
            transition={{ duration: 0.5, repeat: 3 }}
          >
            <div className="absolute w-full h-full border-b-4 border-orange-600 rounded-full" />
          </motion.div>

          {/* Waving Hand (shows only during first message) */}
          {currentMessageIndex === 0 && (
            <motion.div
              className="absolute -right-8 top-1/2 w-8 h-16 bg-orange-400 rounded-full origin-top"
              animate={{ rotate: [-20, 20, -20] }}
              transition={{ duration: 0.5, repeat: 6 }}
            />
          )}
        </motion.div>

        {/* Progress Dots */}
        <div className="mt-12 flex gap-3">
          {INTRO_MESSAGES.map((_, i) => (
            <motion.div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i === currentMessageIndex ? "bg-green-500" : "bg-gray-300"
              }`}
              animate={i === currentMessageIndex ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

