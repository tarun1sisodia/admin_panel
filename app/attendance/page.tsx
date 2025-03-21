import { AttendanceTable } from "@/components/attendance-table"
import { AppLayout } from "@/components/app-layout"

export default function AttendancePage() {
  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Attendance Records</h1>
      </div>
      <AttendanceTable />
    </AppLayout>
  )
}

