import type { FC } from "react"
import Select from "@/Components/Atoms/select"
import Button from "@/Components/Atoms/button"

interface ExportOption {
  value: string
  label: string
}

interface ConsultingRoomExportProps {
  fileTypeOptions: ExportOption[]
  onExport?: () => void
}

const ConsultingRoomExport: FC<ConsultingRoomExportProps> = ({ fileTypeOptions, onExport }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium mb-4">Exportar información</h3>
      <div className="flex items-end gap-4">
        <Select label="Tipo de archivo" name="fileType" options={fileTypeOptions} className="w-48" />
        <Button variant="secondary" onClick={onExport}>Exportar</Button>
      </div>
    </div>
  )
}

export default ConsultingRoomExport
