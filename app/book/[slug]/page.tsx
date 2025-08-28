// app/book/[slug]/page.tsx
import { getEventType, getSettings, getBookingsForDate } from '@/lib/cosmic'
import Header from '@/components/Header'
import BookingForm from '@/components/BookingForm'
import EventTypeInfo from '@/components/EventTypeInfo'
import { notFound } from 'next/navigation'

interface BookingPageProps {
  params: Promise<{ slug: string }>
}

export default async function BookingPage({ params }: BookingPageProps) {
  // IMPORTANT: In Next.js 15+, params are now Promises and MUST be awaited
  const { slug } = await params
  
  const [eventType, settings] = await Promise.all([
    getEventType(slug),
    getSettings()
  ])

  if (!eventType) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header settings={settings} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <EventTypeInfo eventType={eventType} />
            <BookingForm eventType={eventType} settings={settings} />
          </div>
        </div>
      </main>
    </div>
  )
}

// Generate static paths for all event types
export async function generateStaticParams() {
  const eventTypes = await getEventTypes()
  
  return eventTypes.map((eventType) => ({
    slug: eventType.slug,
  }))
}