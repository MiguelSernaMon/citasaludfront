import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import Card from "./card"

interface NavItemProps {
  href: string
  label: string
  active: boolean
  onClick: () => void
}

const NavItem = ({ href, label, active, onClick }: NavItemProps) => {
  return (
    <li>
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault()
          onClick()
        }}
        className={cn(
          "block px-4 py-2 rounded-md",
          active
            ? "bg-[var(--color-primary-50)] text-[var(--color-primary-900)]"
            : "hover:bg-[var(--color-primary-50)]"
        )}
      >
        {label}
      </a>
    </li>
  )
}

interface NavMenuProps {
  userRole: string
}

export default function NavMenu({ userRole }: NavMenuProps) {
  const router = useRouter()
  const currentPath = window.location.pathname

  const getMenuItems = () => {
    // Elementos comunes para todos los roles
    let items = [{ label: "Dashboard", href: "/dashboard" }]

    switch (userRole) {
      case "administrator":
        return [
          ...items,
          { label: "Registro consultorio", href: "/register-consulting-room" },
          { label: "Consultorios existentes", href: "/list-consulting-room" },
          { label: "Consultorios no operativos", href: "/manage-inactive-rooms" },
          { label: "Solicitud de asignación", href: "/assignment-request" },
          { label: "Mantenimientos programados", href: "/maintenance-schedule" },
        ]
      case "coordinator":
        return [
          ...items,
          { label: "Asignación de consultorios", href: "/assign-consulting-room" },
          { label: "Programación de especialidades", href: "/specialty-schedule" },
        ]
      case "doctor":
        return [
          ...items,
          { label: "Mi consultorio", href: "/my-consulting-room" },
          { label: "Horario de atención", href: "/attention-schedule" },
        ]
      default:
        return items
    }
  }

  const menuItems = getMenuItems()

  const handleClick = (href: string) => {
    router.push(href)
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
              active={currentPath === item.href}
              onClick={() => handleClick(item.href)}
            />
          ))}
        </ul>
      </nav>
    </Card>
  )
}
