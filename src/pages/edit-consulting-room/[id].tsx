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
  
  // Estados para las opciones
  const [tiposConsultorio, setTiposConsultorio] = useState<{ id: number, nombre: string }[]>([]);
  const [sedes, setSedes] = useState<{ id: number, nombre: string }[]>([]);
  const [estados, setEstados] = useState<{ id: number, nombre: string }[]>([]);
  
  // Cargar los datos del consultorio y las opciones
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Cargar datos en paralelo
        const [consultorio, tiposData, sedesData, estadosData] = await Promise.all([
          consultorioService.getConsultorioById(id),
          consultorioService.getTiposConsultorio(),
          consultorioService.getSedes(),
          consultorioService.getEstados()
        ]);
        
        // Mapear los datos del consultorio a nuestro formulario
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
        
        setTiposConsultorio(tiposData);
        setSedes(sedesData);
        setEstados(estadosData);
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
      await consultorioService.updateConsultorio(formData.id!, {
        numeroConsultorio: formData.numeroConsultorio,
        tipoConsultorio_id: formData.tipoConsultorio_id,
        sede_id: formData.sede_id,
        estado_id: formData.estado_id
      });
      
      setSuccess("Consultorio actualizado correctamente");
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/list-consulting-room");
      }, 2000);
    } catch (error) {
      console.error("Error al actualizar consultorio:", error);
      setError("No se pudo actualizar el consultorio");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Card title="Editar Consultorio" titleClassName="text-xl">
          <div className="p-6 text-center">
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
            value={formData.tipoConsultorio_id.toString()}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un tipo</option>
            {tiposConsultorio.map(tipo => (
              <option key={tipo.id} value={tipo.id.toString()}>
                {tipo.nombre}
              </option>
            ))}
          </Select>
          
          <Select
            label="Sede"
            name="sede_id"
            value={formData.sede_id.toString()}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione una sede</option>
            {sedes.map(sede => (
              <option key={sede.id} value={sede.id.toString()}>
                {sede.nombre}
              </option>
            ))}
          </Select>
          
          <Select
            label="Estado"
            name="estado_id"
            value={formData.estado_id.toString()}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un estado</option>
            {estados.map(estado => (
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