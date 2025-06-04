"use client"

import type React from "react"
import Card from "@/Components/Molecules/card"
import { useState } from "react"
import AppLayout from "@/Components/Templates/appLayout"
import Input from "@/Components/Atoms/input"
import Select from "@/Components/Atoms/select"
import Button from "@/Components/Atoms/button"
import NotificationMessage from "@/Components/Molecules/notificationMessage"

export default function MaintenanceSchedule() {
  const [formData, setFormData] = useState({
    consultationNumber: "",
    specialty: "",
    site: "",
    reason: "",
    startDate: "",
    endDate: "",
  })
  const [success, setSuccess] = useState(false)

  const siteOptions = [
    { value: "north", label: "Norte" },
    { value: "south", label: "Sur" },
    { value: "east", label: "Este" },
    { value: "west", label: "Oeste" },
    { value: "central", label: "Central" },
    { value: "bello", label: "Bello" },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Programar mantenimiento:", formData)
    setSuccess(true)

    // Reset notification after a delay
    setTimeout(() => {
      setSuccess(false)
    }, 3000)
  }

  return (
    <AppLayout>
      <Card title="Mantenimiento" className="space-y-6 pb-6" titleClassName="text-xl">
        {success && (
          <NotificationMessage
            type="success"
            message="Mantenimiento programado exitosamente"
          />
        )}

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Número de consultorio"
                name="consultationNumber"
                value={formData.consultationNumber}
                onChange={handleChange}
                required
              />

              <Select
                label="Sede"
                name="site"
                value={formData.site}
                onChange={handleChange}
                options={siteOptions}
                required
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo mantenimiento</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
                  required
                />
              </div>

              <Input
                label="Fecha inicio"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />

              <Input
                label="Fecha fin"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </div>
      </Card>
    </AppLayout>
  )
}
