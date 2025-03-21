"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getStudent, deleteStudent } from "@/lib/firebase-utils"
import { generateStudentPdfReport, downloadReport } from "@/lib/report-utils"
import { StudentForm } from "@/components/student-form"
import { Loader2, ArrowLeft, Trash2, FileText } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AppLayout } from "@/components/app-layout"

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportUrl, setReportUrl] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStudent() {
      try {
        const fetchedStudent = await getStudent(studentId)
        setStudent(fetchedStudent)
      } catch (error) {
        console.error("Error fetching student:", error)
        toast({
          title: "Error",
          description: "Failed to load student data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStudent()
  }, [studentId])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteStudent(studentId)
      toast({
        title: "Student deleted",
        description: "The student has been successfully removed.",
      })
      router.push("/students")
    } catch (error) {
      console.error("Error deleting student:", error)
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  // Add this new function for report generation
  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true)
      const reportUrl = await generateStudentPdfReport(studentId)
      toast({
        title: "Report Generated",
        description: "The student report has been successfully generated.",
      })
      
      // Option 1: Automatically download
      downloadReport(reportUrl, `${student.name}_report.pdf`)
      
      // Option 2: Just provide the link
      setReportUrl(reportUrl)
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/students">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{student.name}</h1>
        </div>
        <div className="flex gap-2">
          {/* Add Report Generation Button */}
          <Button 
            variant="outline" 
            onClick={handleGenerateReport} 
            disabled={isGenerating}
          >
            <FileText className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate Report"}
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setDeleteDialogOpen(true)} 
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Student
          </Button>
        </div>
      </div>

      {/* Display report URL if available */}
      {reportUrl && (
        <div className="mt-4 p-4 bg-muted rounded-md">
          <p className="text-sm font-medium">Report generated successfully!</p>
          <div className="flex items-center gap-2 mt-2">
            <a 
              href={reportUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline"
            >
              View Report
            </a>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => downloadReport(reportUrl, `${student.name}_report.pdf`)}
            >
              Download Again
            </Button>
          </div>
        </div>
      )}

      <Tabs defaultValue="details" className="w-full mt-6">
        <TabsList>
          <TabsTrigger value="details">Student Details</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-4">
          <StudentForm studentId={studentId} />
        </TabsContent>
        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>View and manage attendance records for this student.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Attendance records will be displayed here. This feature is under development.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the student and all associated data from the
              database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
