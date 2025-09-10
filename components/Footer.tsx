import Link from 'next/link'
import { Settings } from '@/types'

interface FooterProps {
  settings: Settings
}

export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-gray-600 text-sm">
              © {currentYear} {settings?.metadata?.site_name || 'BookEasy'}. All rights reserved.
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link 
              href="/admin-login"
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200"
            >
              Admin Login
            </Link>
            <a
              href="mailto:support@bookeasy.com"
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}