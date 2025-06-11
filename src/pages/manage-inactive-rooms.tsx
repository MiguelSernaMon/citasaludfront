import { useState, useEffect } from "react"
import AppLayout from "@/Components/Templates/appLayout"
import Card from "@/Components/Molecules/card"
import Button from "@/Components/Atoms/button"
import { Badge } from "@/Components/Atoms/badge"
import NotificationMessage from "@/Components/Molecules/notificationMessage"
import { consultorioService, ConsultorioResponseDTO } from "@/services/consultorioService"

export default function ManageInactiveRooms() {
  const [inactiveRooms, setInactiveRooms] = useState<ConsultorioResponseDTO[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar los consultorios inactivos al montar el componente
  useEffect(() => {
    loadInactiveRooms();
  }, []);

  const loadInactiveRooms = async () => {
    setLoading(true);
    try {
      const allConsultorios = await consultorioService.getConsultorios();
      // Filtrar solo los inactivos
      const inactivos = allConsultorios.filter(c => 
        c.estado.toLowerCase() === "inactivo" || 
        c.estado.toLowerCase() === "mantenimiento"
      );
      
      setInactiveRooms(inactivos);
      setError(null);
      // Limpiar selección al recargar
      setSelectedRooms([]);
    } catch (error) {
      console.error("Error al cargar consultorios inactivos:", error);
      setError("No se pudieron cargar los consultorios inactivos.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoom = (id: string) => {
    setSelectedRooms(prev => 
      prev.includes(id) 
        ? prev.filter(roomId => roomId !== id) 
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRooms.length === inactiveRooms.length) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms(inactiveRooms.map(room => room.id_consultorio.toString()));
    }
  };

  const handleReactivateRoom = async (id: string) => {
    try {
      // Buscar el consultorio para obtener sus datos actuales
      const consultorio = inactiveRooms.find(c => c.id_consultorio.toString() === id);
      if (!consultorio) return;
      
      // Obtener el ID del estado "Activo" (normalmente 1)
      const estadosData = await consultorioService.getEstados();
      const estadoActivoId = estadosData.find(e => e.nombre.toLowerCase() === "activo")?.id || 1;
      
      // Actualizar solo el estado, manteniendo el resto de datos
      await consultorioService.updateConsultorio(Number(id), { 
        estado_id: estadoActivoId 
      });
      
      setSuccess(`Consultorio ${consultorio.numero_consultorio} reactivado correctamente`);
      
      // Actualizar la lista sin necesidad de recargar todo
      setInactiveRooms(prev => prev.filter(room => room.id_consultorio.toString() !== id));
      
      // Remover de seleccionados si estaba seleccionado
      setSelectedRooms(prev => prev.filter(roomId => roomId !== id));
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error(`Error al reactivar consultorio ${id}:`, error);
      setError("No se pudo reactivar el consultorio. Intente nuevamente.");
    }
  };
  
  const handleDeleteSelected = async () => {
    if (selectedRooms.length === 0) return;
    
    if (!confirm(`¿Está seguro de eliminar ${selectedRooms.length} consultorios?`)) {
      return;
    }
    
    setDeleting(true);
    try {
      // Eliminar todos los consultorios seleccionados en serie
      for (const id of selectedRooms) {
        await consultorioService.deleteConsultorio(Number(id));
      }
      
      setSuccess(`Se eliminaron ${selectedRooms.length} consultorios correctamente`);
      
      // Actualizar la lista
      setInactiveRooms(prev => 
        prev.filter(room => !selectedRooms.includes(room.id_consultorio.toString()))
      );
      
      // Limpiar selección
      setSelectedRooms([]);
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("Error al eliminar consultorios:", error);
      setError("Ocurrió un error al eliminar los consultorios.");
    } finally {
      setDeleting(false);
    }
  };



  const getStatusBadge = (estado: string) => {
    if (estado.toLowerCase() === "mantenimiento") {
      return <Badge variant="warning">Mantenimiento</Badge>;
    }
    return <Badge variant="secondary">No operativo</Badge>;
  };

  return (
    <AppLayout>
      <Card title="Gestión de Consultorios No Operativos" titleClassName="text-xl">
        {error && <NotificationMessage type="error" message={error} className="mb-4" />}
        {success && <NotificationMessage type="success" message={success} className="mb-4" />}
        
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="select-all"
                className="h-4 w-4 rounded border-gray-300"
                checked={selectedRooms.length === inactiveRooms.length && inactiveRooms.length > 0}
                onChange={handleSelectAll}
                disabled={inactiveRooms.length === 0}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Seleccionar todos ({inactiveRooms.length})
              </label>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={loadInactiveRooms}
                disabled={loading}
              >
                Actualizar
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={selectedRooms.length === 0 || deleting}
              >
                {deleting ? "Eliminando..." : `Eliminar seleccionados (${selectedRooms.length})`}
              </Button>
            </div>
          </div>
          
          {loading ? (
            <p className="text-center py-8">Cargando consultorios inactivos...</p>
          ) : inactiveRooms.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No hay consultorios inactivos</p>
          ) : (
            <div className="space-y-4">
              {inactiveRooms.map(room => (
                <div
                  key={room.id_consultorio}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center"
                >
                  <div className="flex-shrink-0 pr-4">
                    <input
                      type="checkbox"
                      id={`room-${room.id_consultorio}`}
                      className="h-5 w-5 rounded border-gray-300"
                      checked={selectedRooms.includes(room.id_consultorio.toString())}
                      onChange={() => handleSelectRoom(room.id_consultorio.toString())}
                    />
                  </div>
                  
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Número</p>
                      <p className="font-medium">{room.numero_consultorio}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Especialidad</p>
                      <p>{room.tipo}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Sede</p>
                      <p>{room.sede}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Ciudad</p>
                      <p>{room.ciudad}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Estado</p>
                      <div className="mt-1">
                        {getStatusBadge(room.estado)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 pl-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReactivateRoom(room.id_consultorio.toString())}
                    >
                      Reactivar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSelected()}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </AppLayout>
  );
}