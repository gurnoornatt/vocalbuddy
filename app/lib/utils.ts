import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { customAlphabet } from 'nanoid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Create a custom nanoid generator with only uppercase letters and numbers
// Excluding similar-looking characters like 0, O, 1, I, etc.
const nanoid = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 8)

/**
 * Generate a unique referral code
 */
export function generateReferralCode(): string {
  return nanoid()
}

/**
 * Format a waitlist position with commas
 */
export function formatPosition(position: number): string {
  return position.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

/**
 * Calculate position improvement based on referral count
 * @param referralCount Number of successful referrals
 */
export function calculatePositionImprovement(referralCount: number): number {
  if (referralCount >= 3) {
    // Skip ahead by 100 positions for every 3 referrals
    return Math.floor(referralCount / 3) * 100
  }
  return 0
}

/**
 * Calculate final position after referral improvements
 */
export function calculateFinalPosition(position: number, referralCount: number): number {
  const improvement = calculatePositionImprovement(referralCount)
  return Math.max(1, position - improvement)
}

/**
 * Get referral milestone text
 */
export function getReferralMilestoneText(referralCount: number): string {
  const remaining = 3 - (referralCount % 3)
  if (remaining === 3) {
    return `You've earned a ${calculatePositionImprovement(referralCount)} position boost!`
  }
  return `Invite ${remaining} more ${remaining === 1 ? 'person' : 'people'} to skip ahead 100 positions!`
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
} 