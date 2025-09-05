import { getBookings, getSettings } from '@/lib/cosmic'
import { Booking } from '@/types'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BookingsList from '@/components/BookingsList'
import BookingsCalendar from '@/components/BookingsCalendar'
import { useState } from 'react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Server Component for initial data
export default async function BookingsPage() {
  const [bookings, settings] = await Promise.all([
    getBookings(),
    getSettings()
  ])

  // Client Component for interactive features
  return <BookingsPageClient initialBookings={bookings} settings={settings} />
}

// Client Component to handle state and interactions
function BookingsPageClient({ 
  initialBookings, 
  settings 
}: { 
  initialBookings: Booking[]
  settings: any 
}) {
  const [bookings, setBookings] = useState(initialBookings)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  const handleBookingUpdate = (updatedBooking: Booking) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === updatedBooking.id ? updatedBooking : booking
      )
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header settings={settings} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📋 Manage Bookings
            </h1>
            <p className="text-gray-600">
              View and manage all your scheduled appointments.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📅 Calendar View
            </button>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                No Bookings Yet
              </h2>
              <p className="text-gray-600 mb-6">
                When customers book appointments, they'll appear here for you to manage.
              </p>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'list' ? (
              <BookingsList 
                bookings={bookings} 
                onBookingUpdate={handleBookingUpdate}
              />
            ) : (
              <BookingsCalendar bookings={bookings} />
            )}
          </>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  )
}