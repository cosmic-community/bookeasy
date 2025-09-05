import { getSettings } from '@/lib/cosmic'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SettingsForm from '@/components/SettingsForm'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const settings = await getSettings()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header settings={settings} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ⚙️ Settings
          </h1>
          <p className="text-gray-600">
            Manage your booking system settings, availability, and preferences.
          </p>
        </div>

        <SettingsForm settings={settings} />
      </main>

      <Footer settings={settings} />
    </div>
  )
}