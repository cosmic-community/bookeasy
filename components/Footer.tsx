import { Settings } from '@/types'

interface FooterProps {
  settings?: Settings | null
}

export default function Footer({ settings }: FooterProps) {
  const siteName = settings?.metadata?.site_name || 'BookEasy'
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-gray-600">
            © {currentYear} {siteName}. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Powered by{' '}
            <a 
              href="https://www.cosmicjs.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Cosmic
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}