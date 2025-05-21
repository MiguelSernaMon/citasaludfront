import type { AnchorHTMLAttributes, ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const navTitleVariants = cva(
  "block p-4 transition-colors rounded-md",
  {
    variants: {
      variant: {
        default: "hover:bg-gray-50 text-gray-700",
        active: "bg-teal-50 text-teal-700 font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface NavTitleProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof navTitleVariants> {
  href: string
  label: ReactNode
}

export default function NavTitle({ href, label, className, variant, ...props }: NavTitleProps) {
  const pathname = usePathname()

  const isActive = pathname === href
  const appliedVariant = variant ?? (isActive ? "active" : "default")

  return (
    <Link
      href={href}
      className={cn(navTitleVariants({ variant: appliedVariant, className }))}
      {...props}
    >
      {label}
    </Link>
  )
}
