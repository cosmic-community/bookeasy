// app/book/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getEventType, getSettings } from '@/lib/cosmic'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Calendar from '@/components/Calendar'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BookPage({ params }: PageProps) {
  const { slug } = await params
  
  const [eventType, settingsResponse] = await Promise.all([
    getEventType(slug),
    getSettings()
  ])

  if (!eventType) {
    notFound()
  }

  // Provide default settings if null
  const settings = settingsResponse || {
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
      <Header settings={settings} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {eventType.metadata?.event_name || eventType.title}
            </h1>
            {eventType.metadata?.description && (
              <p className="text-gray-600">
                {eventType.metadata.description}
              </p>
            )}
          </div>

          <div className="w-full">
            <Calendar 
              eventType={eventType}
              settings={settings}
            />
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  )
}