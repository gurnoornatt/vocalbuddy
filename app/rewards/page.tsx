"use client"

import dynamic from 'next/dynamic'

// Dynamically import RewardsScreen with no SSR
const RewardsScreen = dynamic(() => import('../rewards-screen'), {
  ssr: false,
})

export default function RewardsPage() {
  return <RewardsScreen />
} 