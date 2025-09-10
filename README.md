# BookEasy - Modern Calendly Clone

![App Preview](https://imgix.cosmicjs.com/a52304a0-8449-11f0-8ece-89921cbea84a-photo-1611224923853-80b023f02d71-1756411227360.jpg?w=1200&h=300&fit=crop&auto=format,compress)

A modern, feature-rich appointment scheduling platform built with Next.js and Cosmic. BookEasy provides all the essential features needed for professional appointment booking, including event type management, availability scheduling, and booking management.

## Features

- 📅 **Event Type Management** - Create and manage different types of appointments with custom durations
- ⏰ **Smart Availability** - Set working hours and available days for each event type
- 📋 **Booking Management** - Track and manage all appointments with status updates
- 👤 **Host Profiles** - Professional profiles with photos, bios, and timezone settings
- 🔔 **Email Notifications** - Automated booking confirmations and reminders
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- ⚙️ **Settings Management** - Configure site settings, logos, and notification preferences
- 🔒 **Admin Protection** - Secure access code protection for booking and settings management

<!-- CLONE_PROJECT_BUTTON -->

## Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> Create a calendly clone.

### Code Generation Prompt

> Build a calendly clone using Next.js

The app has been tailored to work with your existing Cosmic content structure and includes all the features requested above.

## Technologies Used

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Content Management**: Cosmic CMS
- **Type Safety**: TypeScript
- **Package Manager**: Bun
- **Image Optimization**: Imgix
- **Fonts**: Inter

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Cosmic account and bucket

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd bookeasy-calendly-clone
```

2. Install dependencies
```bash
bun install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Add your Cosmic credentials and set up admin access:
```env
# Cosmic API credentials
COSMIC_BUCKET_SLUG=your-bucket-slug
COSMIC_READ_KEY=your-read-key
COSMIC_WRITE_KEY=your-write-key

# Admin access code for managing bookings and settings
ACCESS_CODE=your-secure-access-code
```

⚠️ **Important**: Make sure to set a strong `ACCESS_CODE` to protect your admin areas. This code will be required to access the bookings management and settings pages.

4. Run the development server
```bash
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Admin Access

### Accessing Admin Features

The booking management (`/bookings`) and settings (`/settings`) pages are protected by an access code. To access these areas:

1. Navigate to `/bookings` or `/settings`
2. You'll be redirected to the admin login page
3. Enter the access code you configured in your environment variables
4. Once authenticated, you'll have access to admin features for 7 days

### Admin Features

- **Booking Management**: View, update, and manage all scheduled appointments
- **Settings Configuration**: Update company information, logos, availability, and system preferences
- **Secure Logout**: Clear admin session and require re-authentication

### Security Notes

- Access codes are stored securely using HTTP-only cookies
- Sessions automatically expire after 7 days
- Admin pages are completely inaccessible without the correct access code
- The access code is only stored in server-side environment variables

## Cosmic SDK Examples

### Fetching Event Types
```typescript
import { cosmic } from '@/lib/cosmic'

// Get all available event types
const eventTypes = await cosmic.objects
  .find({ type: 'event-types' })
  .depth(1)

// Get a specific event type by slug
const eventType = await cosmic.objects
  .findOne({ 
    type: 'event-types',
    slug: 'quick-chat-30-minutes'
  })
  .depth(1)
```

### Creating a Booking
```typescript
// Create a new booking
const booking = await cosmic.objects.insertOne({
  type: 'bookings',
  title: `${attendeeName} - ${eventType.title}`,
  metadata: {
    event_type: eventTypeId,
    attendee_name: attendeeName,
    attendee_email: attendeeEmail,
    booking_date: bookingDate,
    booking_time: bookingTime,
    status: { key: 'confirmed', value: 'Confirmed' },
    notes: notes || ''
  }
})
```

### Managing Booking Status
```typescript
// Update booking status
await cosmic.objects.updateOne(bookingId, {
  metadata: {
    status: { key: 'completed', value: 'Completed' }
  }
})
```

## Cosmic CMS Integration

This application uses four main content types:

1. **Users** - Host profiles with contact information and availability preferences
2. **Event Types** - Different types of appointments with durations and descriptions
3. **Bookings** - Individual appointment records with attendee information
4. **Settings** - Site-wide configuration including branding and notification settings

The booking system automatically checks availability based on existing bookings and the host's configured working hours. Buffer time between appointments can be configured in the settings.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!

### Environment Variables

Make sure to set these environment variables in your deployment platform:

- `COSMIC_BUCKET_SLUG` - Your Cosmic bucket slug
- `COSMIC_READ_KEY` - Your Cosmic read key
- `COSMIC_WRITE_KEY` - Your Cosmic write key
- `ACCESS_CODE` - Secure access code for admin features (use a strong, unique password)

### Production Security

For production deployments:

1. **Use a Strong Access Code**: Generate a secure, random access code (minimum 12 characters with mixed case, numbers, and symbols)
2. **Environment Variables**: Never commit your actual access code to version control
3. **HTTPS Only**: Ensure your deployment uses HTTPS to protect the access code in transit
4. **Regular Updates**: Consider rotating your access code periodically for enhanced security

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request