import { getAuthHeaders } from './apiUtils';

// Interfaz para los datos de mantenimiento
export interface MantenimientoDto {
  consultorioId: number;
  fechaInicio: string; // Formato ISO para fechas
  fechaFin: string;
  motivo: string;
  coordinadorUserId: number;
}

// Interfaz para la respuesta de la API
interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_MAINTENANCE_URL || "https://maintenance-alerts-service.onrender.com/api";

export const mantenimientoService = {
  /**
   * Programar un nuevo mantenimiento
   */
  programarMantenimiento: async (data: MantenimientoDto): Promise<ApiResponse<any>> => {
    try {
      // Asegurarse de que las fechas estén en el formato correcto para Java Spring
      // Spring espera: "yyyy-MM-dd'T'HH:mm:ss"
      console.log("Enviando solicitud de mantenimiento:", data);
      
      // Mapeamos el objeto para asegurarnos que tenga exactamente la estructura esperada
      const payload = {
        consultorioId: data.consultorioId,
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
        motivo: data.motivo,
        coordinadorUserId: data.coordinadorUserId
      };
      
      const response = await fetch(`${BASE_URL}/mantenimiento`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });
      
      // Imprimir la respuesta completa para depuración
      const responseText = await response.text();
      console.log("Respuesta del servidor:", responseText);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${responseText}`);
      }
      
      // Intentar parsear como JSON si es posible
      try {
        const json = JSON.parse(responseText);
        return {
          success: true,
          data: json,
          message: 'Mantenimiento programado correctamente'
        };
      } catch (e) {
        // Si no es JSON, devolver el texto como mensaje
        return {
          success: true,
          message: responseText || 'Mantenimiento programado correctamente'
        };
      }
    } catch (error) {
      console.error("Error al programar mantenimiento:", error);
      throw error;
    }
  },

  /**
   * Obtener todos los mantenimientos programados
   */
  getMantenimientos: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/mantenimiento`, {
        headers: {
          ...getAuthHeaders(),
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error al obtener mantenimientos:", error);
      return [];
    }
  },

  /**
   * Obtener mantenimientos por ID de consultorio
   */
  getMantenimientosByConsultorio: async (consultorioId: number): Promise<any[]> => {
    try {
      const response = await fetch(`${BASE_URL}/mantenimiento/consultorio/${consultorioId}`, {
        headers: {
          ...getAuthHeaders(),
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error al obtener mantenimientos del consultorio ${consultorioId}:`, error);
      return [];
    }
  }
};

export default mantenimientoService;