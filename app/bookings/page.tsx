import { getBookings, getSettings } from '@/lib/cosmic'
import Header from '@/components/Header'
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
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Manage Bookings
            </h1>
            <p className="text-gray-600">
              View and manage all your appointments
            </p>
          </div>

          <BookingsList bookings={bookings} />
        </div>
      </main>
    </div>
  )
}