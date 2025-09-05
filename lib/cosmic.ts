import { createBucketClient } from '@cosmicjs/sdk';
import { User, EventType, Booking, Settings, CosmicResponse } from '@/types';

export const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
});

// Simple error helper for Cosmic SDK
function hasStatus(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error;
}

// Get all event types
export async function getEventTypes(): Promise<EventType[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'event-types' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1);
    
    return response.objects as EventType[];
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch event types');
  }
}

// Get a specific event type by slug
export async function getEventType(slug: string): Promise<EventType | null> {
  try {
    const response = await cosmic.objects
      .findOne({ 
        type: 'event-types',
        slug
      })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1);
    
    return response.object as EventType;
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch event type');
  }
}

// Get all bookings
export async function getBookings(): Promise<Booking[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'bookings' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1);
    
    return response.objects as Booking[];
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch bookings');
  }
}

// Get bookings for a specific date
export async function getBookingsForDate(date: string): Promise<Booking[]> {
  try {
    const response = await cosmic.objects
      .find({ 
        type: 'bookings',
        'metadata.booking_date': date
      })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1);
    
    return response.objects as Booking[];
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch bookings for date');
  }
}

// Create a new booking
export async function createBooking(bookingData: {
  event_type_id: string;
  attendee_name: string;
  attendee_email: string;
  booking_date: string;
  booking_time: string;
  notes?: string;
}): Promise<Booking> {
  try {
    const response = await cosmic.objects.insertOne({
      type: 'bookings',
      title: `${bookingData.attendee_name} - Booking`,
      metadata: {
        event_type: bookingData.event_type_id,
        attendee_name: bookingData.attendee_name,
        attendee_email: bookingData.attendee_email,
        booking_date: bookingData.booking_date,
        booking_time: bookingData.booking_time,
        status: { key: 'confirmed', value: 'Confirmed' },
        notes: bookingData.notes || ''
      }
    });
    
    return response.object as Booking;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw new Error('Failed to create booking');
  }
}

// Update booking status
export async function updateBookingStatus(bookingId: string, status: { key: string; value: string }): Promise<Booking> {
  try {
    const response = await cosmic.objects.updateOne(bookingId, {
      metadata: {
        status: status
      }
    });
    
    return response.object as Booking;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw new Error('Failed to update booking status');
  }
}

// Get site settings
export async function getSettings(): Promise<Settings | null> {
  try {
    const response = await cosmic.objects
      .findOne({ type: 'settings' })
      .props(['id', 'title', 'slug', 'metadata']);
    
    return response.object as Settings;
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch settings');
  }
}

// Update settings
export async function updateSettings(settingsId: string, settingsData: Partial<Settings['metadata']>): Promise<Settings> {
  try {
    const response = await cosmic.objects.updateOne(settingsId, {
      metadata: settingsData
    });
    
    return response.object as Settings;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw new Error('Failed to update settings');
  }
}

// Get user/host information
export async function getUser(id?: string): Promise<User | null> {
  try {
    let response;
    
    if (id) {
      response = await cosmic.objects
        .findOne({ 
          type: 'users',
          id
        })
        .props(['id', 'title', 'slug', 'metadata']);
    } else {
      // Get the first user if no ID provided
      const usersResponse = await cosmic.objects
        .find({ type: 'users' })
        .props(['id', 'title', 'slug', 'metadata'])
        .limit(1);
      
      if (usersResponse.objects.length === 0) {
        return null;
      }
      
      return usersResponse.objects[0] as User;
    }
    
    return response.object as User;
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch user');
  }
}