import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface CardProps {
  title: string
  children: ReactNode
  className?: string
  titleClassName?: string
}

export default function Card({ title, children, className, titleClassName }: CardProps) {
  return (
    <div className={cn("bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden", className)}>
      <div className={cn("p-4 bg-[var(--color-primary)] text-white font-medium", titleClassName)}>
        {title}
      </div>
      <div className="divide-y divide-gray-200">{children}</div>
    </div>
  )
}
