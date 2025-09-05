import { getEventTypes, getSettings } from '@/lib/cosmic'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import EventTypeGrid from '@/components/EventTypeGrid'
import Calendar from '@/components/Calendar'

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic'

export default async function Home() {
  const [eventTypes, settings] = await Promise.all([
    getEventTypes(),
    getSettings()
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header settings={settings} />
      
      <main className="container mx-auto px-4 py-8">
        {eventTypes.length > 0 ? (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                📅 {settings?.metadata?.site_name || 'BookEasy'}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Schedule a meeting with ease. Choose from our available time slots and book your preferred meeting type.
              </p>
            </div>

            {/* Show first event type in calendar view */}
            {eventTypes.length === 1 ? (
              <Calendar 
                eventType={eventTypes[0]}  // Fixed: pass single eventType instead of eventTypes array
                settings={settings} 
              />
            ) : (
              <>
                <EventTypeGrid eventTypes={eventTypes} settings={settings} />
                <div className="mt-16">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                    Book Your First Available Meeting
                  </h2>
                  <Calendar 
                    eventType={eventTypes[0]}  // Fixed: pass single eventType instead of eventTypes array
                    settings={settings} 
                  />
                </div>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="mb-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📅 {settings?.metadata?.site_name || 'BookEasy'}
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                No event types are currently available for booking.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="font-semibold text-blue-900 mb-2">Getting Started</h3>
              <p className="text-blue-800 text-sm">
                Create your first event type to start accepting bookings from your audience.
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  )
}