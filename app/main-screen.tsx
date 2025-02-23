"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function MainScreen() {
  const router = useRouter()

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-100 to-amber-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-purple-600 mb-8">Welcome to SpeechBuddy!</h1>
      <p className="text-xl text-gray-700 mb-8">You're all set up and ready to start your speech therapy journey.</p>
      <Button
        size="lg"
        className="bg-orange-500 hover:bg-orange-600 text-white text-xl px-8 py-4 rounded-full shadow-lg"
        onClick={() => router.push("/vocal")}
      >
        Start Your First Lesson
      </Button>
    </div>
  )
}

