'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function VocalScreen() {
  const [tigerState, setTigerState] = useState<'idle' | 'speaking' | 'happy'>('idle')
  
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Jungle Background */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/background/jungle.jpg" 
          alt="Jungle Background" 
          fill 
          priority
          className="object-cover"
        />
      </div>
      
      {/* Back Button */}
      <Link href="/" className="absolute top-4 left-4 z-20 flex items-center gap-2 text-white hover:text-amber-200 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span className="text-shadow">Back</span>
      </Link>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Tiger Character */}
        <div className="mb-8">
          <Image 
            src="/images/tiger-curious.png" 
            alt="Tiger Character" 
            width={200}
            height={200}
            className="object-contain"
          />
        </div>
        
        {/* Speech Bubble */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Welcome to the Jungle!
          </h2>
          <p className="text-gray-700 mb-4">
            This is where the tiger character will interact with users.
            Start exploring the app to discover all the features!
          </p>
          <div className="mt-4 flex justify-center">
            <button 
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full transition-colors"
              onClick={() => window.location.href = '/'}
            >
              Start Learning
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 