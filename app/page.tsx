"use client"

import { Hero } from "@/components/hero"
import { SocialProof } from "@/components/social-proof"

export default function Home() {
  return (
    <div className="min-h-screen font-sans bg-background">
      {/* Conteneur du header avec masque de fondu */}
      <div
        className="absolute top-0 left-0 w-full h-1/3 dark:h-0 bg-gradient-to-r from-[#abf4fd] via-blue-100 to-purple-300"
        style={{ maskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)' }}
      />
      <Hero />
      <SocialProof />
    </div>
  )
}
