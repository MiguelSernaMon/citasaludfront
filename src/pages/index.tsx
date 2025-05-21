"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/Components/Atoms/card"
import Input from "@/Components/Atoms/input"
import Button from '@/Components/Atoms/button';
import { UserProvider } from "@/context/userContext"

export default function Login() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    document: "",
    email: "",
    role: "administrator",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    localStorage.setItem(
      "user",
      JSON.stringify({
        name: formData.name,
        document: formData.document,
        email: formData.email,
        role: formData.role,
      }),
    )

    router.push("/dashboard")
  }

  return (
    <UserProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="bg-teal-600 text-white text-center py-6">
            <h1 className="text-3xl font-bold">CITASalud</h1>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-xl font-semibold mb-6">Información del usuario</h2>

              <Input label="Nombre" name="name" value={formData.name} onChange={handleChange} required />

              <Input label="Documento" name="document" value={formData.document} onChange={handleChange} required />

              <Input
                label="Correo electrónico"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  required
                >
                  <option value="administrator">Administrador</option>
                  <option value="doctor">Médico</option>
                  <option value="coordinator">Coordinador de sede</option>
                </select>
              </div>

              <Input
                label="Contraseña"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <Button type="submit" className="w-full">
                Iniciar sesión
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </UserProvider>
  )
}
