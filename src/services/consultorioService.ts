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

const BASE_URL = "http://localhost:8080"; // Cambia esto por la URL de tu backend
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
      return result?.getAllConsultorios || []; // Devuelve array vacío si es undefined
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
  createConsultorio: async (data: CreateConsultorioDto): Promise<any> => {
    try {
      const response = await fetch(`${REST_URL}`, {
        method: 'POST',
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
      
      return await response.text();
    } catch (error) {
      console.error("Error al crear consultorio:", error);
      throw error;
    }
  },
  
  /**
   * Actualizar un consultorio existente (REST)
   */
  updateConsultorio: async (id: number, data: Partial<CreateConsultorioDto>): Promise<any> => {
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
      
      return await response.text();
    } catch (error) {
      console.error(`Error al actualizar consultorio con ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Eliminar un consultorio (REST)
   */
  deleteConsultorio: async (id: number): Promise<any> => {
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
      
      return await response.text();
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
   * Obtener sedes (Datos de prueba, puede ser reemplazado con una llamada real)
   */
  getSedes: async (): Promise<{ id: number, nombre: string }[]> => {
    // Esto debería ser reemplazado por una llamada a la API si está disponible
    try {
      // Datos de muestra
      return [
        { id: 1, nombre: "Norte" },
        { id: 2, nombre: "Sur" },
        { id: 3, nombre: "Este" },
        { id: 4, nombre: "Oeste" },
        { id: 5, nombre: "Centro" },
      ];
    } catch (error) {
      console.error("Error al obtener sedes:", error);
      return [
        { id: 1, nombre: "Norte" },
        { id: 2, nombre: "Sur" },
        { id: 3, nombre: "Este" },
      ];
    }
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
