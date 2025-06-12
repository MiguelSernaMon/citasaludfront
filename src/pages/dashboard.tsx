import Card from "@/Components/Molecules/card"
import AppLayout from "@/Components/Templates/appLayout"
import ConsultingRoomCard from "@/Components/Molecules/consultingRoomCard"
import ConsultingRoomFilters from "@/Components/Molecules/consultingRoomFilters"
import ConsultingRoomExport from "@/Components/Molecules/consultingRoomExport"

type ConsultingRoomStatus = "available" | "assigned" | "maintenance"

type ConsultingRoom = {
  id: string
  number: string
  specialty: string
  site: string
  status: ConsultingRoomStatus
}

const consultingRooms: ConsultingRoom[] = [
  {
    id: "462598-2",
    number: "462598-2",
    specialty: "Odontología",
    site: "Bello",
    status: "available",
  },
  {
    id: "845321-1",
    number: "845321-1",
    specialty: "Odontología",
    site: "Bello",
    status: "assigned",
  },
  {
    id: "647591-3",
    number: "647591-3",
    specialty: "Odontología",
    site: "Bello",
    status: "maintenance",
  },
]

export default function Dashboard() {
  const siteOptions = [
    { value: "", label: "Todas" },
    { value: "north", label: "Norte" },
    { value: "south", label: "Sur" },
    { value: "east", label: "Este" },
    { value: "west", label: "Oeste" },
    { value: "central", label: "Central" },
    { value: "bello", label: "Bello" },
  ]

  const specialtyOptions = [
  
  { "id": 1, "nombre": "Pediatría" },
  { "id": 2, "nombre": "Medicina General" },
  { "id": 3, "nombre": "Odontología" },
  { "id": 4, "nombre": "Ginecología" },
  { "id": 5, "nombre": "Cardiología" },
  { "id": 6, "nombre": "Dermatología" },
  { "id": 7, "nombre": "Psiquiatría" },
  { "id": 8, "nombre": "Oftalmología" },
  { "id": 9, "nombre": "Traumatología" },
  { "id": 10, "nombre": "Neurología" }

  ]

  const statusOptions = [
    { value: "", label: "Todos" },
    { value: "available", label: "Disponible" },
    { value: "assigned", label: "Asignado" },
    { value: "maintenance", label: "Mantenimiento" },
  ]

  const fileTypeOptions = [
    { value: "excel", label: "Excel" },
    { value: "pdf", label: "PDF" },
    { value: "csv", label: "CSV" },
  ]

  return (
    <AppLayout>
        <Card title="Dashboard" titleClassName="text-xl">
            <div className="p-6 space-y-6">
            <ConsultingRoomFilters
                siteOptions={siteOptions}
                specialtyOptions={specialtyOptions}
                statusOptions={statusOptions}
            />

            <ConsultingRoomExport
                fileTypeOptions={fileTypeOptions}
                onExport={() => console.log("Exportar datos")}
            />

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Consultorios Registrados</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {consultingRooms.map((room) => (
                    <ConsultingRoomCard key={room.id} room={room} />
                ))}
                </div>
            </div>
            </div>
        </Card>
    </AppLayout>
  )
}
