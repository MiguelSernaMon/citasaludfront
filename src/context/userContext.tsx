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
    
    try {
      const response = await fetch(`https://auth-service-k5un.onrender.com/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      console.log("Respuesta de API:", data); // Importante para depurar

      if (!response.ok) {
        const errorMsg = data.message || "Error al iniciar sesión";
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
      const userData = {
        id: data.id || data.userId,
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
