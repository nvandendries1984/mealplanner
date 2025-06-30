"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { nl } from "date-fns/locale"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import "react-big-calendar/lib/css/react-big-calendar.css"

const locales = {
  nl: nl,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface PlannedMealEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: {
    mealId: string
    mealType: string
    servings: number
  }
}

export default function CalendarPage() {
  const { data: session, status } = useSession()
  const [events, setEvents] = useState<PlannedMealEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin")
    }
  }, [status])

  useEffect(() => {
    if (session) {
      fetchPlannedMeals()
    }
  }, [session])

  const fetchPlannedMeals = async () => {
    try {
      const response = await fetch("/api/planned-meals")
      if (response.ok) {
        const data = await response.json()
        const calendarEvents = data.map((meal: {
          id: string
          meal: { name: string }
          plannedDate: string
          mealType: string
          servings: number
          mealId: string
        }) => ({
          id: meal.id,
          title: `${meal.meal.name} (${meal.servings}p)`,
          start: new Date(meal.plannedDate),
          end: new Date(new Date(meal.plannedDate).getTime() + 60 * 60 * 1000), // 1 hour duration
          resource: {
            mealId: meal.mealId,
            mealType: meal.mealType,
            servings: meal.servings,
          }
        }))
        setEvents(calendarEvents)
      }
    } catch (error) {
      console.error("Error fetching planned meals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSlot = ({ start }: { start: Date }) => {
    // Navigate to meal planning for selected date
    const dateString = format(start, "yyyy-MM-dd")
    window.location.href = `/calendar/plan?date=${dateString}`
  }

  const handleSelectEvent = (event: PlannedMealEvent) => {
    // Navigate to meal details
    window.location.href = `/meals/${event.resource.mealId}`
  }

  const messages = {
    allDay: "Hele dag",
    previous: "Vorige",
    next: "Volgende",
    today: "Vandaag",
    month: "Maand",
    week: "Week",
    day: "Dag",
    agenda: "Agenda",
    date: "Datum",
    time: "Tijd",
    event: "Maaltijd",
    noEventsInRange: "Geen maaltijden gepland in deze periode.",
    showMore: (total: number) => `+ ${total} meer`,
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Kalender laden...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-emerald-600 hover:text-emerald-700">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Terug
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Maaltijd Kalender</h1>
            </div>
            <Link
              href="/calendar/plan"
              className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Maaltijd plannen</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6" style={{ height: "600px" }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            messages={messages}
            culture="nl"
            defaultView="month"
            views={["month", "week", "day"]}
            eventPropGetter={() => ({
              style: {
                backgroundColor: "#059669",
                border: "none",
                borderRadius: "4px",
                color: "white",
              },
            })}
          />
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Legenda</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-emerald-600 rounded"></div>
              <span>Geplande maaltijd</span>
            </div>
            <div className="text-gray-600">
              • Klik op een datum om een maaltijd te plannen
            </div>
            <div className="text-gray-600">
              • Klik op een maaltijd om details te bekijken
            </div>
            <div className="text-gray-600">
              • Gebruik de knoppen om tussen weergaves te wisselen
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
