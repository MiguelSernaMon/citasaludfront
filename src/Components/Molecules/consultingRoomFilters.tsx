import type { FC } from "react"
import Select from "@/Components/Atoms/select"

interface FilterOption {
  value: string
  label: string
}

interface ConsultingRoomFiltersProps {
  siteOptions: FilterOption[]
  specialtyOptions: FilterOption[]
  statusOptions: FilterOption[]
}

const ConsultingRoomFilters: FC<ConsultingRoomFiltersProps> = ({
  siteOptions,
  specialtyOptions,
  statusOptions,
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium mb-4">Filtrar por</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select label="Sede" name="site" options={siteOptions} />
        <Select label="Especialidad" name="specialty" options={specialtyOptions} />
        <Select label="Estado" name="status" options={statusOptions} />
      </div>
    </div>
  )
}

export default ConsultingRoomFilters
