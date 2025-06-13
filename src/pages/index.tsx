import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Card from "@/Components/Molecules/card"
import Input from "@/Components/Atoms/input"
import Button from "@/Components/Atoms/button"
import { UserProvider, useUser } from "@/context/userContext"
import NotificationMessage from "@/Components/Molecules/notificationMessage"

function LoginForm() {
  const router = useRouter()
  const { authState, login, clearError } = useUser()
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (authState.user && !authState.loading) {
      router.push("/list-consulting-room")
    }
  }, [authState.user, authState.loading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Limpiar error cuando el usuario empieza a escribir
    if (authState.error) {
      clearError()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const success = await login({
      username: formData.username,
      password: formData.password
    })
    
    if (success) {
      router.push("/list-consulting-room")
    }
  }

  return (
    <div className="p-6">
      {authState.error && (
        <NotificationMessage
          type="error"
          message={authState.error}
          className="mb-4"
        />
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-xl font-semibold mb-6">Iniciar sesión</h2>

        <Input 
          label="Nombre de usuario" 
          name="username" 
          value={formData.username} 
          onChange={handleChange}
          required 
        />

        <Input
          label="Contraseña"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <Button type="submit" className="w-full" disabled={authState.loading}>
          {authState.loading ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>
      </form>
    </div>
  )
}

export default function Login() {
  return (
    <UserProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card title="CITASalud" titleClassName="text-xl" className="w-full max-w-md">
          <LoginForm />
        </Card>
      </div>
    </UserProvider>
  )
}
