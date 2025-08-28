import { EventType } from '@/types'
import EventTypeCard from '@/components/EventTypeCard'

interface EventTypeGridProps {
  eventTypes: EventType[]
}

export default function EventTypeGrid({ eventTypes }: EventTypeGridProps) {
  if (!eventTypes || eventTypes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No event types available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {eventTypes.map((eventType) => (
        <EventTypeCard key={eventType.id} eventType={eventType} />
      ))}
    </div>
  )
}