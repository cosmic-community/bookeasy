// Base Cosmic object interface
interface CosmicObject {
  id: string;
  slug: string;
  title: string;
  content?: string;
  metadata: Record<string, any>;
  type: string;
  created_at: string;
  modified_at: string;
}

// User interface
interface User extends CosmicObject {
  type: 'users';
  metadata: {
    full_name?: string;
    email?: string;
    profile_photo?: {
      url: string;
      imgix_url: string;
    };
    bio?: string;
    timezone?: {
      key: string;
      value: string;
    };
  };
}

// Event Type interface
interface EventType extends CosmicObject {
  type: 'event-types';
  metadata: {
    event_name?: string;
    description?: string;
    duration?: number;
    host?: User;
    available_days?: string[];
    start_time?: string;
    end_time?: string;
  };
}

// Booking interface
interface Booking extends CosmicObject {
  type: 'bookings';
  metadata: {
    event_type?: EventType;
    attendee_name?: string;
    attendee_email?: string;
    booking_date?: string;
    booking_time?: string;
    status?: string | {
      key: string;
      value: string;
    };
    notes?: string;
  };
}

// Settings interface
interface Settings extends CosmicObject {
  type: 'settings';
  metadata: {
    site_name?: string;
    company_logo?: {
      url: string;
      imgix_url: string;
    };
    buffer_time?: number;
    email_notifications?: boolean;
    // New availability settings
    default_start_time?: string;
    default_end_time?: string;
    default_available_days?: string[];
    timezone?: string;
    booking_window_days?: number;
    minimum_notice_hours?: number;
  };
}

// Type literals for select-dropdown values
type BookingStatus = 'confirmed' | 'cancelled' | 'completed';
type TimezoneKey = 'EST' | 'CST' | 'MST' | 'PST';

// API response types
interface CosmicResponse<T> {
  objects: T[];
  total: number;
  limit: number;
  skip: number;
}

// Form data interfaces
interface BookingFormData {
  event_type_id: string;
  attendee_name: string;
  attendee_email: string;
  booking_date: string;
  booking_time: string;
  notes?: string;
}

interface EventTypeFormData {
  event_name: string;
  description: string;
  duration: number;
  available_days: string[];
  start_time: string;
  end_time: string;
}

interface SettingsFormData {
  site_name: string;
  buffer_time: number;
  email_notifications: boolean;
  default_start_time: string;
  default_end_time: string;
  default_available_days: string[];
  timezone: string;
  booking_window_days: number;
  minimum_notice_hours: number;
}

// Type guards
function isUser(obj: CosmicObject): obj is User {
  return obj.type === 'users';
}

function isEventType(obj: CosmicObject): obj is EventType {
  return obj.type === 'event-types';
}

function isBooking(obj: CosmicObject): obj is Booking {
  return obj.type === 'bookings';
}

function isSettings(obj: CosmicObject): obj is Settings {
  return obj.type === 'settings';
}

export type {
  CosmicObject,
  User,
  EventType,
  Booking,
  Settings,
  CosmicResponse,
  BookingFormData,
  EventTypeFormData,
  SettingsFormData,
  BookingStatus,
  TimezoneKey
};

export {
  isUser,
  isEventType,
  isBooking,
  isSettings
};