import { getStudent, getStudentAttendance } from "./firebase-utils";
import { addDoc, serverTimestamp } from "firebase/firestore";
import { reportsCollection } from "./firebase-utils";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://otcqeieukikymmsjwfeu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Y3FlaWV1a2lreW1tc2p3ZmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MjA5MDMsImV4cCI6MjA1ODA5NjkwM30.M3D533la8914BPuHQkyHWnoxN5OM4N_-vVpMDvKDMbk';
const supabase = createClient(supabaseUrl, supabaseKey);

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
    doc.text(`Parent Name: ${student.parentName || "N/A"}`, 20, 50);
    doc.text(`Roll Number: ${student.rollNumber || "N/A"}`, 20, 60);
    doc.text(`Email: ${student.email || "N/A"}`, 20, 70);
    doc.text(`Phone: ${student.phone || "N/A"}`, 20, 80);
    doc.text(`Parent Phone: ${student.parentPhone || "N/A"}`, 20, 90);
    
    // Add attendance summary
    const totalRecords = attendance.length;
    const presentCount = attendance.filter(record => record.status === "present").length;
    const absentCount = attendance.filter(record => record.status === "absent").length;
    const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;
    
    doc.text('Attendance Summary:', 20, 110);
    doc.text(`Total Classes: ${totalRecords}`, 30, 120);
    doc.text(`Present: ${presentCount}`, 30, 130);
    doc.text(`Absent: ${absentCount}`, 30, 140);
    doc.text(`Attendance Rate: ${attendanceRate}%`, 30, 150);
    
    // Add attendance records table
    doc.text('Attendance Records:', 20, 170);
    
    // Create table data
    const tableColumn = ["Date", "Status", "Notes"];
    const tableRows = attendance.map(record => [
      new Date(record.date).toLocaleDateString(),
      record.status,
      record.notes || ""
    ]);
    
    // Use autoTable
    // @ts-ignore
    doc.autoTable({
      startY: 180,
      head: [tableColumn],
      body: tableRows,
    });
    
    // Get PDF as array buffer
    const pdfBytes = doc.output('arraybuffer');
    
    // Generate a unique filename
    const fileName = `student_${studentId}_report_${Date.now()}.pdf`;
    
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from('pdf')  // Using the 'pdf' bucket as specified in your policies
      .upload(fileName, new Uint8Array(pdfBytes), {
        contentType: 'application/pdf',
      });
    
    if (error) {
      console.error("Supabase upload error:", error);
      throw error;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('pdf')
      .getPublicUrl(fileName);
    
    const downloadURL = urlData.publicUrl;
    
    // Update report record in Firebase database
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
