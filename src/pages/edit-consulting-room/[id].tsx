import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AppLayout from "@/Components/Templates/appLayout"
import Card from "@/Components/Molecules/card"
import Input from "@/Components/Atoms/input"
import Button from "@/Components/Atoms/button"
import Select from "@/Components/Atoms/select"
import { consultorioService, CreateConsultorioDto } from "@/services/consultorioService"
import NotificationMessage from "@/Components/Molecules/notificationMessage"
import { useParams } from "next/navigation"

// Datos por defecto (fallback) por si fallan las peticiones
const DEFAULT_TIPOS_CONSULTORIO = [
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

const DEFAULT_SEDES = [
  { "id": 1, "nombre": "Sede Norte" },
  { "id": 2, "nombre": "Sede Sur" },
  { "id": 3, "nombre": "Sede Centro" },
  { "id": 4, "nombre": "Sede Occidente" },
  { "id": 5, "nombre": "Sede Oriente" },
  { "id": 6, "nombre": "Sede Industrial" },
  { "id": 7, "nombre": "Sede Comercial" },
  { "id": 8, "nombre": "Sede Universitaria" },
  { "id": 9, "nombre": "Sede Rural" },
  { "id": 10, "nombre": "Sede Principal" }
]


const DEFAULT_ESTADOS = [
  { id: 1, nombre: "Habilitado" },
  { id: 2, nombre: "Mantenimiento" },
  { id: 3, nombre: "Asignado" }
];

export default function EditConsultingRoom() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [formData, setFormData] = useState<CreateConsultorioDto & { id?: number }>({
    numeroConsultorio: "",
    tipoConsultorio_id: 0,
    sede_id: 0,
    estado_id: 1
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Inicializamos con arrays vacíos para evitar undefined
  const [tiposConsultorio, setTiposConsultorio] = useState<{ id: number, nombre: string }[]>([]);
  const [sedes, setSedes] = useState<{ id: number, nombre: string }[]>([]);
  const [estados, setEstados] = useState<{ id: number, nombre: string }[]>([]);
  
  // Cargar los datos del consultorio y las opciones
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        console.log("Cargando datos para el consultorio con ID:", id);
        
        // Inicializamos variables con valores por defecto
        let tiposData = DEFAULT_TIPOS_CONSULTORIO;
        let sedesData = DEFAULT_SEDES;
        let estadosData = DEFAULT_ESTADOS;
        
        try {
          const tiposResponse = await consultorioService.getTiposConsultorio();
          if (tiposResponse && tiposResponse.length > 0) {
            tiposData = tiposResponse;
          }
          console.log("Tipos de consultorio cargados:", tiposData);
        } catch (e) {
          console.error("Error al cargar tipos de consultorio:", e);
        } finally {
          // Siempre actualizar el estado con los datos, sean por defecto o de la API
          setTiposConsultorio(tiposData);
        }
        
        try {
          const sedesResponse = await consultorioService.getSedes();
          if (sedesResponse && sedesResponse.length > 0) {
            sedesData = sedesResponse;
          }
          console.log("Sedes cargadas:", sedesData);
        } catch (e) {
          console.error("Error al cargar sedes:", e);
        } finally {
          setSedes(sedesData);
        }
        
        try {
          const estadosResponse = await consultorioService.getEstados();
          if (estadosResponse && estadosResponse.length > 0) {
            estadosData = estadosResponse;
          }
          console.log("Estados cargados:", estadosData);
        } catch (e) {
          console.error("Error al cargar estados:", e);
        } finally {
          setEstados(estadosData);
        }
        
        // Finalmente cargar el consultorio específico
        try {
          const consultorio = await consultorioService.getConsultorioById(id);
          console.log("Datos del consultorio cargados:", consultorio);
          
          if (consultorio) {
            // Mapear los datos del consultorio usando las listas cargadas (o por defecto)
            const tipoId = tiposData.find(t => t.nombre === consultorio.tipo)?.id || 0;
            const sedeId = sedesData.find(s => s.nombre === consultorio.sede)?.id || 0;
            const estadoId = estadosData.find(e => e.nombre === consultorio.estado)?.id || 1;
            
            setFormData({
              id: consultorio.id_consultorio,
              numeroConsultorio: consultorio.numero_consultorio,
              tipoConsultorio_id: tipoId,
              sede_id: sedeId,
              estado_id: estadoId
            });
          } else {
            throw new Error("No se encontró el consultorio");
          }
        } catch (e) {
          console.error("Error al cargar consultorio:", e);
          setError("No se pudo cargar la información del consultorio.");
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
        setError("No se pudo cargar la información del consultorio.");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.endsWith('_id') ? Number(value) : value
    }));
    
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.numeroConsultorio || formData.tipoConsultorio_id === 0 || 
        formData.sede_id === 0 || formData.estado_id === 0) {
      setError("Por favor complete todos los campos");
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      if (!formData.id) {
        throw new Error("ID de consultorio no disponible");
      }

      await consultorioService.updateConsultorio(formData.id, {
        numeroConsultorio: formData.numeroConsultorio,
        tipoConsultorio_id: formData.tipoConsultorio_id,
        sede_id: formData.sede_id,
        estado_id: formData.estado_id,
      });

      setSuccess("Consultorio actualizado correctamente");

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/list-consulting-room");
      }, 2000);
    } catch (error: unknown) {
      console.error("Error al actualizar consultorio:", error);

      // Forma segura de manejar el error cuando es de tipo desconocido
      if (error instanceof Error) {
        setError(error.message);
      } else if (typeof error === "string") {
        setError(error);
      } else {
        setError("No se pudo actualizar el consultorio");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Card title="Editar Consultorio" titleClassName="text-xl">
          <div className="p-6 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p>Cargando datos del consultorio...</p>
          </div>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Card title="Editar Consultorio" titleClassName="text-xl">
        {error && <NotificationMessage type="error" message={error} className="mb-4" />}
        {success && <NotificationMessage type="success" message={success} className="mb-4" />}
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <Input
            label="Número de consultorio"
            name="numeroConsultorio"
            value={formData.numeroConsultorio}
            onChange={handleChange}
            required
          />
          
          <Select
            label="Tipo de consultorio"
            name="tipoConsultorio_id"
            value={formData.tipoConsultorio_id?.toString() || ""}
            onChange={handleChange}
            required
            options={tiposConsultorio.map(tipo => ({
              value: tipo.id.toString(),
              label: tipo.nombre
            }))}
          >
            <option value="">Seleccione un tipo</option>
            {tiposConsultorio?.map(tipo => (
              <option key={tipo.id} value={tipo.id.toString()}>
                {tipo.nombre}
              </option>
            ))}
          </Select>
          
          <Select
            label="Sede"
            name="sede_id"
            value={formData.sede_id?.toString() || ""}
            onChange={handleChange}
            required
            options={sedes.map(sede => ({
              value: sede.id.toString(),
              label: sede.nombre
            }))}
          >
            <option value="">Seleccione una sede</option>
            {sedes?.map(sede => (
              <option key={sede.id} value={sede.id.toString()}>
                {sede.nombre}
              </option>
            ))}
          </Select>
          
          <Select
            label="Estado"
            name="estado_id"
            value={formData.estado_id?.toString() || ""}
            onChange={handleChange}
            required
            options={estados.map(estado => ({
              value: estado.id.toString(),
              label: estado.nombre
            }))}
          >
            <option value="">Seleccione un estado</option>
            {estados?.map(estado => (
              <option key={estado.id} value={estado.id.toString()}>
                {estado.nombre}
              </option>
            ))}
          </Select>
          
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.push("/list-consulting-room")}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Card>
    </AppLayout>
  );
}