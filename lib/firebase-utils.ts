import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  limit,
  type QueryConstraint,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "./firebase"

// Collection references
export const studentsCollection = collection(db, "students")
export const attendanceCollection = collection(db, "attendance")
export const reportsCollection = collection(db, "reports")

// Student CRUD operations
export async function getStudents() {
  try {
    const querySnapshot = await getDocs(query(studentsCollection, orderBy("name")))
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting students:", error)
    throw error
  }
}

export async function getRecentStudents(count = 5) {
  try {
    const querySnapshot = await getDocs(query(studentsCollection, orderBy("createdAt", "desc"), limit(count)))
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting recent students:", error)
    throw error
  }
}

export async function getStudent(id: string) {
  try {
    const docRef = doc(db, "students", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      }
    } else {
      throw new Error("Student not found")
    }
  } catch (error) {
    console.error("Error getting student:", error)
    throw error
  }
}

export async function addStudent(studentData: any) {
  try {
    // Add timestamp for creation date
    const dataWithTimestamp = {
      ...studentData,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
    }

    const docRef = await addDoc(studentsCollection, dataWithTimestamp)
    return {
      id: docRef.id,
      ...dataWithTimestamp,
    }
  } catch (error) {
    console.error("Error adding student:", error)
    throw error
  }
}

export async function updateStudent(id: string, studentData: any) {
  try {
    const studentRef = doc(db, "students", id)

    // Add timestamp for last update
    const dataWithTimestamp = {
      ...studentData,
      lastUpdated: serverTimestamp(),
    }

    await updateDoc(studentRef, dataWithTimestamp)
    return {
      id,
      ...dataWithTimestamp,
    }
  } catch (error) {
    console.error("Error updating student:", error)
    throw error
  }
}

export async function deleteStudent(id: string) {
  try {
    await deleteDoc(doc(db, "students", id))

    // Also delete related attendance records
    const attendanceQuery = query(attendanceCollection, where("studentId", "==", id))
    const attendanceSnapshot = await getDocs(attendanceQuery)

    const deletePromises = attendanceSnapshot.docs.map((doc) => deleteDoc(doc.ref))
    await Promise.all(deletePromises)

    return true
  } catch (error) {
    console.error("Error deleting student:", error)
    throw error
  }
}

// Attendance CRUD operations
export async function getAttendanceRecords(date?: Date, courseYear?: string) {
  try {
    const constraints: QueryConstraint[] = [orderBy("date", "desc")]

    if (date) {
      // Create start and end of the selected day
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      constraints.push(where("date", ">=", Timestamp.fromDate(startOfDay)))
      constraints.push(where("date", "<=", Timestamp.fromDate(endOfDay)))
    }

    if (courseYear && courseYear !== "all") {
      constraints.push(where("courseYear", "==", courseYear))
    }

    const q = query(attendanceCollection, ...constraints)
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate() || new Date(), // Convert Firestore Timestamp to JS Date
      }
    })
  } catch (error) {
    console.error("Error getting attendance records:", error)
    throw error
  }
}

export async function getStudentAttendance(studentId: string) {
  try {
    const q = query(attendanceCollection, where("studentId", "==", studentId), orderBy("date", "desc"))

    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate() || new Date(), // Convert Firestore Timestamp to JS Date
      }
    })
  } catch (error) {
    console.error("Error getting student attendance:", error)
    throw error
  }
}

export async function addAttendanceRecord(attendanceData: any) {
  try {
    // Convert JS Date to Firestore Timestamp
    const dataWithTimestamp = {
      ...attendanceData,
      date: attendanceData.date ? Timestamp.fromDate(attendanceData.date) : Timestamp.now(),
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(attendanceCollection, dataWithTimestamp)
    return {
      id: docRef.id,
      ...dataWithTimestamp,
      date: dataWithTimestamp.date.toDate(), // Convert back to JS Date for client
    }
  } catch (error) {
    console.error("Error adding attendance record:", error)
    throw error
  }
}

// Reports operations
export async function generateReport(reportData: any) {
  try {
    // Add timestamp for creation date
    const dataWithTimestamp = {
      ...reportData,
      createdAt: serverTimestamp(),
      status: "completed",
      // In a real app, you would generate a real URL here
      url: `https://example.com/reports/${Date.now()}.${reportData.format || "pdf"}`,
    }

    const docRef = await addDoc(reportsCollection, dataWithTimestamp)
    return {
      id: docRef.id,
      ...dataWithTimestamp,
    }
  } catch (error) {
    console.error("Error generating report:", error)
    throw error
  }
}

export async function getSavedReports() {
  try {
    const querySnapshot = await getDocs(query(reportsCollection, orderBy("createdAt", "desc")))

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(), // Convert Firestore Timestamp to JS Date
      }
    })
  } catch (error) {
    console.error("Error getting saved reports:", error)
    throw error
  }
}

// Dashboard statistics
export async function getDashboardStats() {
  try {
    // Get all students
    const studentsSnapshot = await getDocs(studentsCollection)
    const students = studentsSnapshot.docs.map((doc) => doc.data())

    // Count students by course year
    const bca1Count = students.filter((student) => student.courseYear === "BCA 1st Year").length
    const bca2Count = students.filter((student) => student.courseYear === "BCA 2nd Year").length
    const bca3Count = students.filter((student) => student.courseYear === "BCA 3rd Year").length

    // Get total reports
    const reportsSnapshot = await getDocs(reportsCollection)
    const totalReports = reportsSnapshot.size

    // Calculate attendance rate (mock for now)
    // In a real app, you would calculate this from actual attendance records
    const attendanceRate = 87

    return {
      totalStudents: students.length,
      bca1Students: bca1Count,
      bca2Students: bca2Count,
      bca3Students: bca3Count,
      attendanceRate,
      totalReports,
    }
  } catch (error) {
    console.error("Error getting dashboard stats:", error)
    throw error
  }
}

// File upload for student documents
export async function uploadStudentDocument(studentId: string, file: File) {
  try {
    const fileRef = ref(storage, `students/${studentId}/${file.name}`)
    await uploadBytes(fileRef, file)
    const downloadURL = await getDownloadURL(fileRef)

    // Update student record with document reference
    const studentRef = doc(db, "students", studentId)
    const studentDoc = await getDoc(studentRef)

    if (studentDoc.exists()) {
      const studentData = studentDoc.data()
      const documents = studentData.documents || []

      await updateDoc(studentRef, {
        documents: [
          ...documents,
          {
            name: file.name,
            url: downloadURL,
            uploadedAt: serverTimestamp(),
          },
        ],
      })
    }

    return downloadURL
  } catch (error) {
    console.error("Error uploading document:", error)
    throw error
  }
}

// Generate student report in PDF format (mock function)
export async function generateStudentReport(studentId: string) {
  try {
    // In a real app, you would generate a PDF here
    // For now, we'll just return a mock URL
    return `https://example.com/reports/student_${studentId}.pdf`
  } catch (error) {
    console.error("Error generating student report:", error)
    throw error
  }
}

