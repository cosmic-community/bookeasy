import { EventType } from '@/types'
import EventTypeCard from './EventTypeCard'

interface EventTypeGridProps {
  eventTypes: EventType[]
  isFeatured?: boolean
}

export default function EventTypeGrid({ eventTypes, isFeatured = false }: EventTypeGridProps) {
  if (!eventTypes || eventTypes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No event types available</p>
      </div>
    )
  }

  return (
    <div className={`
      grid gap-6 
      ${isFeatured 
        ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' 
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }
    `}>
      {eventTypes.map((eventType) => (
        <EventTypeCard
          key={eventType.id}
          eventType={eventType}
        />
      ))}
    </div>
  )
}