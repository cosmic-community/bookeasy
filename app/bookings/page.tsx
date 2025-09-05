'use client'

import { useState, useEffect } from 'react'
import { Booking, Settings } from '@/types'
import Header from '@/components/Header'
import BookingsList from '@/components/BookingsList'
import BookingsCalendar from '@/components/BookingsCalendar'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

type ViewMode = 'calendar' | 'list'

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsResponse, settingsResponse] = await Promise.all([
          fetch('/api/bookings'),
          fetch('/api/settings')
        ])

        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json()
          setBookings(bookingsData.bookings || [])
        }

        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          setSettings(settingsData.settings)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleBookingUpdated = (updatedBooking: Booking) => {
    setBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.id === updatedBooking.id ? updatedBooking : booking
      )
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header settings={settings} />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading bookings...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header settings={settings} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Manage Bookings
                </h1>
                <p className="text-gray-600">
                  View and manage all your appointments
                </p>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'calendar'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Calendar
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  List
                </button>
              </div>
            </div>

            {/* Booking count */}
            <div className="text-sm text-gray-500">
              {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} total
            </div>
          </div>

          {/* View Content */}
          {viewMode === 'calendar' ? (
            <BookingsCalendar 
              bookings={bookings}
              onBookingUpdated={handleBookingUpdated}
            />
          ) : (
            <BookingsList 
              bookings={bookings}
              onBookingUpdated={handleBookingUpdated}
            />
          )}
        </div>
      </main>
    </div>
  )
}