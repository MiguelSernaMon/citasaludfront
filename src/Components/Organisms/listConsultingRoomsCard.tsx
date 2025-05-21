import type { FC } from "react"
import Button from "@/Components/Atoms/button"
import { cn } from "@/lib/utils"
import { Badge } from "@/Components/Atoms/badge"

interface ConsultingRoom {
  id: string
  number: string
  specialty: string
  site: string
  location: string
  availability: string
}

interface ListConsultingRoomCardProps {
  consultingRoom: ConsultingRoom
  onModify: (id: string) => void
  onDelete: (id: string) => void
  className?: string
}

const ListConsultionRoomCard: FC<ListConsultingRoomCardProps> = ({
  consultingRoom: consultingRoom,
  onModify,
  onDelete,
  className,
}) => {
  return (
    <div className={cn("bg-gray-50 rounded-lg p-4 border border-gray-200", className)}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Número de consultorio:</p>
          <p>{consultingRoom.number}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Especialidad:</p>
          <p>{consultingRoom.specialty}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Sede:</p>
          <p>{consultingRoom.site}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Ubicación:</p>
          <p>{consultingRoom.location}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Disponibilidad:</p>
          <Badge variant={consultingRoom.availability === "active" ? "success" : "secondary"}>
            {consultingRoom.availability === "active" ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onModify(consultingRoom.id)}>
          Modificar
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(consultingRoom.id)}>
          Eliminar
        </Button>
      </div>
    </div>
  )
}

export default ListConsultionRoomCard;
