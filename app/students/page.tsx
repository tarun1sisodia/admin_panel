import { Button } from "@/components/ui/button"
import { StudentsList } from "@/components/students-list"
import { AppLayout } from "@/components/app-layout"
import Link from "next/link"

export default function StudentsPage() {
  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Students</h1>
        <Button asChild>
          <Link href="/students/new">Add New Student</Link>
        </Button>
      </div>
      <StudentsList />
    </AppLayout>
  )
}

