import type { FC, ReactNode } from "react"
import { cn } from "@/lib/utils"

type NotificationType = "success" | "error" | "info" | "warning"

interface NotificationMessageProps {
  type?: NotificationType
  message: ReactNode
  className?: string
}

const typeStyles: Record<NotificationType, string> = {
  success: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
  warning: "bg-yellow-100 text-yellow-800",
}

const NotificationMessage: FC<NotificationMessageProps> = ({ type = "info", message, className }) => {
  return (
    <div className={cn("m-6 p-4 rounded-md", typeStyles[type], className)}>
      {message}
    </div>
  )
}

export default NotificationMessage
