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

  const handleLogout = () => {
    // Clear the access code cookie by setting it to expire
    document.cookie = 'access_code=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    window.location.href = '/'
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
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
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
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}