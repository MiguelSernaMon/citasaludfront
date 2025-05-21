"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import NavTitle from "@/Components/Atoms/navTitle"

type NavItem = {
  label: string
  href: string
}

type NavMenuProps = {
  userRole: string
}

export default function NavMenu({ userRole }: NavMenuProps) {
  const pathname = usePathname()

  const getMenuItems = (): NavItem[] => {
    switch (userRole) {
      case "administrator":
        return [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Registro consultorio", href: "/register-consultation" },
          { label: "Consultorios existentes", href: "/consultations-list" },
          { label: "Solicitud de asignación", href: "/assignment-request" },
          { label: "Mantenimientos programados", href: "/maintenance-schedule" },
        ]
      case "doctor":
        return [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Solicitar consultorio", href: "/request-consultation" },
          { label: "Mis solicitudes", href: "/requests-list" },
        ]
      case "coordinator":
        return [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Mantenimientos programados", href: "/maintenance-schedule" },
        ]
      default:
        return []
    }
  }

  const menuItems = getMenuItems()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 bg-teal-600 text-white font-medium">Gestión de consultorios</div>
      <div className="divide-y divide-gray-200">
        {menuItems.map((item) => (
          <NavTitle key={item.href} href={item.href} label={item.label} />
        ))}
      </div>
    </div>
  )
}
