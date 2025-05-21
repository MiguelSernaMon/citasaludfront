import type { FC } from "react"
import { cn } from "@/lib/utils"

type ConsultingRoomStatus = "available" | "assigned" | "maintenance"

export interface ConsultingRoom {
  id: string
  number: string
  specialty: string
  site: string
  status: ConsultingRoomStatus
}

interface ConsultingRoomCardProps {
  room: ConsultingRoom
  className?: string
}

const statusStyles: Record<ConsultingRoomStatus, string> = {
  available: "bg-green-100 text-green-800",
  assigned: "bg-blue-100 text-blue-800",
  maintenance: "bg-yellow-100 text-yellow-800",
}

const statusLabels: Record<ConsultingRoomStatus, string> = {
  available: "Disponible",
  assigned: "Asignado",
  maintenance: "Mantenimiento",
}

const ConsultingRoomCard: FC<ConsultingRoomCardProps> = ({ room, className }) => {
  return (
    <div className={cn("bg-white p-4 rounded-lg border border-gray-200 shadow-sm", className)}>
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">Número de consultorio:</p>
            <p className="font-medium">{room.number}</p>
          </div>

          <div
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
              statusStyles[room.status]
            )}
          >
            {statusLabels[room.status]}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Especialidad:</p>
          <p>{room.specialty}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Sede:</p>
          <p>{room.site}</p>
        </div>
      </div>
    </div>
  )
}

export default ConsultingRoomCard
