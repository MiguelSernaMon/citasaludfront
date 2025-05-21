"use client"

import type { FC } from "react"
import Button from "@/Components/Atoms/button"
import { cn } from "@/lib/utils"

interface AppHeaderProps {
  user: {
    name: string
    role: string
  }
  onLogout: () => void
  className?: string
}

const AppHeader: FC<AppHeaderProps> = ({ user, onLogout, className }) => {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "administrator":
        return "Administrador"
      case "doctor":
        return "Médico"
      case "coordinator":
        return "Coordinador de sede"
      default:
        return "Usuario"
    }
  }

  return (
    <header className={cn("bg-[var(--color-primary)] text-white p-4 shadow-md", className)}>
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">CITASalud</h1>

        <div className="flex items-center gap-4">
          <div className="hidden md:block text-sm">
            <span className="opacity-75 mr-1">{getRoleLabel(user.role)}:</span>
            <span>{user.name}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-white hover:bg-[var(--color-primary-700)]"
          >
            Cerrar sesión
          </Button>
        </div>
      </div>
    </header>
  )
}

export default AppHeader
