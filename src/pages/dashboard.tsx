import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { UserProvider } from "@/context/userContext"
import NavMenu from "@/Components/Molecules/navMenu"
import Card from "@/Components/Molecules/card"
import AppHeader from "@/Components/Molecules/appHeader"
import ConsultingRoomCard from "@/Components/Molecules/consultingRoomCard"
import ConsultingRoomFilters from "@/Components/Molecules/consultingRoomFilters"
import ConsultingRoomExport from "@/Components/Molecules/consultingRoomExport"

type User = {
  name: string
  document: string
  email: string
  role: string
}

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
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push("/")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

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
    { value: "", label: "Todas" },
    { value: "cardiology", label: "Cardiología" },
    { value: "dermatology", label: "Dermatología" },
    { value: "neurology", label: "Neurología" },
    { value: "pediatrics", label: "Pediatría" },
    { value: "dentistry", label: "Odontología" },
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

  if (!user) return null

  return (
    <UserProvider>
      <div className="min-h-screen bg-gray-100">
        <AppHeader user={user} onLogout={handleLogout} />

        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <NavMenu userRole={user.role} />
            </div>

            <div className="md:col-span-3">
                <Card title="Dashboard" titleClassName="text-xl">

                    <div className="p-6">
                    <div className="space-y-6">
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
                            {consultingRooms.map((consultingRoom) => (
                               <ConsultingRoomCard key={consultingRoom.id} room={consultingRoom} />
                            ))}
                        </div>
                        </div>
                    </div>
                    </div>
                </Card>
            </div>
          </div>
        </main>
      </div>
    </UserProvider>
  )
}
