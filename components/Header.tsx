'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Settings, LogOut } from 'lucide-react'
import { Settings as SettingsType } from '@/types'

interface HeaderProps {
  settings: SettingsType
  showAdminLinks?: boolean
}

export default function Header({ settings, showAdminLinks = false }: HeaderProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    
    try {
      // Call the logout API route to clear the httpOnly cookie
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Clear any client-side storage as backup
        try {
          localStorage.removeItem('access_code')
          sessionStorage.removeItem('access_code')
        } catch (e) {
          // Ignore storage errors
        }

        // Force redirect to home page and reload to clear any cached state
        window.location.replace('/')
      } else {
        console.error('Logout failed')
        setIsLoggingOut(false)
        setShowLogoutConfirm(false)
      }
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
      setShowLogoutConfirm(false)
    }
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and site title - FIXED: Use correct property names */}
            <Link href="/" className="flex items-center space-x-3">
              {settings?.metadata?.company_logo?.imgix_url ? (
                <img 
                  src={`${settings.metadata.company_logo.imgix_url}?w=40&h=40&fit=crop&auto=format,compress`}
                  alt={settings.metadata.site_name || 'Logo'}
                  className="w-10 h-10 rounded-lg object-cover"
                  width={40}
                  height={40}
                />
              ) : (
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              )}
              <h1 className="text-xl font-bold text-gray-900">
                {settings?.metadata?.site_name || 'BookEasy'}
              </h1>
            </Link>

            {/* Admin navigation */}
            {showAdminLinks && (
              <nav className="flex items-center space-x-6">
                <Link 
                  href="/bookings"
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Bookings</span>
                </Link>
                <Link 
                  href="/settings"
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                  disabled={isLoggingOut}
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                </button>
              </nav>
            )}
          </div>
        </div>
      </header>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Logout
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout? You'll need to enter the access code again to manage bookings and settings.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isLoggingOut}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Logging out...
                  </div>
                ) : (
                  'Logout'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}