"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Role = "administrator" | "doctor" | "coordinator"

interface User {
  name: string
  document: string
  email: string
  role: Role
}

interface UserContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
}

const UserContext = createContext<UserContextType>({
  user: null,
  login: () => {},
  logout: () => {},
})

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = (userData: User) => {
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
  }

  return <UserContext.Provider value={{ user, login, logout }}>{children}</UserContext.Provider>
}

export function useUser() {
  return useContext(UserContext)
}
