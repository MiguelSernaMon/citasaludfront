interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  roles: string[];
}

interface AuthResponse {
  id?: number;
  username?: string;
  email?: string;
  roles?: string[];
  accessToken?: string;
  tokenType?: string;
  error?: string;
}

const BASE_URL = `${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth`;

/**
 * Servicio para manejar la autenticación con el backend
 */
export const authService = {
  /**
   * Iniciar sesión de usuario
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.message || "Error al iniciar sesión",
        };
      }

      return data;
    } catch  {
      return {
        error: "Error de conexión con el servidor",
      };
    }
  },

  /**
   * Registrar un nuevo usuario
   */
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/registro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.message || "Error al registrar usuario",
        };
      }

      return data;
    } catch  {
      return {
        error: "Error de conexión con el servidor",
      };
    }
  },

  /**
   * Guardar datos de autenticación en localStorage
   */
  saveAuthData: (data: AuthResponse): void => {
    if (data.accessToken) {
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.id,
          username: data.username,
          email: data.email,
          role: data.roles?.[0] || "user",
          name: data.username, // Mantener compatibilidad con el código existente
        })
      );
    }
  },

  /**
   * Verificar si hay un usuario autenticado
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },

  /**
   * Cerrar sesión
   */
  logout: (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};