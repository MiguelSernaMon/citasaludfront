import { FC, useEffect, useState } from "react"
import { useNotifications } from "@/context/notificationContext"
import { cn } from "@/lib/utils"
import { Bell, X } from "lucide-react"
import Button from "@/Components/Atoms/button"

interface NotificationCenterProps {
  className?: string
}

const NotificationCenter: FC<NotificationCenterProps> = ({ className }) => {
  const { notifications, clearNotification, clearAllNotifications, connectionStatus} = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!isOpen && notifications.length > unreadCount) {
      setUnreadCount(notifications.length)
    }
  }, [notifications, isOpen, unreadCount])

  const toggleOpen = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setUnreadCount(0)
    }
  }

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200"
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500"
      case "connecting":
        return "bg-yellow-500"
      case "error":
      case "disconnected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-2">
        <span 
          className={`w-2 h-2 rounded-full ${getConnectionStatusColor()}`} 
          title={`Estado: ${connectionStatus}`}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleOpen}
          className="relative p-2"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </div>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-md border border-gray-200 bg-white shadow-lg z-50">
          <div className="flex items-center justify-between border-b p-3">
            <h3 className="font-medium">Notificaciones</h3>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllNotifications}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-gray-500">No hay notificaciones</p>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "relative rounded-md border p-3",
                      getTypeStyle(notification.type)
                    )}
                  >
                    <button
                      onClick={() => clearNotification(notification.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <p className="mb-1 text-sm">{notification.message}</p>
                    <p className="text-xs opacity-70">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationCenter