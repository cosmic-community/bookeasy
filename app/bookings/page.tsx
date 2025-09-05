import { getBookings, getSettings } from '@/lib/cosmic'
import { Booking } from '@/types'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BookingsList from '@/components/BookingsList'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function BookingsPage() {
  const [bookings, settings] = await Promise.all([
    getBookings(),
    getSettings()
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header settings={settings} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📅 Bookings
          </h1>
          <p className="text-gray-600">
            Manage and view all your upcoming and past bookings.
          </p>
        </div>

        <BookingsList 
          bookings={bookings} 
          onBookingUpdate={(updatedBooking: Booking) => {
            // Handle booking update
            console.log('Booking updated:', updatedBooking)
          }} 
        />
      </main>

      <Footer settings={settings} />
    </div>
  )
}