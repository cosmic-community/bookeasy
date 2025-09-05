import { EventType, Settings } from '@/types'
import { formatTime } from '@/lib/availability'

interface EventTypeInfoProps {
  eventType: EventType
  settings: Settings | null
}

export default function EventTypeInfo({ eventType, settings }: EventTypeInfoProps) {
  const host = eventType.metadata?.host

  return (
    <div className="space-y-6">
      {/* Event Type Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {eventType.metadata?.event_name || eventType.title}
        </h2>
        {eventType.metadata?.description && (
          <p className="text-gray-600 leading-relaxed">
            {eventType.metadata.description}
          </p>
        )}
      </div>

      {/* Meeting Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Meeting Details</h3>
        
        <div className="space-y-3">
          <div className="flex items-center text-gray-700">
            <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{eventType.metadata?.duration || 30} minutes</span>
          </div>

          {eventType.metadata?.available_days && eventType.metadata.available_days.length > 0 && (
            <div className="flex items-start text-gray-700">
              <svg className="w-5 h-5 mr-3 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <div className="font-medium mb-1">Available Days:</div>
                <div className="text-sm">
                  {eventType.metadata.available_days.join(', ')}
                </div>
              </div>
            </div>
          )}

          {eventType.metadata?.start_time && eventType.metadata?.end_time && (
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {formatTime(eventType.metadata.start_time)} - {formatTime(eventType.metadata.end_time)}
              </span>
            </div>
          )}

          {settings?.metadata?.timezone && (
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{settings.metadata.timezone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Host Information */}
      {host && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Host</h3>
          <div className="flex items-start space-x-4">
            {host.metadata?.profile_photo?.imgix_url && (
              <img
                src={`${host.metadata.profile_photo.imgix_url}?w=120&h=120&fit=crop&auto=format,compress`}
                alt={host.metadata?.full_name || host.title}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <h4 className="font-semibold text-gray-900">
                {host.metadata?.full_name || host.title}
              </h4>
              {host.metadata?.bio && (
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                  {host.metadata.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Additional Information */}
      {settings?.metadata?.buffer_time && settings.metadata.buffer_time > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Buffer Time</p>
              <p>
                There's a {settings.metadata.buffer_time}-minute buffer between meetings to ensure we can give you our full attention.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}