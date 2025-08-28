// app/book/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getEventTypes, getEventType, getSettings } from '@/lib/cosmic'
import { EventType } from '@/types'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import EventTypeInfo from '@/components/EventTypeInfo'
import BookingForm from '@/components/BookingForm'

interface BookingPageProps {
  params: Promise<{ slug: string }>
}

export default async function BookingPage({ params }: BookingPageProps) {
  // In Next.js 15+, params are now Promises and MUST be awaited
  const { slug } = await params
  
  const [eventType, eventTypes, settings] = await Promise.all([
    getEventType(slug),
    getEventTypes(),
    getSettings()
  ])

  if (!eventType) {
    notFound()
  }

  // Find the current event type for additional context
  const currentEventType = eventTypes.find((et: EventType) => et.slug === slug)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header settings={settings} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Event Type Information */}
            <div>
              <EventTypeInfo eventType={eventType} />
            </div>
            
            {/* Booking Form */}
            <div>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Select a Date & Time
                </h2>
                <BookingForm 
                  eventType={eventType}
                  settings={settings}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  )
}

export async function generateStaticParams() {
  const eventTypes = await getEventTypes()
  
  return eventTypes.map((eventType: EventType) => ({
    slug: eventType.slug,
  }))
}