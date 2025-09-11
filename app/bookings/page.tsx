import { getBookings, getAllBookings, getSettings } from '@/lib/cosmic'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BookingsCalendar from '@/components/BookingsCalendar'
import { Calendar } from 'lucide-react'
import { Settings } from '@/types'

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic'

export default async function BookingsPage() {
  try {
    const [bookings, allBookings, settingsResponse] = await Promise.all([
      getBookings(), // Future bookings only for list view
      getAllBookings(), // All bookings including past for calendar view
      getSettings()
    ])

    // Provide default settings if null - FIXED: Create proper Settings object
    const settings: Settings = settingsResponse || {
      id: 'default',
      slug: 'default',
      title: 'Default Settings',
      type: 'settings' as const,
      created_at: new Date().toISOString(),
      modified_at: new Date().toISOString(),
      metadata: {
        site_name: 'BookEasy'
      }
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <Header settings={settings} showAdminLinks={true} />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Bookings
              </h1>
            </div>
            <p className="text-gray-600">
              Manage and view all your scheduled appointments.
            </p>
          </div>

          <BookingsCalendar 
            bookings={bookings}
            allBookings={allBookings}
          />
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