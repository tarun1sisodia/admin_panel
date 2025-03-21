"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Video, Users } from "lucide-react"

type Class = {
  id: string
  name: string
  teacher: string
  students: number
  startTime: string
  duration: string
}

export function OngoingClasses() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch this data from Firebase
    // This is just placeholder data
    setClasses([
      {
        id: "1",
        name: "Advanced Mathematics",
        teacher: "Dr. Smith",
        students: 24,
        startTime: "09:00 AM",
        duration: "1h 30m",
      },
      {
        id: "2",
        name: "Physics Lab",
        teacher: "Prof. Johnson",
        students: 18,
        startTime: "10:30 AM",
        duration: "2h 00m",
      },
      {
        id: "3",
        name: "English Literature",
        teacher: "Ms. Davis",
        students: 30,
        startTime: "01:00 PM",
        duration: "1h 00m",
      },
    ])
    setLoading(false)
  }, [])

  if (loading) {
    return <div>Loading classes...</div>
  }

  return (
    <div className="space-y-4">
      {classes.map((cls) => (
        <Card key={cls.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{cls.name}</h3>
                <p className="text-sm text-muted-foreground">{cls.teacher}</p>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{cls.students} students</span>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="mb-2">
                  Live
                </Badge>
                <p className="text-sm">{cls.startTime}</p>
                <p className="text-sm text-muted-foreground">{cls.duration}</p>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" size="sm">
                <Video className="h-4 w-4 mr-2" />
                Join Class
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

