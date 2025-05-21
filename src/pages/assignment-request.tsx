import { useState } from "react"
import AppLayout from "@/Components/Templates/appLayout"
import Button from "@/Components/Atoms/button"
import Card from "@/Components/Molecules/card"
import NotificationMessage from "@/Components/Molecules/notificationMessage"

const requestData = {
  number: "1056",
  specialty: "Cardiología",
  site: "Norte",
  schedule: "10:00 AM",
  requester: "Dr. Juan Pérez",
  document: "1234567890",
}

export default function AssignmentRequest() {
  const [success, setSuccess] = useState(false)
  const [action, setAction] = useState<string | null>(null)

  const handleAccept = () => {
    console.log("Aceptar solicitud")
    setAction("aceptada")
    setSuccess(true)

    // Reset notification after a delay
    setTimeout(() => {
      setSuccess(false)
      setAction(null)
    }, 3000)
  }

  const handleReject = () => {
    console.log("Rechazar solicitud")
    setAction("rechazada")
    setSuccess(true)

    setTimeout(() => {
      setSuccess(false)
      setAction(null)
    }, 3000)
  }

  return (
    <AppLayout>
        <Card title="Solicitud de asignación" className="space-y-6 pb-6" titleClassName="text-xl">
            {success && (
            <NotificationMessage
                type="success"
                message={`Solicitud ${action} exitosamente`}
                className="mb-6"
            />
            )}

            <div className="max-w-2xl mx-auto">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                    <p className="text-sm font-medium text-gray-500">Número de solicitud:</p>
                    <p className="font-medium">{requestData.number}</p>
                    </div>

                    <div>
                    <p className="text-sm font-medium text-gray-500">Especialidad:</p>
                    <p>{requestData.specialty}</p>
                    </div>

                    <div>
                    <p className="text-sm font-medium text-gray-500">Sede:</p>
                    <p>{requestData.site}</p>
                    </div>

                    <div>
                    <p className="text-sm font-medium text-gray-500">Horario:</p>
                    <p>{requestData.schedule}</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-md font-medium mb-3">Datos del solicitante</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Solicitante:</p>
                        <p>{requestData.requester}</p>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-500">Documento:</p>
                        <p>{requestData.document}</p>
                    </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button variant="destructive" onClick={handleReject}>
                    Rechazar
                    </Button>
                    <Button onClick={handleAccept}>Aceptar</Button>
                </div>
                </div>
            </div>
        </Card>
    </AppLayout>
  )
}
