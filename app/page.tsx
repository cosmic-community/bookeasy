import { cookies } from 'next/headers'
import { getEventTypes, getSettings } from '@/lib/cosmic'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import EventTypeGrid from '@/components/EventTypeGrid'
import CosmicBadge from '@/components/CosmicBadge'
import { Settings } from '@/types'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [eventTypes, settingsResponse] = await Promise.all([
    getEventTypes(),
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

  // Check if user is authenticated by looking for access code cookie
  // FIXED: In Next.js 15, cookies() returns a Promise that must be awaited
  const cookieStore = await cookies()
  const accessCodeCookie = cookieStore.get('access_code')
  const requiredAccessCode = process.env.ACCESS_CODE
  // FIXED: Ensure boolean type by converting to boolean explicitly
  const isAuthenticated: boolean = !!(accessCodeCookie?.value === requiredAccessCode && requiredAccessCode)

  // Get featured event types (first 2) and regular event types
  const featuredEventTypes = eventTypes.slice(0, 2)
  const regularEventTypes = eventTypes.slice(2)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header settings={settings} showAdminLinks={isAuthenticated} />
      
      <main>
        {/* Hero Section */}
        <section className="bg-white">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Schedule a meeting with{' '}
              {settings.metadata?.site_name || 'us'}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Choose a time that works for you. We'll send you all the details via email.
            </p>
          </div>
        </section>

        {/* Featured Event Types */}
        {featuredEventTypes.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                🌟 Featured Meeting Types
              </h2>
              <EventTypeGrid eventTypes={featuredEventTypes} isFeatured={true} />
            </div>
          </section>
        )}

        {/* All Event Types */}
        {regularEventTypes.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                📅 All Meeting Types
              </h2>
              <EventTypeGrid eventTypes={regularEventTypes} />
            </div>
          </section>
        )}

        {/* Empty State */}
        {eventTypes.length === 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4 text-center">
              <div className="max-w-md mx-auto">
                <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  No Meeting Types Available
                </h2>
                <p className="text-gray-600 mb-6">
                  It looks like there are no meeting types set up yet. Check back soon!
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer settings={settings} />
      
      {/* Cosmic Badge */}
      <CosmicBadge bucketSlug={process.env.COSMIC_BUCKET_SLUG as string} />
    </div>
  )
}