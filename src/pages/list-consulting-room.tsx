import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import AppLayout from "@/Components/Templates/appLayout"
import Card from "@/Components/Molecules/card"
import Button from "@/Components/Atoms/button"
import ListConsultingRoomCard from "@/Components/Organisms/listConsultingRoomsCard"
import { consultorioService, ConsultorioResponseDTO } from "@/services/consultorioService"
import NotificationMessage from "@/Components/Molecules/notificationMessage"
import Input  from "@/Components/Atoms/input"
import { Search, RefreshCw, X, Filter } from "lucide-react"

// Interfaz para el filtro
interface FilterState {
  search: string;
  sede: string;
  especialidad: string;
}

export default function ListConsultingRoom() {
  const router = useRouter();
  const [consultingRooms, setConsultingRooms] = useState<ConsultorioResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estado para filtros
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    sede: "",
    especialidad: ""
  });
  
  // Estado para mostrar/ocultar panel de filtros
  const [showFilters, setShowFilters] = useState(false);

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
  
  // Función para actualizar los filtros
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Función para limpiar los filtros
  const clearFilters = () => {
    setFilters({
      search: "",
      sede: "",
      especialidad: ""
    });
  };

  // Obtener las sedes únicas para el filtro
  const uniqueSedes = useMemo(() => {
    const sedes = new Set<string>();
    consultingRooms.forEach(room => {
      if (room.sede) {
        sedes.add(room.sede);
      }
    });
    return Array.from(sedes).sort();
  }, [consultingRooms]);
  
  // Obtener las especialidades únicas para el filtro
  const uniqueEspecialidades = useMemo(() => {
    const especialidades = new Set<string>();
    consultingRooms.forEach(room => {
      if (room.tipo) {
        especialidades.add(room.tipo);
      }
    });
    return Array.from(especialidades).sort();
  }, [consultingRooms]);

  // Filtrar los consultorios según los criterios
  const filteredConsultingRooms = useMemo(() => {
    return consultingRooms.filter(room => {
      // Filtro de búsqueda (por número)
      const matchSearch = filters.search === "" || 
                         room.numero_consultorio.toLowerCase().includes(filters.search.toLowerCase());
      
      // Filtro por sede
      const matchSede = filters.sede === "" || room.sede === filters.sede;
      
      // Filtro por especialidad
      const matchEspecialidad = filters.especialidad === "" || room.tipo === filters.especialidad;
      
      return matchSearch && matchSede && matchEspecialidad;
    });
  }, [consultingRooms, filters]);

  // Mapear la respuesta de la API a nuestro modelo de datos
  const mapConsultorio = (consultorio: ConsultorioResponseDTO) => ({
    id: consultorio.id_consultorio.toString(),
    number: consultorio.numero_consultorio,
    specialty: consultorio.tipo,
    site: consultorio.sede,
    location: consultorio.ciudad,
    availability: consultorio.estado,
  });

  return (
    <AppLayout>
      <Card title="Consultorios" titleClassName="text-xl">
        {error && <NotificationMessage type="error" message={error} className="mb-4" />}
        {success && <NotificationMessage type="success" message={success} className="mb-4" />}
        
        <div className="p-6 space-y-6">
          {/* Cabecera con título y botones */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <h2 className="text-lg font-semibold">Lista de consultorios</h2>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1"
              >
                <Filter size={16} />
                {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => loadConsultingRooms()}
                className="flex items-center gap-1"
              >
                <RefreshCw size={16} />
                Actualizar
              </Button>
              <Button 
                size="sm"
                onClick={() => router.push("/register-consulting-room")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Agregar consultorio
              </Button>
            </div>
          </div>
          
          {/* Panel de filtros */}
          {showFilters && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                {/* Búsqueda por nombre */}
                <div className="w-full sm:w-1/3">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                    Buscar por número
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      id="search"
                      name="search"
                      placeholder="Ej: C-101"
                      value={filters.search}
                      onChange={handleFilterChange}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                {/* Filtro por sede */}
                <div className="w-full sm:w-1/3">
                  <label htmlFor="sede" className="block text-sm font-medium text-gray-700 mb-1">
                    Sede
                  </label>
                  <select
                    id="sede"
                    name="sede"
                    value={filters.sede}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Todas las sedes</option>
                    {uniqueSedes.map(sede => (
                      <option key={sede} value={sede}>
                        {sede}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Filtro por especialidad */}
                <div className="w-full sm:w-1/3">
                  <label htmlFor="especialidad" className="block text-sm font-medium text-gray-700 mb-1">
                    Especialidad
                  </label>
                  <select
                    id="especialidad"
                    name="especialidad"
                    value={filters.especialidad}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Todas las especialidades</option>
                    {uniqueEspecialidades.map(esp => (
                      <option key={esp} value={esp}>
                        {esp}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Botón para limpiar filtros */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                >
                  <X size={16} />
                  Limpiar filtros
                </Button>
              </div>
              
              {/* Mostrar resumen del filtro activo */}
              {(filters.search || filters.sede || filters.especialidad) && (
                <div className="mt-3 flex items-center text-sm text-gray-500">
                  <span className="font-medium mr-1">Filtros activos:</span>
                  {filters.search && (
                    <span className="bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full mr-2 text-xs">
                      Búsqueda: {filters.search}
                    </span>
                  )}
                  {filters.sede && (
                    <span className="bg-green-100 text-green-800 py-0.5 px-2 rounded-full mr-2 text-xs">
                      Sede: {filters.sede}
                    </span>
                  )}
                  {filters.especialidad && (
                    <span className="bg-purple-100 text-purple-800 py-0.5 px-2 rounded-full mr-2 text-xs">
                      Especialidad: {filters.especialidad}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Resumen de resultados */}
          <div className="text-sm text-gray-500">
            Mostrando {filteredConsultingRooms.length} de {consultingRooms.length} consultorios
            {(filters.search || filters.sede || filters.especialidad) ? " (filtrados)" : ""}
          </div>
          
          {/* Lista de consultorios */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-center text-gray-500">Cargando consultorios...</p>
            </div>
          ) : filteredConsultingRooms.length > 0 ? (
            <div className="space-y-4 mt-4">
              {filteredConsultingRooms.map(consultorio => (
                <ListConsultingRoomCard
                  key={consultorio.id_consultorio}
                  consultingRoom={mapConsultorio(consultorio)}
                  onModify={() => handleModify(consultorio.id_consultorio)}
                  onDelete={() => handleDelete(consultorio.id_consultorio)}
                  className="hover:shadow-md transition-shadow duration-200"
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mb-4">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-500">
                {consultingRooms.length > 0
                  ? "No hay consultorios que coincidan con los criterios de búsqueda."
                  : "No hay consultorios registrados en el sistema."}
              </p>
              {consultingRooms.length === 0 && (
                <Button 
                  variant="link" 
                  onClick={() => router.push("/register-consulting-room")}
                  className="mt-2"
                >
                  ¿Desea agregar un nuevo consultorio?
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </AppLayout>
  );
}
