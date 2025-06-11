import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/Components/Templates/appLayout";
import Card from "@/Components/Molecules/card";
import Input from "@/Components/Atoms/input";
import Button from "@/Components/Atoms/button";
import { consultorioService, CreateConsultorioDto } from "@/services/consultorioService";
import NotificationMessage from "@/Components/Molecules/notificationMessage";

// Interfaces
interface TipoConsultorio {
  id: number;
  nombre: string;
}

interface Sede {
  id: number;
  nombre: string;
}

interface Estado {
  id: number;
  nombre: string;
}

// Datos quemados para los selectores
const TIPOS_CONSULTORIO: TipoConsultorio[] = [
  { id: 1, nombre: "Medicina General" },
  { id: 2, nombre: "Pediatría" },
  { id: 3, nombre: "Ginecología" },
  { id: 4, nombre: "Cardiología" },
  { id: 5, nombre: "Dermatología" },
  { id: 6, nombre: "Oftalmología" },
  { id: 7, nombre: "Otorrinolaringología" },
  { id: 8, nombre: "Psiquiatría" },
  { id: 9, nombre: "Psicología" },
  { id: 10, nombre: "Nutrición" }
];

const SEDES: Sede[] = [
  { id: 1, nombre: "Sede Norte" },
  { id: 2, nombre: "Sede Sur" },
  { id: 3, nombre: "Sede Centro" },
  { id: 4, nombre: "Sede Occidente" },
  { id: 5, nombre: "Sede Oriente" },
  { id: 6, nombre: "Sede Industrial" },
  { id: 7, nombre: "Sede Comercial" },
  { id: 8, nombre: "Sede Universitaria" },
  { id: 9, nombre: "Sede Rural" },
  { id: 10, nombre: "Sede Principal" }
];

const ESTADOS: Estado[] = [
  { id: 1, nombre: "Activo" },
  { id: 2, nombre: "Inactivo" },
  { id: 3, nombre: "Mantenimiento" }
];

export default function RegisterConsultingRoom() {
  const router = useRouter();
  
  // Estado del formulario
  const [formData, setFormData] = useState<CreateConsultorioDto>({
    numeroConsultorio: "",
    tipoConsultorio_id: 0,
    sede_id: 0,
    estado_id: 1 // Activo por defecto
  });

  // Estados para UI
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Simulación de carga inicial (solo para mostrar el spinner brevemente)
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simular un breve tiempo de carga (puedes eliminar esto si prefieres que sea instantáneo)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name.endsWith('_id') ? Number(value) : value
    }));
    
    // Limpiar mensajes de error cuando el usuario hace cambios
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  // Enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.numeroConsultorio.trim()) {
      setErrorMessage("Debe ingresar un número de consultorio");
      return;
    }
    
    if (formData.tipoConsultorio_id === 0) {
      setErrorMessage("Debe seleccionar un tipo de consultorio");
      return;
    }
    
    if (formData.sede_id === 0) {
      setErrorMessage("Debe seleccionar una sede");
      return;
    }
    
    setIsSaving(true);
    setErrorMessage(null);
    
    try {
      // Simular una operación de guardado
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No se encontró el token de autenticación");
      }
      await consultorioService.createConsultorio(formData);
      
      // Mensaje de éxito
      setSuccessMessage("Consultorio registrado correctamente");
      
      // Resetear el formulario
      setFormData({
        numeroConsultorio: "",
        tipoConsultorio_id: 0,
        sede_id: 0,
        estado_id: 1
      });
      
      // Redireccionar después de un breve delay
      setTimeout(() => {
        router.push("/list-consulting-room");
      }, 2000);
    } catch (error: any) {
      console.error("Error al registrar consultorio:", error);
      setErrorMessage("No se pudo registrar el consultorio. Intente nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card title="Registro de Nuevo Consultorio" titleClassName="text-xl font-semibold text-gray-800">
          {/* Mensajes de notificación */}
          {errorMessage && (
            <div className="mx-6 mt-4">
              <NotificationMessage type="error" message={errorMessage} />
            </div>
          )}
          
          {successMessage && (
            <div className="mx-6 mt-4">
              <NotificationMessage type="success" message={successMessage} />
            </div>
          )}
          
          {isLoading ? (
            <div className="p-8 flex justify-center items-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-200"></div>
                <p className="mt-4 text-gray-500">Cargando opciones...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Número de Consultorio */}
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <Input
                  label="Número de Consultorio"
                  name="numeroConsultorio"
                  value={formData.numeroConsultorio}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej: C-101"
                />
                <p className="mt-1 text-xs text-gray-500">Ingrese un identificador único para el consultorio</p>
              </div>
              
              {/* Tipo de consultorio */}
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Consultorio
                </label>
                <select
                  name="tipoConsultorio_id"
                  value={formData.tipoConsultorio_id || ""}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Seleccione un tipo</option>
                  {TIPOS_CONSULTORIO.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Seleccione la especialidad del consultorio</p>
              </div>
              
              {/* Sede */}
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sede
                </label>
                <select
                  name="sede_id"
                  value={formData.sede_id || ""}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Seleccione una sede</option>
                  {SEDES.map(sede => (
                    <option key={sede.id} value={sede.id}>
                      {sede.nombre}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Seleccione la ubicación del consultorio</p>
              </div>
              
              {/* Estado */}
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  name="estado_id"
                  value={formData.estado_id || ""}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Seleccione un estado</option>
                  {ESTADOS.map(estado => (
                    <option key={estado.id} value={estado.id}>
                      {estado.nombre}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Indique si el consultorio está activo o no</p>
              </div>
              
              {/* Botones de acción */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/list-consulting-room")}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registrando...
                    </span>
                  ) : (
                    "Registrar Consultorio"
                  )}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}