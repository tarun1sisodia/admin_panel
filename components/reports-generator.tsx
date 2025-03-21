"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, FileText, BarChart, LineChart, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { generateReport, getSavedReports } from "@/lib/firebase-utils"
import { toast } from "@/components/ui/use-toast"

type SavedReport = {
  id: string
  type: string
  courseYear?: string
  createdAt: Date
  format: string
  url?: string
}

export function ReportsGenerator() {
  const [reportType, setReportType] = useState("student")
  const [selectedCourseYear, setSelectedCourseYear] = useState<string>("")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [reportFormat, setReportFormat] = useState<string>("pdf")
  const [loading, setLoading] = useState(false)
  const [savedReports, setSavedReports] = useState<SavedReport[]>([])
  const [loadingSavedReports, setLoadingSavedReports] = useState(true)

  useEffect(() => {
    async function fetchSavedReports() {
      try {
        const reports = await getSavedReports()
        setSavedReports(reports)
      } catch (error) {
        console.error("Error fetching saved reports:", error)
        toast({
          title: "Error",
          description: "Failed to load saved reports. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoadingSavedReports(false)
      }
    }

    fetchSavedReports()
  }, [])

  const handleGenerateReport = async () => {
    if (!selectedCourseYear) {
      toast({
        title: "Missing information",
        description: "Please select a course year.",
        variant: "destructive",
      })
      return
    }

    if (reportType !== "student" && (!dateRange.from || !dateRange.to)) {
      toast({
        title: "Missing information",
        description: "Please select a date range.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const reportData = {
        type: reportType,
        courseYear: selectedCourseYear,
        dateRange: dateRange,
        format: reportFormat,
      }

      const report = await generateReport(reportData)

      // Add the new report to the list
      setSavedReports([
        {
          id: report.id,
          type: report.type,
          courseYear: report.courseYear,
          createdAt: new Date(),
          format: report.format,
          url: report.url,
        },
        ...savedReports,
      ])

      toast({
        title: "Report generated",
        description: "Your report has been generated successfully.",
      })
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getReportTypeName = (type: string) => {
    switch (type) {
      case "student":
        return "Student Report"
      case "attendance":
        return "Attendance Report"
      case "performance":
        return "Performance Report"
      default:
        return "Report"
    }
  }

  const handleDownloadReport = (url?: string) => {
    if (url) {
      window.open(url, "_blank")
    } else {
      toast({
        title: "Download unavailable",
        description: "This report doesn't have a download URL.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="grid gap-6">
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Reports</TabsTrigger>
          <TabsTrigger value="saved">Saved Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
              <CardDescription>
                Create custom reports based on student data, attendance, and academic performance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Report Type</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Card
                    className={cn("cursor-pointer", reportType === "student" && "border-primary")}
                    onClick={() => setReportType("student")}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <FileText className="h-8 w-8 mb-2 mt-2" />
                      <h4 className="text-sm font-medium">Student Report</h4>
                      <p className="text-xs text-muted-foreground">Individual student performance</p>
                    </CardContent>
                  </Card>
                  <Card
                    className={cn("cursor-pointer", reportType === "attendance" && "border-primary")}
                    onClick={() => setReportType("attendance")}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <BarChart className="h-8 w-8 mb-2 mt-2" />
                      <h4 className="text-sm font-medium">Attendance Report</h4>
                      <p className="text-xs text-muted-foreground">Course attendance statistics</p>
                    </CardContent>
                  </Card>
                  <Card
                    className={cn("cursor-pointer", reportType === "performance" && "border-primary")}
                    onClick={() => setReportType("performance")}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <LineChart className="h-8 w-8 mb-2 mt-2" />
                      <h4 className="text-sm font-medium">Performance Report</h4>
                      <p className="text-xs text-muted-foreground">Academic performance trends</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Course Year</h3>
                <Select value={selectedCourseYear} onValueChange={setSelectedCourseYear}>
                  <SelectTrigger>
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

              {reportType !== "student" && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Date Range</h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.from && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Select date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="range" selected={dateRange} onSelect={setDateRange} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Report Format</h3>
                <Select value={reportFormat} onValueChange={setReportFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    <SelectItem value="csv">CSV File</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full" onClick={handleGenerateReport} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Report"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Reports</CardTitle>
              <CardDescription>Access your previously generated reports.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSavedReports ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : savedReports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-semibold">No reports found</h3>
                  <p className="text-sm text-muted-foreground">Generate a new report to see it here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedReports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{getReportTypeName(report.type)}</h3>
                          <p className="text-sm text-muted-foreground">
                            {report.courseYear && `${report.courseYear} • `}
                            Generated on {format(report.createdAt, "PPP")}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadReport(report.url)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

