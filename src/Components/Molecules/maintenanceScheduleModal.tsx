import React, { useState } from 'react';
import Button from "@/Components/Atoms/button";
import Input from "@/Components/Atoms/input";
import { X } from "lucide-react";
import { mantenimientoService, MantenimientoDto } from "@/services/mantenimientoService";

interface MaintenanceScheduleModalProps {
  consultorioId: string;
  consultorioNumero: string;
  onClose: () => void;
  onSuccess: () => void;
}

const MaintenanceScheduleModal: React.FC<MaintenanceScheduleModalProps> = ({
  consultorioId,
  consultorioNumero,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<{
    motivo: string;
    fechaInicio: string;
    fechaFin: string;
  }>({
    motivo: "",
    fechaInicio: "",
    fechaFin: ""
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error al hacer cambios
    if (error) {
      setError(null);
    }
  };

  // Formatear fecha para Java Spring
  const formatDateForJava = (dateString: string): string => {
    const date = new Date(dateString);
    // Formato: yyyy-MM-dd'T'HH:mm:ss
    return date.toISOString().slice(0, 19);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.motivo.trim()) {
      setError("Por favor, ingrese el motivo del mantenimiento");
      return;
    }
    
    if (!formData.fechaInicio || !formData.fechaFin) {
      setError("Por favor, seleccione fechas de inicio y fin");
      return;
    }
    
    const fechaInicio = new Date(formData.fechaInicio);
    const fechaFin = new Date(formData.fechaFin);
    
    if (fechaInicio > fechaFin) {
      setError("La fecha de inicio debe ser anterior a la fecha de fin");
      return;
    }
    
    if (fechaInicio < new Date()) {
      setError("La fecha de inicio debe ser futura");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Obtener el ID del usuario (coordinador) del localStorage
      const userStr = localStorage.getItem('user');
      let coordinadorId = 1; // Valor por defecto
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          coordinadorId = user.id || 1;
        } catch (e) {
          console.error("Error al parsear información de usuario:", e);
        }
      }
      
      // Formatear fechas en el formato exacto que Java Spring espera
      const maintenanceData: MantenimientoDto = {
        consultorioId: parseInt(consultorioId),
        fechaInicio: formatDateForJava(formData.fechaInicio),
        fechaFin: formatDateForJava(formData.fechaFin),
        motivo: formData.motivo,
        coordinadorUserId: coordinadorId
      };
      
      console.log("Datos a enviar:", maintenanceData);
      
      await mantenimientoService.programarMantenimiento(maintenanceData);
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error al programar mantenimiento:", error);
      setError(error.message || "No se pudo programar el mantenimiento. Intente de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Programar Mantenimiento</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Consultorio: <span className="font-bold">{consultorioNumero}</span>
            </p>
            <p className="text-xs text-gray-500">ID: {consultorioId}</p>
          </div>
          
          <div>
            <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-1">
              Motivo del mantenimiento
            </label>
            <textarea
              id="motivo"
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              rows={3}
              placeholder="Ej: Mantenimiento preventivo de equipos médicos"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha inicio
              </label>
              <input
                id="fechaInicio"
                name="fechaInicio"
                type="datetime-local"
                value={formData.fechaInicio}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                required
              />
            </div>
            
            <div>
              <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha fin
              </label>
              <input
                id="fechaFin"
                name="fechaFin"
                type="datetime-local"
                value={formData.fechaFin}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                required
              />
            </div>
          </div>
          
          {/* Mostrar información de depuración en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-100 p-2 rounded text-xs">
              <p className="font-mono">
                Datos que se enviarán:
              </p>
              <pre className="whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify({
                  consultorioId: parseInt(consultorioId),
                  fechaInicio: formData.fechaInicio ? formatDateForJava(formData.fechaInicio) : "",
                  fechaFin: formData.fechaFin ? formatDateForJava(formData.fechaFin) : "",
                  motivo: formData.motivo,
                  coordinadorUserId: 1
                }, null, 2)}
              </pre>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Programando...
                </span>
              ) : (
                "Programar Mantenimiento"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceScheduleModal;