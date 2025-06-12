"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface LoginCredentials {
  username: string;
  password: string;
}

type Role = "admin" | "user" | "coord" | "doctor" | "administrator" | "coordinator";

export interface User {
  id?: number | string;
  name: string;
  email?: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface UserContextType {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const UserContext = createContext<UserContextType>({
  authState: { user: null, token: null, loading: false, error: null },
  login: async () => false,
  logout: () => {},
  clearError: () => {},
})

export function UserProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
    error: null,
  });

  // Verificar si hay un usuario autenticado al iniciar
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setAuthState({
          user,
          token,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuthState({
          user: null,
          token: null,
          loading: false,
          error: null,
        });
      }
    } else {
      setAuthState({
        user: null,
        token: null,
        loading: false,
        error: null,
      });
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    const AUTHURL = process.env.NEXT_PUBLIC_AUTH_URL || "https://auth-service-k5un.onrender.com";

    try {
      console.log("Intentando login en:", `${AUTHURL}/api/auth/login`);
      console.log("Credenciales:", { username: credentials.username, password: "********" });

      const response = await fetch(`${AUTHURL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(credentials),
      });

      console.log("Respuesta recibida:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Manejar respuesta vacía o no-JSON
      if (response.status === 403) {
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: "Acceso denegado. Verifique sus credenciales." 
        }));
        return false;
      }

      // Verificar si hay contenido y si es JSON
      const text = await response.text();
      console.log("Texto de respuesta:", text);

      let data;
      if (text && text.trim()) {
        try {
          data = JSON.parse(text);
          console.log("Datos parseados:", data);
        } catch (parseError) {
          console.error("Error al parsear JSON:", parseError);
          setAuthState(prev => ({ 
            ...prev, 
            loading: false, 
            error: "El servidor devolvió una respuesta inválida" 
          }));
          return false;
        }
      } else {
        console.warn("Respuesta vacía del servidor");
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: response.status === 200 
            ? "El servidor no envió datos de autenticación" 
            : `Error ${response.status}: ${response.statusText}`
        }));
        return false;
      }

      if (!response.ok) {
        const errorMsg = data?.message || "Error al iniciar sesión";
        console.error("Error en login:", errorMsg);
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: errorMsg 
        }));
        return false;
      }
      
      // Extraer los campos correctos según la estructura de tu API
      const token = data.accessToken || data.token;
      
      if (!token) {
        console.error("No se encontró token en la respuesta:", data);
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: "El servidor no devolvió un token válido" 
        }));
        return false;
      }
      
      const userData = {
        id: data.id || data.userId || 0,
        name: data.username || data.name || credentials.username, 
        email: data.email || "",
        role: mapRole(data.roles || []),
      };
      
      // Guardar en localStorage de manera explícita
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log("Token guardado:", token);
      console.log("Usuario guardado:", userData);
      
      // Actualizar el estado
      setAuthState({
        user: userData,
        token: token,
        loading: false,
        error: null
      });
      
      return true;
    } catch (error) {
      console.error("Error completo:", error);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: "Error de conexión con el servidor" 
      }));
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthState({
      user: null,
      token: null,
      loading: false,
      error: null,
    });
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  // Función auxiliar para mapear roles
  const mapRole = (roles: string[]): Role => {
    if (roles.includes("admin") || roles.includes("ROLE_ADMIN")) return "administrator";
    if (roles.includes("coord") || roles.includes("ROLE_COORD")) return "coordinator";
    if (roles.includes("doctor") || roles.includes("ROLE_DOCTOR")) return "doctor";
    return "user";
  };

  return (
    <UserContext.Provider value={{ 
      authState, 
      login, 
      logout, 
      clearError 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
