"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { GoogleAuthPopup } from "@/components/auth/google-auth-popup"
import { useAuth } from "@/components/auth/auth-provider"
import { Sparkles } from "lucide-react"

export function Hero() {
  const [isAuthPopupOpen, setIsAuthPopupOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent">
      {/* Starfield background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute h-0.5 w-0.5 rounded-full bg-white/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${2 + Math.random() * 3}s infinite ${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Decorative sparkles */}
      <div className="absolute left-[15%] top-[35%] text-purple-500">
        <Sparkles className="h-6 w-6 animate-pulse" />
      </div>
      <div className="absolute right-[15%] top-[55%] text-purple-500">
        <Sparkles className="h-4 w-4 animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <Navigation />

      {/* Hero content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-28 text-center">
        <h1 className="mb-8 font-bold leading-tight">
          <span className="block text-5xl text-primary">One Platform,</span>
          <span className="block bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-5xl text-transparent">
            Endless Possibilities
          </span>
        </h1>

        <p className="mx-auto mb-12 max-w-2xl text-sm leading-relaxed text-gray-500 md:text-sm z-20">
          From automation to collaboration, our solution empowers your team to work smarter, not harder. Discover the
          endless possibilities waiting for you.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          {!isMounted ? (
            <Button 
              size="lg" 
              className="bg-purple-600 text-sm font-semibold text-white cursor-pointer"
              disabled
              type="button"
            >
              Loading...
            </Button>
          ) : user ? (
            <Button 
              size="lg" 
              className="bg-purple-600 text-sm font-semibold text-white cursor-pointer"
              onClick={() => window.location.href = '/content'}
              type="button"
            >
              Access Application
            </Button>
          ) : (
            <Button 
              size="lg" 
              className="bg-purple-600 text-sm font-semibold text-white cursor-pointer"
              onClick={() => setIsAuthPopupOpen(true)}
              type="button"
            >
              Get Started Now
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            className="text-sm font-semibold cursor-pointer"
            type="button"
          >
            Try Tutorial Now
          </Button>
        </div>
      </div>

      {/* Linear wave shape at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 200" className="w-full h-32" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5eecff" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <path
            fill="url(#waveGradient)"
            fillOpacity="1"
            d="M0,100 Q300,20 600,100 T1200,100 L1200,200 L0,200 Z"
          ></path>
        </svg>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Popup d'authentification Google */}
      <GoogleAuthPopup 
        isOpen={isAuthPopupOpen} 
        onClose={() => setIsAuthPopupOpen(false)} 
      />
    </div>
  )
}
