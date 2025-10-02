"use client"

import { useState } from "react"
import { User, LogOut, Settings, Mail, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "sonner"

interface UserMenuProps {
  className?: string
}

export function UserMenu({ className }: UserMenuProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  const getUserDisplayName = () => {
    return user.user_metadata?.full_name || 
           user.user_metadata?.name || 
           user.email?.split('@')[0] || 
           'Utilisateur'
  }

  const getUserEmail = () => {
    return user.email || 'Email non disponible'
  }

  const handleSignOut = async () => {
    try {
      const response = await fetch('/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        redirect: 'manual'
      })

      if (response.status === 302) {
        toast.success('Déconnexion réussie')
        setIsOpen(false) // Fermer la barre latérale
        window.location.href = '/'
      } else if (response.ok) {
        toast.success('Déconnexion réussie')
        setIsOpen(false) // Fermer la barre latérale
        window.location.href = '/'
      } else {
        toast.error('Erreur lors de la déconnexion')
      }
    } catch (error) {
      toast.error('Une erreur inattendue s\'est produite')
      console.error('Erreur de déconnexion:', error)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          size="icon"
          variant="outline" 
          className={`rounded-full cursor-pointer ${className}`}
          type="button"
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={user.user_metadata?.avatar_url} alt="User" />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 flex flex-col p-6">
        <SheetHeader className="text-center pb-6">
          <SheetTitle className="flex flex-col items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.user_metadata?.avatar_url} alt="User" />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="text-lg font-semibold">{getUserDisplayName()}</p>
              <p className="text-sm text-muted-foreground">{getUserEmail()}</p>
            </div>
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 space-y-6 px-2">
          {/* Section Profil */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Compte
            </h3>
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 h-10"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-4 w-4" />
                <span>Mon Profil</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 h-10"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-4 w-4" />
                <span>Paramètres</span>
              </Button>
            </div>
          </div>

          {/* Section Support */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Support
            </h3>
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 h-10"
                onClick={() => setIsOpen(false)}
              >
                <Mail className="h-4 w-4" />
                <span>Contacter le support</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer avec bouton de déconnexion */}
        <div className="border-t pt-4 px-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            <span>Se déconnecter</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
