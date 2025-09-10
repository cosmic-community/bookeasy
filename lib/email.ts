import { BookingEmailData } from '@/types'
import { Resend } from 'resend'

// Initialize Resend - only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export function generateBookingConfirmationEmail(data: BookingEmailData): { subject: string; html: string } {
  const subject = `✅ Booking Confirmed: ${data.eventName} on ${data.bookingDate}`
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmed</title>
  <style>
    /* Reset styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1d1d1f;
      background-color: #f5f5f7;
      padding: 40px 20px;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%);
      padding: 32px;
      text-align: center;
    }
    
    .header-icon {
      width: 64px;
      height: 64px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      font-size: 28px;
    }
    
    .header h1 {
      color: #ffffff;
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    
    .header p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      font-weight: 400;
    }
    
    .content {
      padding: 40px 32px;
    }
    
    .greeting {
      font-size: 18px;
      font-weight: 500;
      color: #1d1d1f;
      margin-bottom: 24px;
    }
    
    .meeting-card {
      background-color: #f8f9fa;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
      border: 1px solid #e9ecef;
    }
    
    .meeting-title {
      font-size: 20px;
      font-weight: 600;
      color: #1d1d1f;
      margin-bottom: 16px;
      letter-spacing: -0.3px;
    }
    
    .meeting-details {
      display: grid;
      gap: 12px;
    }
    
    .detail-row {
      display: flex;
      align-items: center;
      font-size: 15px;
    }
    
    .detail-icon {
      width: 20px;
      height: 20px;
      margin-right: 12px;
      opacity: 0.7;
    }
    
    .detail-label {
      font-weight: 500;
      color: #6c757d;
      min-width: 80px;
    }
    
    .detail-value {
      color: #1d1d1f;
      font-weight: 500;
    }
    
    .notes-section {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e9ecef;
    }
    
    .notes-title {
      font-size: 16px;
      font-weight: 600;
      color: #1d1d1f;
      margin-bottom: 12px;
    }
    
    .notes-content {
      background-color: #ffffff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 16px;
      font-size: 15px;
      color: #495057;
      white-space: pre-wrap;
    }
    
    .next-steps {
      background-color: #e8f4fd;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
    }
    
    .next-steps h3 {
      font-size: 18px;
      font-weight: 600;
      color: #1d1d1f;
      margin-bottom: 16px;
    }
    
    .steps-list {
      list-style: none;
      padding: 0;
    }
    
    .steps-list li {
      font-size: 15px;
      color: #495057;
      margin-bottom: 8px;
      padding-left: 24px;
      position: relative;
    }
    
    .steps-list li:before {
      content: "•";
      color: #007AFF;
      font-weight: bold;
      position: absolute;
      left: 0;
    }
    
    .footer {
      padding: 32px;
      text-align: center;
      background-color: #f8f9fa;
      border-top: 1px solid #e9ecef;
    }
    
    .footer p {
      font-size: 14px;
      color: #6c757d;
      margin-bottom: 8px;
    }
    
    .footer-note {
      font-size: 12px;
      color: #9ca3af;
      font-style: italic;
    }
    
    /* Responsive design */
    @media (max-width: 640px) {
      body {
        padding: 20px 10px;
      }
      
      .email-container {
        border-radius: 12px;
      }
      
      .header, .content {
        padding: 24px 20px;
      }
      
      .meeting-card {
        padding: 20px;
      }
      
      .header h1 {
        font-size: 24px;
      }
      
      .meeting-title {
        font-size: 18px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <div class="header-icon">
        ✅
      </div>
      <h1>Booking Confirmed!</h1>
      <p>Your meeting has been successfully scheduled</p>
    </div>
    
    <!-- Content -->
    <div class="content">
      <div class="greeting">
        Hi ${data.attendeeName},
      </div>
      
      <p style="font-size: 16px; color: #495057; margin-bottom: 32px;">
        Great news! Your meeting has been successfully scheduled. Here are the details:
      </p>
      
      <!-- Meeting Details Card -->
      <div class="meeting-card">
        <div class="meeting-title">${data.eventName}</div>
        <div class="meeting-details">
          <div class="detail-row">
            <span class="detail-icon">📅</span>
            <span class="detail-label">Date:</span>
            <span class="detail-value">${data.bookingDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-icon">🕐</span>
            <span class="detail-label">Time:</span>
            <span class="detail-value">${data.bookingTime}</span>
          </div>
          <div class="detail-row">
            <span class="detail-icon">⏱️</span>
            <span class="detail-label">Duration:</span>
            <span class="detail-value">${data.duration} minutes</span>
          </div>
          ${data.hostName ? `
          <div class="detail-row">
            <span class="detail-icon">👤</span>
            <span class="detail-label">Host:</span>
            <span class="detail-value">${data.hostName}</span>
          </div>
          ` : ''}
        </div>
      </div>
      
      ${data.notes ? `
      <!-- Notes Section -->
      <div class="notes-section">
        <div class="notes-title">Additional Notes</div>
        <div class="notes-content">${data.notes}</div>
      </div>
      ` : ''}
      
      <!-- Next Steps -->
      <div class="next-steps">
        <h3>What's Next?</h3>
        <ul class="steps-list">
          <li>Add this meeting to your calendar</li>
          <li>Prepare any questions or materials</li>
          <li>Join the meeting at the scheduled time</li>
          <li>Check your email for any updates</li>
        </ul>
      </div>
      
      <p style="font-size: 16px; color: #495057; margin-bottom: 16px;">
        If you need to reschedule or cancel, please contact us as soon as possible.
      </p>
      
      <p style="font-size: 16px; color: #495057;">
        Looking forward to our meeting!
      </p>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p>This is an automated confirmation email.</p>
      <p class="footer-note">Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>
  `
  
  return { subject, html }
}

export function generateBookingNotificationEmail(data: BookingEmailData): { subject: string; html: string } {
  const subject = `🔔 New Booking: ${data.attendeeName} - ${data.eventName}`
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking Notification</title>
  <style>
    /* Reset styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1d1d1f;
      background-color: #f5f5f7;
      padding: 40px 20px;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #FF9500 0%, #FFCC00 100%);
      padding: 32px;
      text-align: center;
    }
    
    .header-icon {
      width: 64px;
      height: 64px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      font-size: 28px;
    }
    
    .header h1 {
      color: #ffffff;
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    
    .header p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      font-weight: 400;
    }
    
    .content {
      padding: 40px 32px;
    }
    
    .notification-text {
      font-size: 18px;
      font-weight: 500;
      color: #1d1d1f;
      margin-bottom: 32px;
      text-align: center;
    }
    
    .booking-card {
      background-color: #f8f9fa;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
      border: 1px solid #e9ecef;
    }
    
    .attendee-section {
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid #e9ecef;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1d1d1f;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
    }
    
    .section-title span {
      margin-right: 8px;
    }
    
    .attendee-info {
      display: grid;
      gap: 8px;
      font-size: 15px;
    }
    
    .info-row {
      display: flex;
    }
    
    .info-label {
      font-weight: 500;
      color: #6c757d;
      min-width: 60px;
    }
    
    .info-value {
      color: #1d1d1f;
      font-weight: 500;
    }
    
    .meeting-details {
      display: grid;
      gap: 12px;
    }
    
    .detail-row {
      display: flex;
      align-items: center;
      font-size: 15px;
    }
    
    .detail-icon {
      width: 20px;
      height: 20px;
      margin-right: 12px;
      opacity: 0.7;
    }
    
    .detail-label {
      font-weight: 500;
      color: #6c757d;
      min-width: 80px;
    }
    
    .detail-value {
      color: #1d1d1f;
      font-weight: 500;
    }
    
    .notes-section {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e9ecef;
    }
    
    .notes-content {
      background-color: #ffffff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 16px;
      font-size: 15px;
      color: #495057;
      white-space: pre-wrap;
    }
    
    .action-section {
      background-color: #e8f4fd;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin-bottom: 32px;
    }
    
    .action-title {
      font-size: 18px;
      font-weight: 600;
      color: #1d1d1f;
      margin-bottom: 16px;
    }
    
    .action-text {
      font-size: 15px;
      color: #495057;
      margin-bottom: 16px;
    }
    
    .footer {
      padding: 32px;
      text-align: center;
      background-color: #f8f9fa;
      border-top: 1px solid #e9ecef;
    }
    
    .footer p {
      font-size: 14px;
      color: #6c757d;
      margin-bottom: 8px;
    }
    
    .footer-note {
      font-size: 12px;
      color: #9ca3af;
      font-style: italic;
    }
    
    /* Responsive design */
    @media (max-width: 640px) {
      body {
        padding: 20px 10px;
      }
      
      .email-container {
        border-radius: 12px;
      }
      
      .header, .content {
        padding: 24px 20px;
      }
      
      .booking-card {
        padding: 20px;
      }
      
      .header h1 {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <div class="header-icon">
        🔔
      </div>
      <h1>New Booking</h1>
      <p>You have a new meeting request</p>
    </div>
    
    <!-- Content -->
    <div class="content">
      <div class="notification-text">
        You have received a new booking request that requires your attention.
      </div>
      
      <!-- Booking Details Card -->
      <div class="booking-card">
        <!-- Attendee Information -->
        <div class="attendee-section">
          <div class="section-title">
            <span>👤</span>
            Attendee Information
          </div>
          <div class="attendee-info">
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">${data.attendeeName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">${data.attendeeEmail}</span>
            </div>
          </div>
        </div>
        
        <!-- Meeting Details -->
        <div>
          <div class="section-title">
            <span>📅</span>
            Meeting Details
          </div>
          <div class="meeting-details">
            <div class="detail-row">
              <span class="detail-icon">📋</span>
              <span class="detail-label">Event:</span>
              <span class="detail-value">${data.eventName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-icon">📅</span>
              <span class="detail-label">Date:</span>
              <span class="detail-value">${data.bookingDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-icon">🕐</span>
              <span class="detail-label">Time:</span>
              <span class="detail-value">${data.bookingTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-icon">⏱️</span>
              <span class="detail-label">Duration:</span>
              <span class="detail-value">${data.duration} minutes</span>
            </div>
          </div>
        </div>
        
        ${data.notes ? `
        <!-- Notes Section -->
        <div class="notes-section">
          <div class="section-title">
            <span>📝</span>
            Additional Notes
          </div>
          <div class="notes-content">${data.notes}</div>
        </div>
        ` : ''}
      </div>
      
      <!-- Action Section -->
      <div class="action-section">
        <div class="action-title">Next Steps</div>
        <div class="action-text">
          Log in to your booking management system to review and manage this appointment.
        </div>
      </div>
      
      <p style="font-size: 16px; color: #495057; text-align: center;">
        This booking has been automatically confirmed and the attendee has been notified.
      </p>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p>This is an automated notification email.</p>
      <p class="footer-note">Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>
  `
  
  return { subject, html }
}

// Email sending functions using Resend
export async function sendAttendeeConfirmation(data: BookingEmailData): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('RESEND_API_KEY not configured - email notifications disabled')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const { subject, html } = generateBookingConfirmationEmail(data)
    
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'bookings@yourdomain.com',
      to: [data.attendeeEmail],
      subject: subject,
      html: html,
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to send attendee confirmation email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function sendHostNotification(data: BookingEmailData, hostEmail: string): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('RESEND_API_KEY not configured - email notifications disabled')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const { subject, html } = generateBookingNotificationEmail(data)
    
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'bookings@yourdomain.com',
      to: [hostEmail],
      subject: subject,
      html: html,
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to send host notification email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}