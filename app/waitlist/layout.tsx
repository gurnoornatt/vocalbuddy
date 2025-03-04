import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join the SpeechBuddy Waitlist',
  description: 'Be among the first to experience SpeechBuddy, the interactive speech learning companion for children.',
  openGraph: {
    title: 'Join the SpeechBuddy Waitlist',
    description: 'Be among the first to experience SpeechBuddy, the interactive speech learning companion for children.',
    images: ['/og-waitlist.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Join the SpeechBuddy Waitlist',
    description: 'Be among the first to experience SpeechBuddy, the interactive speech learning companion for children.',
    images: ['/og-waitlist.png'],
  },
}

export default function WaitlistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="min-h-screen">
      {children}
    </section>
  )
} 