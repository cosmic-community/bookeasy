import { getBookings, getSettings, getEventTypes } from '@/lib/cosmic'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Calendar from '@/components/Calendar'

export default async function Home() {
  const [bookings, settings, eventTypes] = await Promise.all([
    getBookings(),
    getSettings(),
    getEventTypes()
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header settings={settings} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Meeting Calendar
          </h1>
          <p className="text-gray-600">
            View and schedule meetings on your calendar. Click on any date to add a new meeting.
          </p>
        </div>

        <Calendar 
          bookings={bookings} 
          eventTypes={eventTypes}
          settings={settings}
        />
      </main>

      <Footer settings={settings} />
    </div>
  )
}