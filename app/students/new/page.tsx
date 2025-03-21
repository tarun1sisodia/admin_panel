import Link from "next/link"
import { StudentForm } from "@/components/student-form"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NewStudentPage() {
  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/students">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Add New Student</h1>
        </div>
      </div>
      <StudentForm />
    </AppLayout>
  )
}

