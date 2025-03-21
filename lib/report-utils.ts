import { getStudent, getStudentAttendance } from "./firebase-utils";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, serverTimestamp } from "firebase/firestore";
import { storage } from "./firebase";
import { reportsCollection } from "./firebase-utils";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Optional: for adding tables to PDF

// Generate and save a PDF report for a student
export async function generateStudentPdfReport(studentId: string) {
  try {
    // Get student data
    const student = await getStudent(studentId);
    const attendance = await getStudentAttendance(studentId);
    
    // Create PDF document
    const doc = new jsPDF();
    
    // Add content to PDF
    doc.setFontSize(22);
    doc.text(`Student Report: ${student.name}`, 20, 20);
    
    doc.setFontSize(14);
    doc.text(`Course: ${student.courseYear}`, 20, 40);
    doc.text(`Roll Number: ${student.rollNumber || "N/A"}`, 20, 50);
    doc.text(`Email: ${student.email || "N/A"}`, 20, 60);
    
    // Add attendance summary
    const totalRecords = attendance.length;
    const presentCount = attendance.filter(record => record.status === "present").length;
    const absentCount = attendance.filter(record => record.status === "absent").length;
    const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;
    
    doc.text('Attendance Summary:', 20, 80);
    doc.text(`Total Classes: ${totalRecords}`, 30, 90);
    doc.text(`Present: ${presentCount}`, 30, 100);
    doc.text(`Absent: ${absentCount}`, 30, 110);
    doc.text(`Attendance Rate: ${attendanceRate}%`, 30, 120);
    
    // Add attendance records table
    doc.text('Attendance Records:', 20, 140);
    
    // Create table data
    const tableColumn = ["Date", "Status", "Notes"];
    const tableRows = attendance.map(record => [
      record.date.toLocaleDateString(),
      record.status,
      record.notes || ""
    ]);
    
    // @ts-ignore - jspdf-autotable adds this method
    doc.autoTable({
      startY: 150,
      head: [tableColumn],
      body: tableRows,
    });
    
    // Save to Firebase Storage
    const fileName = `student_${studentId}_report_${Date.now()}.pdf`;
    const pdfBytes = doc.output('arraybuffer');
    const fileRef = ref(storage, `reports/${fileName}`);
    await uploadBytes(fileRef, new Uint8Array(pdfBytes));
    const downloadURL = await getDownloadURL(fileRef);
    
    // Update report record in database
    await addDoc(reportsCollection, {
      studentId,
      studentName: student.name,
      courseYear: student.courseYear,
      type: 'student-report',
      format: 'pdf',
      url: downloadURL,
      createdAt: serverTimestamp()
    });
    
    return downloadURL;
  } catch (error) {
    console.error("Error generating student report:", error);
    throw error;
  }
}

// Generate a class attendance report for a specific date or date range
export async function generateClassAttendanceReport(courseYear: string, startDate: Date, endDate?: Date) {
  try {
    // Implementation for class attendance report
    // Similar to student report but with different data focus
    
    // This would be implemented based on your specific requirements
    
    return "https://example.com/reports/class_report.pdf"; // Replace with actual implementation
  } catch (error) {
    console.error("Error generating class attendance report:", error);
    throw error;
  }
}

// Helper function to download a report directly in the browser
export function downloadReport(url: string, fileName: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
