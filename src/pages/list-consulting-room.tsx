import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AppLayout from "@/Components/Templates/appLayout"
import Card from "@/Components/Molecules/card"
import Button from "@/Components/Atoms/button"
import ListConsultingRoomCard from "@/Components/Organisms/listConsultingRoomsCard"
import { consultorioService, ConsultorioResponseDTO } from "@/services/consultorioService"
import NotificationMessage from "@/Components/Molecules/notificationMessage"

export default function ListConsultingRoom() {
  const router = useRouter();
  const [consultingRooms, setConsultingRooms] = useState<ConsultorioResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar los consultorios al montar el componente
  useEffect(() => {
    loadConsultingRooms();
  }, []);

  const loadConsultingRooms = async () => {
    setLoading(true);
    try {
      const data = await consultorioService.getConsultorios();
      setConsultingRooms(data);
      setError(null);
    } catch (error) {
      console.error("Error al cargar consultorios:", error);
      setError("No se pudieron cargar los consultorios. Por favor, intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleModify = (id: number) => {
    router.push(`/edit-consulting-room/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar este consultorio?")) {
      try {
        await consultorioService.deleteConsultorio(id);
        setSuccess("Consultorio eliminado correctamente");
        
        // Actualizar la lista de consultorios
        setConsultingRooms(prev => prev.filter(room => room.id_consultorio !== id));
        
        // Limpiar el mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } catch (error) {
        console.error(`Error al eliminar consultorio ${id}:`, error);
        setError("No se pudo eliminar el consultorio. Por favor, intente de nuevo.");
      }
    }
  };

  // Mapear la respuesta de la API a nuestro modelo de datos
  const mapConsultorio = (consultorio: ConsultorioResponseDTO) => ({
    id: consultorio.id_consultorio.toString(),
    number: consultorio.numero_consultorio,
    specialty: consultorio.tipo,
    site: consultorio.sede,
    location: consultorio.ciudad,
    availability: consultorio.estado.toLowerCase() === "activo" ? "active" : "inactive",
  });

  return (
    <AppLayout>
      <Card title="Consultorios existentes" titleClassName="text-xl">
        {error && <NotificationMessage type="error" message={error} className="mb-4" />}
        {success && <NotificationMessage type="success" message={success} className="mb-4" />}
        
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Lista de consultorios</h2>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => loadConsultingRooms()}
              >
                Actualizar
              </Button>
              <Button onClick={() => router.push("/register-consulting-room")}>
                Agregar consultorio
              </Button>
            </div>
          </div>
          
          {loading ? (
            <p className="text-center py-8">Cargando consultorios...</p>
          ) : consultingRooms && consultingRooms.length > 0 ? (
            <div className="space-y-4">
              {Array.isArray(consultingRooms) && consultingRooms.map(consultorio => (
                <ListConsultingRoomCard
                  key={consultorio.id_consultorio}
                  consultingRoom={mapConsultorio(consultorio)}
                  onModify={() => handleModify(consultorio.id_consultorio)}
                  onDelete={() => handleDelete(consultorio.id_consultorio)}
                />
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">No hay consultorios registrados.</p>
          )}
        </div>
      </Card>
    </AppLayout>
  );
}
