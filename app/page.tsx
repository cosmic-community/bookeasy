import { getEventTypes, getBookings, getSettings } from '@/lib/cosmic'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import EventTypeGrid from '@/components/EventTypeGrid'
import Calendar from '@/components/Calendar'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [eventTypes, bookings, settings] = await Promise.all([
    getEventTypes(),
    getBookings(),
    getSettings()
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header settings={settings} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Types */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📅 Book a Meeting
              </h1>
              <p className="text-gray-600">
                Choose an event type and select your preferred time slot.
              </p>
            </div>

            <EventTypeGrid eventTypes={eventTypes} />
          </div>

          {/* Right Column - Calendar */}
          <div className="lg:col-span-1">
            <Calendar 
              eventTypes={eventTypes}
              settings={settings}
            />
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  )
}