import type { AnchorHTMLAttributes, ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"


export interface NavTitleProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  label: ReactNode
}

export default function NavTitle({ href, label}: NavTitleProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
              "block p-4 hover:bg-gray-50 transition-colors",
              isActive && "bg-[var(--color-primary-50)] text-[var(--color-primary-700)] font-medium",
            )}
    >
      {label}
    </Link>
  )
}
