import Link from 'next/link'
import { EventType } from '@/types'

interface EventTypeCardProps {
  eventType: EventType
}

export default function EventTypeCard({ eventType }: EventTypeCardProps) {
  const duration = eventType.metadata?.duration || 0
  const description = eventType.metadata?.description || ''
  const availableDays = eventType.metadata?.available_days || []
  const startTime = eventType.metadata?.start_time || ''
  const endTime = eventType.metadata?.end_time || ''

  return (
    <Link href={`/book/${eventType.slug}`}>
      <div className="card hover:shadow-md transition-shadow duration-200 cursor-pointer">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {eventType.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            {description}
          </p>
        </div>

        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center">
            <span className="font-medium">Duration:</span>
            <span className="ml-2">{duration} minutes</span>
          </div>
          
          {availableDays.length > 0 && (
            <div className="flex items-start">
              <span className="font-medium">Days:</span>
              <span className="ml-2">{availableDays.join(', ')}</span>
            </div>
          )}
          
          {startTime && endTime && (
            <div className="flex items-center">
              <span className="font-medium">Hours:</span>
              <span className="ml-2">{startTime} - {endTime}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <span className="inline-flex items-center text-primary text-sm font-medium">
            Book this meeting
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}