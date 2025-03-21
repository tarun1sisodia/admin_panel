"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, Download, PlusCircle, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { getAttendanceRecords, generateReport } from "@/lib/firebase-utils"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getStudents, addAttendanceRecord } from "@/lib/firebase-utils"

type AttendanceRecord = {
  id: string
  studentName: string
  parentName: string
  studentId: string
  date: Date
  status: "present" | "absent" | "late" | "excused"
  courseYear: string
}

type Student = {
  id: string
  name: string
  courseYear: string
}

export function AttendanceTable() {
  const [date, setDate] = useState<Date>(new Date())
  const [selectedCourseYear, setSelectedCourseYear] = useState<string>("all")
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [attendanceStatus, setAttendanceStatus] = useState<"present" | "absent" | "late" | "excused">("present")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch attendance records
        const fetchedRecords = await getAttendanceRecords(
          date,
          selectedCourseYear !== "all" ? selectedCourseYear : undefined,
        )
        setRecords(fetchedRecords)

        // Fetch students for the dropdown
        const fetchedStudents = await getStudents()
        setStudents(fetchedStudents)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load attendance data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [date, selectedCourseYear])

  const handleDownloadReport = async () => {
    try {
      await generateReport({
        type: "attendance",
        date: date,
        courseYear: selectedCourseYear,
        format: "pdf",
      })

      toast({
        title: "Report generated",
        description: "The attendance report has been generated successfully.",
      })
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddAttendance = async () => {
    if (!selectedStudent) {
      toast({
        title: "Error",
        description: "Please select a student.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const student = students.find((s) => s.id === selectedStudent)

      if (!student) {
        throw new Error("Student not found")
      }

      await addAttendanceRecord({
        studentId: selectedStudent,
        studentName: student.name,
        date: date,
        status: attendanceStatus,
        courseYear: student.courseYear,
      })

      // Refresh the attendance records
      const updatedRecords = await getAttendanceRecords(
        date,
        selectedCourseYear !== "all" ? selectedCourseYear : undefined,
      )
      setRecords(updatedRecords)

      toast({
        title: "Attendance recorded",
        description: "The attendance has been recorded successfully.",
      })

      // Reset form and close dialog
      setSelectedStudent("")
      setAttendanceStatus("present")
      setDialogOpen(false)
    } catch (error) {
      console.error("Error adding attendance:", error)
      toast({
        title: "Error",
        description: "Failed to record attendance. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "text-green-600"
      case "absent":
        return "text-red-600"
      case "late":
        return "text-amber-600"
      case "excused":
        return "text-blue-600"
      default:
        return ""
    }
  }

  const filteredStudents =
    selectedCourseYear === "all" ? students : students.filter((student) => student.courseYear === selectedCourseYear)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading attendance records...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
            </PopoverContent>
          </Popover>

          <Select value={selectedCourseYear} onValueChange={setSelectedCourseYear}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select course year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              <SelectItem value="BCA 1st Year">BCA 1st Year</SelectItem>
              <SelectItem value="BCA 2nd Year">BCA 2nd Year</SelectItem>
              <SelectItem value="BCA 3rd Year">BCA 3rd Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Attendance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Attendance Record</DialogTitle>
                <DialogDescription>Record attendance for a student on {format(date, "PPP")}.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="student">Student</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger id="student">
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.courseYear})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Attendance Status</Label>
                  <RadioGroup value={attendanceStatus} onValueChange={(value: any) => setAttendanceStatus(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="present" id="present" />
                      <Label htmlFor="present" className="text-green-600">
                        Present
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="absent" id="absent" />
                      <Label htmlFor="absent" className="text-red-600">
                        Absent
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="late" id="late" />
                      <Label htmlFor="late" className="text-amber-600">
                        Late
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="excused" id="excused" />
                      <Label htmlFor="excused" className="text-blue-600">
                        Excused
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button onClick={handleAddAttendance} disabled={submitting}>
                  {submitting ? "Saving..." : "Save Attendance"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-semibold">No attendance records found</h3>
          <p className="text-sm text-muted-foreground">
            {selectedCourseYear !== "all"
              ? `No attendance records for ${selectedCourseYear} on ${format(date, "PPP")}`
              : `No attendance records for ${format(date, "PPP")}`}
          </p>
          <Button className="mt-4" onClick={() => setDialogOpen(true)}>
            Add Attendance Record
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Course Year</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.studentId}</TableCell>
                <TableCell className="font-medium">{record.studentName}</TableCell>
                <TableCell>{record.courseYear}</TableCell>
                <TableCell>{format(record.date, "PPP")}</TableCell>
                <TableCell className={getStatusColor(record.status)}>
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

