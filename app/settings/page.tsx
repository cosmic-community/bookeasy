import { getSettings } from '@/lib/cosmic'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SettingsForm from '@/components/SettingsForm'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const settingsResponse = await getSettings()

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
      <Header settings={settings} showAdminLinks={true} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ⚙️ Settings
          </h1>
          <p className="text-gray-600">
            Manage your booking system settings, availability, and preferences.
          </p>
        </div>

        <SettingsForm settings={settingsResponse} />
      </main>

      <Footer settings={settings} />
    </div>
  )
}