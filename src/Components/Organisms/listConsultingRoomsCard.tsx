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
  availability: string // Ahora trabajaremos solo con strings
}

// Función auxiliar para obtener la variante de la badge según el estado
const getStatusVariant = (status: string) => {
  switch(status.toLowerCase()) {
    case "habilitado":
      return "success" as const;
    case "deshabilitado":
      return "destructive" as const;
    case "asignado":
      return "warning" as const;
    default:
      return "secondary" as const;
  }
};

// Función auxiliar para determinar si un consultorio está deshabilitado
const isDisabled = (status: string): boolean => {
  return status.toLowerCase() === "deshabilitado";
};

// Función auxiliar para determinar si un consultorio está asignado
const isAssigned = (status: string): boolean => {
  return status.toLowerCase() === "asignado";
};



// Función para determinar si se puede programar mantenimiento (habilitado o asignado)
const canScheduleMaintenance = (status: string): boolean => {
  const statusLower = status.toLowerCase();
  return statusLower === "habilitado" || statusLower === "asignado";
};

interface ListConsultingRoomCardProps {
  consultingRoom: ConsultingRoom
  onModify: (id: string) => void
  onDelete: (id: string) => void
  onScheduleMaintenance?: (id: string) => void
  className?: string
}

const ListConsultionRoomCard: FC<ListConsultingRoomCardProps> = ({
  consultingRoom,
  onModify,
  onDelete,
  onScheduleMaintenance,
  className,
}) => {
  // Obtener la variante según el estado
  const statusVariant = getStatusVariant(consultingRoom.availability);
  
  return (
    <div className={cn("bg-gray-50 rounded-lg p-4 border border-gray-200", className)}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Número de consultorio:</p>
          <p className="font-medium">{consultingRoom.number}</p>
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
          <p className="text-sm font-medium text-gray-500">Estado:</p>
          <div className="mt-1">
            <Badge variant={statusVariant}>
              {consultingRoom.availability}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {/* Botón para programar mantenimiento (solo para habilitados o asignados) */}
        {canScheduleMaintenance(consultingRoom.availability) && onScheduleMaintenance && (
          <Button 
            variant="outline" 
            size="sm"
            className="border-amber-500 text-amber-600 hover:bg-amber-50"
            onClick={() => onScheduleMaintenance(consultingRoom.id)}
          >
            Programar Mantenimiento
          </Button>
        )}
        
        {/* Botón de modificar siempre visible */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onModify(consultingRoom.id)}
        >
          Modificar
        </Button>
        
        {/* Botón de eliminar solo para consultorios deshabilitados */}
        {isDisabled(consultingRoom.availability) && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => onDelete(consultingRoom.id)}
          >
            Eliminar
          </Button>
        )}
        
        {/* Botón para ver asignación solo para consultorios asignados */}
        {isAssigned(consultingRoom.availability) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onModify(consultingRoom.id)}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            Ver asignación
          </Button>
        )}
      </div>
    </div>
  )
}

export default ListConsultionRoomCard;