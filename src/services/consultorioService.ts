import { getAuthHeaders } from './apiUtils';

// Definición de tipos para consultorios
export interface CreateConsultorioDto {
  numeroConsultorio: string;
  tipoConsultorio_id: number;
  sede_id: number;
  estado_id: number;
}

export interface ConsultorioResponseDTO {
  id_consultorio: number;
  numero_consultorio: string;
  tipo: string;
  estado: string;
  sede: string;
  ciudad: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_CONSULTING_URL; // Cambia esto por la URL de tu backend
const REST_URL = `${BASE_URL}/consultorio`;
const GRAPHQL_URL = `${BASE_URL}/graphql`; // URL base para peticiones GraphQL

// Función para consultas GraphQL
async function executeGraphQLQuery(query: string, variables = {}) {
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    
    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(result.errors[0].message);
    }
    
    return result.data;
  } catch (error) {
    console.error("Error ejecutando consulta GraphQL:", error);
    throw error;
  }
}

// Primero, definamos interfaces para las respuestas del servidor
interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}


export const consultorioService = {
  /**
   * Obtener todos los consultorios (usando GraphQL)
   */
  getConsultorios: async (): Promise<ConsultorioResponseDTO[]> => {
    const query = `
      query {
        getAllConsultorios {
          id_consultorio
          numero_consultorio
          tipo
          sede
          ciudad
          estado
        }
      }
    `;
    
    try {
      const result = await executeGraphQLQuery(query);
      // Verificación más robusta
      if (!result || !result.getAllConsultorios) {
        console.warn("No se obtuvieron datos de consultorios");
        return [];
      }
      return result.getAllConsultorios;
    } catch (error) {
      console.error("Error al obtener consultorios:", error);
      return []; // Siempre devuelve un array, aunque sea vacío
    }
  },
  
  /**
   * Obtener un consultorio por ID (usando GraphQL)
   */
  getConsultorioById: async (id: string | number): Promise<ConsultorioResponseDTO> => {
    const query = `
      query GetConsultorio($id: ID!) {
        getConsultorioById(id: $id) {
          id_consultorio
          numero_consultorio
          tipo
          sede
          ciudad
          estado
        }
      }
    `;
    
    try {
      const result = await executeGraphQLQuery(query, { id: id.toString() });
      return result.getConsultorioById;
    } catch (error) {
      console.error(`Error al obtener consultorio con ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Crear un nuevo consultorio (REST)
   */
  createConsultorio: async (data: CreateConsultorioDto): Promise<ApiResponse<ConsultorioResponseDTO>> => {
    try {
      console.log("Datos a enviar:", data);
      const response = await fetch(`${REST_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem("token")}`, // Reemplaza con tu token real
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      // Intentar parsear como JSON primero
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json() as ApiResponse<ConsultorioResponseDTO>;
      }
      
      // Si no es JSON, devolver el texto como un mensaje
      const text = await response.text();
      return {
        success: true,
        message: text || 'Consultorio creado correctamente'
      };
    } catch (error) {
      console.error("Error al crear consultorio:", error);
      throw error;
    }
  },
  
  /**
   * Actualizar un consultorio existente (REST)
   */
  updateConsultorio: async (id: number, data: Partial<CreateConsultorioDto>): Promise<ApiResponse<ConsultorioResponseDTO>> => {
    try {
      const response = await fetch(`${REST_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      // Intentar parsear como JSON primero
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json() as ApiResponse<ConsultorioResponseDTO>;
      }
      
      // Si no es JSON, devolver el texto como un mensaje
      const text = await response.text();
      return {
        success: true,
        message: text || 'Consultorio actualizado correctamente'
      };
    } catch (error) {
      console.error(`Error al actualizar consultorio con ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Eliminar un consultorio (REST)
   */
  deleteConsultorio: async (id: number): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${REST_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      // Intentar parsear como JSON primero
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json() as ApiResponse<void>;
      }
      
      // Si no es JSON, devolver el texto como un mensaje
      const text = await response.text();
      return {
        success: true,
        message: text || 'Consultorio eliminado correctamente'
      };
    } catch (error) {
      console.error(`Error al eliminar consultorio con ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Obtener tipos de consultorios (Datos de prueba, puede ser reemplazado con una llamada real)
   */
  getTiposConsultorio: async (): Promise<{ id: number, nombre: string }[]> => {
    // Esto debería ser reemplazado por una llamada a la API si está disponible
    try {
      // Ejemplo para llamada GraphQL si existe:
      // const query = `query { getAllTiposConsultorio { id nombre } }`;
      // const result = await executeGraphQLQuery(query);
      // return result.getAllTiposConsultorio;
      
      // Datos de muestra mientras tanto
      return [
        { id: 1, nombre: "Medicina General" },
        { id: 2, nombre: "Pediatría" },
        { id: 3, nombre: "Ginecología" },
        { id: 4, nombre: "Cardiología" },
        { id: 5, nombre: "Dermatología" },
      ];
    } catch (error) {
      console.error("Error al obtener tipos de consultorio:", error);
      return [
        { id: 1, nombre: "Medicina General" },
        { id: 2, nombre: "Pediatría" },
        { id: 3, nombre: "Ginecología" },
      ];
    }
  },
  
  /**
   * Obtener sedes (datos quemados según la información proporcionada)
   */
  getSedes: async (): Promise<{ id: number, nombre: string }[]> => {
    // Datos fijos de sedes
    return [
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
  },
  
  /**
   * Obtener estados (Datos de prueba, puede ser reemplazado con una llamada real)
   */
  getEstados: async (): Promise<{ id: number, nombre: string }[]> => {
    // Esto debería ser reemplazado por una llamada a la API si está disponible
    try {
      // Datos de muestra
      return [
        { id: 1, nombre: "Activo" },
        { id: 2, nombre: "Inactivo" },
        { id: 3, nombre: "Mantenimiento" },
      ];
    } catch (error) {
      console.error("Error al obtener estados:", error);
      return [
        { id: 1, nombre: "Activo" },
        { id: 2, nombre: "Inactivo" },
      ];
    }
  }
};
