import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentStudents } from "@/components/recent-students"
import { AppLayout } from "@/components/app-layout"

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats />
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Students</CardTitle>
            <CardDescription>Manage your student records</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentStudents />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

