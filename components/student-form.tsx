"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addStudent, getStudent, updateStudent } from "@/lib/firebase-utils"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

type StudentData = {
  name: string
  email: string
  courseYear: string
  phone: string
  address: string
  rollNumber: string
  parentName: string
  parentPhone: string
  notes: string
}

const initialFormData: StudentData = {
  name: "",
  email: "",
  courseYear: "",
  phone: "",
  address: "",
  rollNumber: "",
  parentName: "",
  parentPhone: "",
  notes: "",
}

export function StudentForm({ studentId }: { studentId?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchingStudent, setFetchingStudent] = useState(!!studentId)
  const [formData, setFormData] = useState<StudentData>(initialFormData)

  useEffect(() => {
    async function fetchStudentData() {
      if (!studentId) return

      try {
        const student = await getStudent(studentId)
        setFormData({
          name: student.name || "",
          email: student.email || "",
          courseYear: student.courseYear || "",
          phone: student.phone || "",
          address: student.address || "",
          rollNumber: student.rollNumber || "",
          parentName: student.parentName || "",
          parentPhone: student.parentPhone || "",
          notes: student.notes || "",
        })
      } catch (error) {
        console.error("Error fetching student:", error)
        toast({
          title: "Error",
          description: "Failed to load student data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setFetchingStudent(false)
      }
    }

    if (studentId) {
      fetchStudentData()
    }
  }, [studentId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (studentId) {
        // Update existing student
        await updateStudent(studentId, formData)
        toast({
          title: "Student updated",
          description: "The student information has been updated successfully.",
        })
      } else {
        // Add new student
        await addStudent(formData)
        toast({
          title: "Student added",
          description: "The new student has been added successfully.",
        })
      }

      // Redirect to students list
      router.push("/students")
    } catch (error) {
      console.error("Error saving student:", error)
      toast({
        title: "Error",
        description: "Failed to save student data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetchingStudent) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2">Loading student data...</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter student's full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter student's email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseYear">Course Year</Label>
              <Select
                value={formData.courseYear}
                onValueChange={(value) => handleSelectChange("courseYear", value)}
                required
              >
                <SelectTrigger id="courseYear">
                  <SelectValue placeholder="Select course year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BCA 1st Year">BCA 1st Year</SelectItem>
                  <SelectItem value="BCA 2nd Year">BCA 2nd Year</SelectItem>
                  <SelectItem value="BCA 3rd Year">BCA 3rd Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rollNumber">Roll Number</Label>
              <Input
                id="rollNumber"
                name="rollNumber"
                placeholder="Enter student's roll number"
                value={formData.rollNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Enter student's phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="Enter student's address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentName">Parent/Guardian Name</Label>
              <Input
                id="parentName"
                name="parentName"
                placeholder="Enter parent's name"
                value={formData.parentName}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentPhone">Parent/Guardian Phone</Label>
              <Input
                id="parentPhone"
                name="parentPhone"
                placeholder="Enter parent's phone number"
                value={formData.parentPhone}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Enter any additional information"
                value={formData.notes}
                onChange={handleChange}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/students")} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {studentId ? "Updating..." : "Adding..."}
                </>
              ) : studentId ? (
                "Update Student"
              ) : (
                "Add Student"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

