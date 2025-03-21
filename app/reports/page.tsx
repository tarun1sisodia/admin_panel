import { ReportsGenerator } from "@/components/reports-generator"
import { AppLayout } from "@/components/app-layout"

export default function ReportsPage() {
  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
      </div>
      <ReportsGenerator />
    </AppLayout>
  )
}

