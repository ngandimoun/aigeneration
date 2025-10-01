"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Chrome, User } from "lucide-react"
import { toast } from "sonner"

interface GoogleAccount {
  id: string
  email: string
  name: string
  picture: string
}

interface GoogleAuthPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function GoogleAuthPopup({ isOpen, onClose }: GoogleAuthPopupProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [googleAccounts, setGoogleAccounts] = useState<GoogleAccount[]>([])
  const [isDetectingAccounts, setIsDetectingAccounts] = useState(true)
  const supabase = createClient()

  // Détecter les comptes Google connectés
  useEffect(() => {
    if (isOpen) {
      detectGoogleAccounts()
    }
  }, [isOpen])

  const detectGoogleAccounts = async () => {
    setIsDetectingAccounts(true)
    try {
      // Utiliser l'API Google Identity pour détecter les comptes
      if (typeof window !== 'undefined' && window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: () => {}, // Callback vide pour la détection
        })

        // Détecter les comptes disponibles
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Aucun compte détecté ou utilisateur a fermé
            setGoogleAccounts([])
          }
        })
      }
    } catch (error) {
      console.error('Erreur lors de la détection des comptes Google:', error)
    } finally {
      setIsDetectingAccounts(false)
    }
  }

  const signInWithGoogle = async (account?: GoogleAccount) => {
    setIsLoading(true)
    try {
      // Approche simplifiée : redirection directe
      toast.success('Redirection vers Google...')
      onClose()
      
      // Redirection directe vers la route d'authentification
      window.location.href = '/auth/signin?provider=google'
      
    } catch (error) {
      toast.error('Une erreur inattendue s\'est produite')
      console.error('Erreur inattendue:', error)
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Chrome className="h-5 w-5 text-blue-500" />
            Connexion avec Google
          </DialogTitle>
          <DialogDescription>
            Continuez avec votre compte Google pour accéder à toutes les fonctionnalités.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isDetectingAccounts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
              <span className="ml-2 text-sm text-gray-500">
                Détection des comptes Google...
              </span>
            </div>
          ) : (
            <>
              {/* Bouton de connexion principal */}
              <Button
                onClick={() => signInWithGoogle()}
                disabled={isLoading}
                className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                type="button"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Chrome className="h-4 w-4 mr-2" />
                )}
                Continuer avec Google
              </Button>

              {/* Message informatif */}
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Déclaration globale pour TypeScript
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: (callback: (notification: any) => void) => void
        }
      }
    }
  }
}
