import { getEventTypes, getSettings } from '@/lib/cosmic'
import Header from '@/components/Header'
import EventTypeGrid from '@/components/EventTypeGrid'
import Footer from '@/components/Footer'

export default async function Home() {
  const [eventTypes, settings] = await Promise.all([
    getEventTypes(),
    getSettings()
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header settings={settings} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Book a meeting with {settings?.metadata?.site_name || 'us'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose a time that works for you. Select from the available appointment types below.
          </p>
        </div>

        <EventTypeGrid eventTypes={eventTypes} />
      </main>

      <Footer settings={settings} />
    </div>
  )
}