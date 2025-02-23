"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Lock, Star, ChevronLeft, Check, TrendingUp, Calendar, Clock, Award, Crown, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

interface Plan {
  name: string
  price: number
  interval: "month" | "year"
  features: string[]
  isBestValue?: boolean
}

export default function ParentDashboard() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "progress" | "settings">("overview")

  const plans: Plan[] = [
    {
      name: "Monthly",
      price: 9.99,
      interval: "month",
      features: [
        "Advanced progress analytics",
        "Personalized learning paths",
        "Custom reward creation",
        "Priority support"
      ]
    },
    {
      name: "Annual",
      price: 89.99,
      interval: "year",
      features: [
        "Everything in Monthly",
        "2 months free",
        "Progress predictions",
        "Custom exercises"
      ],
      isBestValue: true
    },
    {
      name: "Family",
      price: 149.99,
      interval: "year",
      features: [
        "Everything in Annual",
        "Up to 4 children",
        "Family progress dashboard",
        "Shared rewards pool"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-purple-50">
      {/* Header with Tiger Animation */}
      <div className="bg-green-500 p-4 text-white relative">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/vocal" className="flex items-center gap-2 hover:opacity-80">
            <ChevronLeft className="w-5 h-5" />
            Back to Child Mode
          </Link>
          <h1 className="text-2xl font-bold">Parent Dashboard</h1>
        </div>
        {/* Tiger Animation */}
        <div className="absolute -bottom-20 right-4 w-40 h-40 z-10">
          <DotLottieReact
            src="https://lottie.host/5c808e54-c571-465d-b8f2-35efddd7a5e8/rQz8RiplFt.lottie"
            loop
            autoplay
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 pt-24">
        {/* Quick Stats - Free for All */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">Practice Days</h3>
            </div>
            <p className="text-2xl font-bold">12</p>
            <p className="text-sm text-gray-500">This month</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold">Time Spent</h3>
            </div>
            <p className="text-2xl font-bold">45m</p>
            <p className="text-sm text-gray-500">Average per day</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold">Stars Earned</h3>
            </div>
            <p className="text-2xl font-bold">127</p>
            <p className="text-sm text-gray-500">Total rewards</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold">Skills</h3>
            </div>
            <p className="text-2xl font-bold">5</p>
            <p className="text-sm text-gray-500">In progress</p>
          </div>
        </div>

        {/* Basic Progress Chart - Free for All */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Weekly Activity</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Practice sessions
            </div>
          </div>
          <div className="h-48 flex items-end justify-between gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-green-200 rounded-t-lg" 
                  style={{ 
                    height: `${Math.random() * 100 + 20}px`,
                    opacity: i > 4 ? 0.5 : 1 
                  }}
                />
                <span className="text-sm text-gray-500">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mixed Free and Premium Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Free Feature */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-lg font-bold mb-2">Basic Progress</h3>
            <p className="text-gray-600">Track daily activity and achievements</p>
            <div className="mt-4 text-sm text-green-500 font-medium">Available Now</div>
          </div>

          {/* Free Feature */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="text-lg font-bold mb-2">Core Exercises</h3>
            <p className="text-gray-600">Essential speech practice activities</p>
            <div className="mt-4 text-sm text-green-500 font-medium">Available Now</div>
          </div>

          {/* Premium Feature */}
          <div className="bg-white rounded-lg p-6 shadow-md relative overflow-hidden">
            <div className="text-3xl mb-2">🧠</div>
            <h3 className="text-lg font-bold mb-2">AI Learning Paths</h3>
            <p className="text-gray-600">Personalized practice recommendations</p>
            <Button
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setShowUpgradeModal(true)}
            >
              Upgrade to Access
            </Button>
            <Crown className="absolute top-4 right-4 w-5 h-5 text-yellow-400" />
          </div>

          {/* Free Feature */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-2">📈</div>
            <h3 className="text-lg font-bold mb-2">Weekly Reports</h3>
            <p className="text-gray-600">Basic progress summaries</p>
            <div className="mt-4 text-sm text-green-500 font-medium">Available Now</div>
          </div>

          {/* Premium Feature */}
          <div className="bg-white rounded-lg p-6 shadow-md relative overflow-hidden">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="text-lg font-bold mb-2">Custom Rewards</h3>
            <p className="text-gray-600">Create personalized achievement rewards</p>
            <Button
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setShowUpgradeModal(true)}
            >
              Upgrade to Access
            </Button>
            <Crown className="absolute top-4 right-4 w-5 h-5 text-yellow-400" />
          </div>

          {/* Premium Feature */}
          <div className="bg-white rounded-lg p-6 shadow-md relative overflow-hidden">
            <div className="text-3xl mb-2">📱</div>
            <h3 className="text-lg font-bold mb-2">Parent App</h3>
            <p className="text-gray-600">Monitor progress on your phone</p>
            <Button
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setShowUpgradeModal(true)}
            >
              Upgrade to Access
            </Button>
            <Crown className="absolute top-4 right-4 w-5 h-5 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Choose Your Plan</h2>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative bg-white rounded-xl p-6 ${
                    plan.isBestValue
                      ? "border-2 border-green-500"
                      : "border border-gray-200"
                  }`}
                >
                  {plan.isBestValue && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm">
                      Best Value
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-gray-500">/{plan.interval}</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => {
                      // TODO: Integrate with Stripe
                      console.log(`Selected plan: ${plan.name}`)
                    }}
                  >
                    Start 7-Day Free Trial
                  </Button>
                </div>
              ))}
            </div>

            <p className="text-center text-gray-500 mt-6">
              7-day free trial, cancel anytime. No credit card required.
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 