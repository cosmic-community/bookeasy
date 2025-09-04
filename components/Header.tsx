'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings } from '@/types'

interface HeaderProps {
  settings?: Settings | null
}

export default function Header({ settings }: HeaderProps) {
  const pathname = usePathname()
  const siteName = settings?.metadata?.site_name || 'BookEasy'
  const logo = settings?.metadata?.company_logo

  // Determine if a link is active based on current pathname
  const isActiveLink = (path: string): boolean => {
    if (path === '/') {
      return pathname === '/' || pathname.startsWith('/book/')
    }
    return pathname.startsWith(path)
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
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

          <nav className="flex items-center space-x-8">
            <Link 
              href="/" 
              className={`relative px-3 py-2 font-medium transition-all duration-200 border-b-2 ${
                isActiveLink('/') 
                  ? 'text-blue-600 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900 border-transparent'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>📅</span>
                <span>Book Meeting</span>
              </span>
            </Link>
            
            <Link 
              href="/bookings" 
              className={`relative px-3 py-2 font-medium transition-all duration-200 border-b-2 ${
                isActiveLink('/bookings') 
                  ? 'text-blue-600 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900 border-transparent'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>📋</span>
                <span>Manage Bookings</span>
              </span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}