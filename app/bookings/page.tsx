import { getBookings, getSettings } from '@/lib/cosmic'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BookingsList from '@/components/BookingsList'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function BookingsPage() {
  try {
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
              Manage and view all your scheduled appointments.
            </p>
          </div>

          <BookingsList bookings={bookings} />
        </main>

        <Footer settings={settings} />
      </div>
    )
  } catch (error) {
    console.error('Error loading bookings page:', error)
    
    // Return a fallback UI if there's an error
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Unable to Load Bookings
          </h1>
          <p className="text-gray-600 mb-4">
            There was an error loading your bookings. Please try again later.
          </p>
          <a 
            href="/" 
            className="btn btn-primary"
          >
            Return Home
          </a>
        </div>
      </div>
    )
  }
}