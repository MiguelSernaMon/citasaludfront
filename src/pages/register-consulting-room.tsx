import type React from "react"
import Card from "@/Components/Molecules/card"
import { useState } from "react"
import AppLayout from "@/Components/Templates/appLayout"
import Input from "@/Components/Atoms/input"
import Select from "@/Components/Atoms/select"
import Button from "@/Components/Atoms/button"

export default function RegisterConsultingRoom() {
  const [formData, setFormData] = useState({
    number: "",
    specialty: "",
    site: "",
    location: "",
  })
  const [success, setSuccess] = useState(false)

  const specialtyOptions = [
    { value: "cardiology", label: "Cardiología" },
    { value: "dermatology", label: "Dermatología" },
    { value: "neurology", label: "Neurología" },
    { value: "pediatrics", label: "Pediatría" },
    { value: "dentistry", label: "Odontología" },
  ]

  const siteOptions = [
    { value: "north", label: "Norte" },
    { value: "south", label: "Sur" },
    { value: "east", label: "Este" },
    { value: "west", label: "Oeste" },
    { value: "central", label: "Central" },
    { value: "bello", label: "Bello" },
  ]

  const locationOptions = [
    { value: "floor1", label: "Piso 1" },
    { value: "floor2", label: "Piso 2" },
    { value: "floor3", label: "Piso 3" },
    { value: "floor4", label: "Piso 4" },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Registrar consultorio:", formData)
    setSuccess(true)

    setTimeout(() => {
      setSuccess(false)
      setFormData({
        number: "",
        specialty: "",
        site: "",
        location: "",
      })
    }, 3000)
  }

  return (
    <AppLayout>
        <Card title="Registro consultorio" className="space-y-6 pb-6" titleClassName="text-xl">
            {success && <div className="m-6 p-4 bg-green-100 text-green-800 rounded-md">Registro exitoso</div>}

            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Número de consultorio"
                        name="number"
                        value={formData.number}
                        onChange={handleChange}
                        required
                    />

                    <Select
                        label="Especialidad principal"
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleChange}
                        options={specialtyOptions}
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

                    <Select
                        label="Ubicación"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        options={locationOptions}
                        required
                    />
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline">
                        Cancelar
                    </Button>
                    <Button type="submit">Registrar</Button>
                </div>
                </form>
            </div>
        </Card>
    </AppLayout>
  )
}
