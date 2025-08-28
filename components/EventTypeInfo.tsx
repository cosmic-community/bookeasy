import { EventType } from '@/types'

interface EventTypeInfoProps {
  eventType: EventType
}

export default function EventTypeInfo({ eventType }: EventTypeInfoProps) {
  const host = eventType.metadata?.host
  const duration = eventType.metadata?.duration || 0
  const description = eventType.metadata?.description || ''
  const availableDays = eventType.metadata?.available_days || []
  const startTime = eventType.metadata?.start_time || ''
  const endTime = eventType.metadata?.end_time || ''

  return (
    <div className="card">
      {host && (
        <div className="flex items-center mb-6">
          {host.metadata?.profile_photo && (
            <img 
              src={`${host.metadata.profile_photo.imgix_url}?w=64&h=64&fit=crop&auto=format,compress`}
              alt={host.metadata?.full_name || host.title}
              width="64"
              height="64"
              className="rounded-full"
            />
          )}
          <div className="ml-4">
            <h3 className="font-semibold text-gray-900">
              {host.metadata?.full_name || host.title}
            </h3>
            {host.metadata?.timezone?.value && (
              <p className="text-sm text-gray-600">
                {host.metadata.timezone.value}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {eventType.title}
        </h1>
        {description && (
          <p className="text-gray-600 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{duration} minutes</span>
        </div>

        {availableDays.length > 0 && (
          <div className="flex items-start text-sm text-gray-600">
            <svg className="w-5 h-5 mr-3 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <span className="block">Available days:</span>
              <span className="text-gray-500">{availableDays.join(', ')}</span>
            </div>
          </div>
        )}

        {startTime && endTime && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{startTime} - {endTime}</span>
          </div>
        )}
      </div>

      {host?.metadata?.bio && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="font-medium text-gray-900 mb-2">About</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {host.metadata.bio}
          </p>
        </div>
      )}
    </div>
  )
}