import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Card from "./card"
import { FC } from "react"

interface NavItemProps {
  href: string
  label: string
  active: boolean
  onClick: () => void
}

const NavItem: FC<NavItemProps> = ({ href, label, active, onClick }) => {
  return (
    <li>
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault()
          onClick()
        }}
        className={cn(
          "block px-4 py-2 rounded-md transition-colors",
          active
            ? "bg-[var(--color-primary-50)] text-[var(--color-primary-900)] font-medium"
            : "hover:bg-[var(--color-primary-50)]"
        )}
      >
        {label}
      </a>
    </li>
  )
}

export default function NavMenu() {
  const router = useRouter()
  // Usar usePathname en lugar de window.location para compatibilidad con SSR
  const currentPath = usePathname()

  // Opciones de navegación fijas (sin roles) - Eliminada la opción de "Mantenimientos programados"
  const menuItems = [
    { label: "Dashboard", href: "/list-consulting-room" },
    { label: "Registro consultorio", href: "/register-consulting-room" },
    // Se elimina la opción "Mantenimientos programados"
  ]

  // Navegación mejorada
  const handleClick = (href: string) => {
    // Evitar navegación si ya estamos en la página
    if (currentPath === href) return
    router.push(href)
  }

  // Función para determinar si una ruta está activa (incluyendo rutas anidadas)
  const isRouteActive = (href: string) => {
    if (href === currentPath) return true

    // Caso especial para edición de consultorios
    if (
      href === "/list-consulting-room" &&
      currentPath?.startsWith("/edit-consulting-room/")
    ) {
      return true
    }

    return false
  }

  return (
    <Card title="Gestión de consultorios">
      <nav className="bg-white rounded-md shadow-sm p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              active={isRouteActive(item.href)}
              onClick={() => handleClick(item.href)}
            />
          ))}
        </ul>
      </nav>
    </Card>
  )
}