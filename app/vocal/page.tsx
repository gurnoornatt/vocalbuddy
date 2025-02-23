"use client"

import dynamic from 'next/dynamic'

// Dynamically import VocalScreen with no SSR
const VocalScreen = dynamic(() => import('../vocal-screen'), {
  ssr: false,
})

export default function VocalPage() {
  return <VocalScreen />
}

