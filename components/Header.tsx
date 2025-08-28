import Link from 'next/link'
import { Settings } from '@/types'

interface HeaderProps {
  settings?: Settings | null
}

export default function Header({ settings }: HeaderProps) {
  const siteName = settings?.metadata?.site_name || 'BookEasy'
  const logo = settings?.metadata?.company_logo

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            {logo && (
              <img 
                src={`${logo.imgix_url}?w=40&h=40&fit=crop&auto=format,compress`}
                alt={siteName}
                width="40"
                height="40"
                className="rounded-lg"
              />
            )}
            <span className="text-xl font-bold text-gray-900">{siteName}</span>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Book Meeting
            </Link>
            <Link 
              href="/bookings" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Manage Bookings
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}