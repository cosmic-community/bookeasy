import { getBookings, getSettings } from '@/lib/cosmic'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BookingsCalendar from '@/components/BookingsCalendar'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function BookingsPage() {
  const [bookings, settings] = await Promise.all([
    getBookings(),
    getSettings()
  ])

  const handleBookingUpdated = () => {
    // This will be handled by the client component internally
    // We just need to provide the function to satisfy the interface
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header settings={settings} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📅 Bookings Calendar
          </h1>
          <p className="text-gray-600">
            View and manage all your bookings in a calendar format.
          </p>
        </div>

        <BookingsCalendar 
          bookings={bookings} 
          onBookingUpdated={handleBookingUpdated}
        />
      </main>

      <Footer settings={settings} />
    </div>
  )
}