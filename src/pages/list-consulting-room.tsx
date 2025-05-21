import { useState } from "react"
import Card from "@/Components/Molecules/card"
import AppLayout from "@/Components/Templates/appLayout"
import ListConsultionRoomCard from "@/Components/Organisms/listConsultingRoomsCard"
import NotificationMessage from "@/Components/Molecules/notificationMessage"

const consultingRooms = [
  {
    id: "451086-2",
    number: "451086-2",
    specialty: "Cardiología",
    site: "Norte",
    location: "Piso 2",
    availability: "active",
  },
  {
    id: "449621-1",
    number: "449621-1",
    specialty: "Pediatría",
    site: "Sur",
    location: "Piso 1",
    availability: "inactive",
  },
]

export default function ConsultationsList() {
  const [successDelete, setSuccessDelete] = useState(false)
  const [deletedId, setDeletedId] = useState<string | null>(null)

  const handleModify = (id: string) => {
    console.log("Modificar consultorio:", id)
  }

  const handleDelete = (id: string) => {
    console.log("Eliminar consultorio:", id)
    setDeletedId(id)
    setSuccessDelete(true)

    setTimeout(() => {
      setSuccessDelete(false)
      setDeletedId(null)
    }, 3000)
  }

  return (
    <AppLayout>
      <Card title="Consultorios Registrados" className="space-y-6 pb-6" titleClassName="text-xl">
        {successDelete && (
          <NotificationMessage
            type="success"
            message="Consultorio eliminado exitosamente"
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6">
          {consultingRooms
            .filter((consultingRoom) => consultingRoom.id !== deletedId)
            .map((consultingRoom) => (
              <ListConsultionRoomCard
                key={consultingRoom.id}
                consultingRoom={consultingRoom}
                onModify={handleModify}
                onDelete={handleDelete}
              />
          ))}
        </div>
      </Card>
    </AppLayout>
  )
}
