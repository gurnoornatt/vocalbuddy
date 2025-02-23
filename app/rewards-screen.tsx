"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Lock, Gift, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import useSound from "use-sound"
import { useRouter } from "next/navigation"
import { supabase } from "./lib/supabase"

interface RewardItem {
  id: string
  name: string
  description: string
  cost: number
  type: "accessory" | "background" | "story"
  icon: string
  unlocked: boolean
  equipped?: boolean
}

export default function RewardsScreen() {
  const router = useRouter()
  const [totalStars, setTotalStars] = useState(18)
  const [selectedItem, setSelectedItem] = useState<RewardItem | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [playJingle] = useSound("/sounds/coin-jingle.mp3", { volume: 0.3 })
  const [playUnlock] = useSound("/sounds/unlock.mp3", { volume: 0.4 })
  const [rewardItems, setRewardItems] = useState<RewardItem[]>([
    // Top Shelf - Accessories
    {
      id: "tiger-hat",
      name: "Tiger Hat",
      description: "A stylish red cap for your buddy!",
      cost: 5,
      type: "accessory",
      icon: "🧢",
      unlocked: false
    },
    {
      id: "sunglasses",
      name: "Cool Shades",
      description: "Looking cool in the jungle!",
      cost: 8,
      type: "accessory",
      icon: "🕶️",
      unlocked: false
    },
    // Middle Shelf - Backgrounds
    {
      id: "starry-sky",
      name: "Starry Sky",
      description: "Practice under the stars!",
      cost: 10,
      type: "background",
      icon: "🌟",
      unlocked: false
    },
    {
      id: "beach",
      name: "Sunny Beach",
      description: "Ocean waves and sandy fun!",
      cost: 12,
      type: "background",
      icon: "🏖️",
      unlocked: false
    },
    // Bottom Shelf - Stories
    {
      id: "jungle-tale-1",
      name: "Tiger's Jungle Tale: Part 1",
      description: "Join Tiger on his first adventure!",
      cost: 15,
      type: "story",
      icon: "📚",
      unlocked: false
    }
  ])

  // Fetch user rewards on mount
  useEffect(() => {
    const fetchUserRewards = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data, error } = await supabase
            .from("users")
            .select("rewards, stars")
            .eq("id", user.id)
            .single()
          
          if (data?.rewards) {
            // Update unlocked and equipped status
            setRewardItems(prev => prev.map(item => ({
              ...item,
              unlocked: data.rewards.unlockedItems.includes(item.id),
              equipped: data.rewards.equippedAccessory === item.id || 
                       data.rewards.equippedBackground === item.id
            })))
          }
          if (data?.stars) {
            setTotalStars(data.stars)
          }
        }
      } catch (error) {
        console.error("Failed to fetch user rewards:", error)
      }
    }

    fetchUserRewards()
  }, [])

  // Coin spill animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance to play sound
        try {
          playJingle()
        } catch (error) {
          console.warn("Could not play jingle:", error)
        }
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [playJingle])

  const handleItemClick = (item: RewardItem) => {
    setSelectedItem(item)
    setShowPreview(true)
  }

  const handleUnlock = async (item: RewardItem) => {
    if (totalStars >= item.cost) {
      try {
        playUnlock()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: userData } = await supabase
            .from("users")
            .select("rewards")
            .eq("id", user.id)
            .single()

          const updatedRewards = {
            ...userData?.rewards,
            unlockedItems: [...(userData?.rewards?.unlockedItems || []), item.id]
          }

          const { error } = await supabase
            .from("users")
            .update({ 
              rewards: updatedRewards,
              stars: totalStars - item.cost
            })
            .eq("id", user.id)

          if (!error) {
            setTotalStars(prev => prev - item.cost)
            setRewardItems(prev => prev.map(i => 
              i.id === item.id ? { ...i, unlocked: true } : i
            ))
          }
        }
        setShowPreview(false)
      } catch (error) {
        console.error("Failed to unlock item:", error)
      }
    }
  }

  const handleEquip = async (item: RewardItem) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("rewards")
          .eq("id", user.id)
          .single()

        const updatedRewards = {
          ...userData?.rewards,
          [item.type === "accessory" ? "equippedAccessory" : "equippedBackground"]: 
            item.equipped ? null : item.id
        }

        const { error } = await supabase
          .from("users")
          .update({ rewards: updatedRewards })
          .eq("id", user.id)

        if (!error) {
          setRewardItems(prev => prev.map(i => {
            if (i.type === item.type) {
              return {
                ...i,
                equipped: i.id === item.id ? !i.equipped : false
              }
            }
            return i
          }))
        }
      }
    } catch (error) {
      console.error("Failed to equip item:", error)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-amber-900 to-amber-700 relative overflow-hidden">
      {/* Animated torch flames */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`torch-${i}`}
            className="absolute w-8 h-12"
            style={{
              top: "20%",
              left: `${25 * (i + 1)}%`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            <div className="w-full h-full bg-orange-500 rounded-full filter blur-sm" />
            <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-50" />
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 pt-8 px-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="text-white gap-2"
            onClick={() => router.back()}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </Button>
          <motion.div
            className="flex items-center gap-2 bg-yellow-400 rounded-full px-4 py-2"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Star className="w-6 h-6 text-white" />
            <span className="text-xl font-bold text-white">{totalStars}</span>
          </motion.div>
        </div>
        <h1 className="text-4xl font-bold text-center text-purple-300 mt-4 font-comic">
          Your Rewards!
        </h1>
      </div>

      {/* Main treasure chest */}
      <div className="relative z-10 mt-8">
        <motion.div
          className="w-64 h-48 mx-auto bg-amber-800 rounded-lg relative"
          animate={{ rotate: [-1, 1, -1] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          {/* Chest lid */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-24 bg-amber-700 rounded-t-lg origin-bottom"
            animate={{ rotateX: -60 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="absolute inset-0 border-4 border-amber-900 rounded-t-lg" />
          </motion.div>
          
          {/* Glowing stars effect */}
          <motion.div
            className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            animate={{
              y: [-10, 0, -10],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-32 h-32 bg-yellow-400 rounded-full filter blur-xl opacity-20" />
          </motion.div>
        </motion.div>

        {/* Floating coins */}
        <AnimatePresence>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`coin-${i}`}
              className="absolute"
              initial={{ 
                x: Math.random() * 200 - 100,
                y: 0,
                opacity: 0,
                scale: 0
              }}
              animate={{
                y: [-50, 50],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                rotate: 360
              }}
              transition={{
                duration: 2,
                delay: i * 0.5,
                repeat: Infinity,
                repeatDelay: Math.random() * 2
              }}
            >
              <div className="w-6 h-6 bg-yellow-400 rounded-full shadow-lg" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reward shelves */}
      <div className="relative z-10 mt-12 px-6 space-y-8">
        {["accessory", "background", "story"].map((type, shelfIndex) => (
          <div key={type} className="bg-amber-800/50 rounded-xl p-4">
            <h2 className="text-xl font-bold text-white mb-4 capitalize">{type}s</h2>
            <div className="grid grid-cols-2 gap-4">
              {rewardItems
                .filter(item => item.type === type)
                .map(item => (
                  <motion.button
                    key={item.id}
                    className={`relative p-4 rounded-lg ${
                      item.unlocked ? "bg-orange-400" : "bg-gray-600"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <p className="text-white font-bold">{item.name}</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-bold">{item.cost}</span>
                    </div>
                    {!item.unlocked && (
                      <Lock className="absolute top-2 right-2 w-4 h-4 text-white" />
                    )}
                  </motion.button>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Preview modal */}
      <AnimatePresence>
        {showPreview && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 m-4 max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-6xl mb-4 text-center">{selectedItem.icon}</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedItem.name}</h3>
              <p className="text-gray-600 mb-4">{selectedItem.description}</p>
              {selectedItem.unlocked ? (
                <Button
                  className={`w-full ${
                    selectedItem.equipped 
                      ? "bg-gray-500 hover:bg-gray-600" 
                      : "bg-green-500 hover:bg-green-600"
                  } text-white`}
                  onClick={() => handleEquip(selectedItem)}
                >
                  {selectedItem.equipped ? "Unequip" : "Equip"}
                </Button>
              ) : (
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={totalStars < selectedItem.cost}
                  onClick={() => handleUnlock(selectedItem)}
                >
                  {totalStars >= selectedItem.cost ? (
                    <>
                      Unlock for <Star className="w-4 h-4 mx-1" /> {selectedItem.cost}
                    </>
                  ) : (
                    "Not enough stars"
                  )}
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 