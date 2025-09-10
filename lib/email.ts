import { Resend } from 'resend';
import { BookingEmailData } from '@/types';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Email template for booking confirmation to attendee
function generateAttendeeConfirmationHTML(data: BookingEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
          .details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #2563eb; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .detail-label { font-weight: bold; color: #4a5568; }
          .detail-value { color: #2d3748; }
          .footer { background: #718096; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
          .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✅ Booking Confirmed!</h1>
        </div>
        
        <div class="content">
          <div class="success-icon">📅</div>
          
          <p>Hi <strong>${data.attendeeName}</strong>,</p>
          
          <p>Great news! Your meeting has been successfully scheduled. Here are the details:</p>
          
          <div class="details">
            <h3 style="margin-top: 0; color: #2563eb;">Meeting Details</h3>
            
            <div class="detail-row">
              <span class="detail-label">📋 Event:</span>
              <span class="detail-value">${data.eventName}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">📅 Date:</span>
              <span class="detail-value">${data.bookingDate}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">🕒 Time:</span>
              <span class="detail-value">${data.bookingTime}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">⏱️ Duration:</span>
              <span class="detail-value">${data.duration} minutes</span>
            </div>
            
            ${data.hostName ? `
            <div class="detail-row">
              <span class="detail-label">👤 Host:</span>
              <span class="detail-value">${data.hostName}</span>
            </div>
            ` : ''}
            
            ${data.notes ? `
            <div class="detail-row">
              <span class="detail-label">📝 Notes:</span>
              <span class="detail-value">${data.notes}</span>
            </div>
            ` : ''}
          </div>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin-top: 0;">📋 What's Next?</h4>
            <ul style="color: #1e40af; margin: 0;">
              <li>Add this meeting to your calendar</li>
              <li>Prepare any questions or materials</li>
              <li>Join the meeting at the scheduled time</li>
              <li>Check your email for any updates</li>
            </ul>
          </div>
          
          <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
          
          <p>Looking forward to our meeting!</p>
        </div>
        
        <div class="footer">
          <p>This is an automated confirmation email. Please do not reply to this message.</p>
        </div>
      </body>
    </html>
  `;
}

// Email template for booking notification to host/admin
function generateHostNotificationHTML(data: BookingEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Booking Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f0fdf4; padding: 30px; border: 1px solid #bbf7d0; }
          .details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #059669; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .detail-label { font-weight: bold; color: #4a5568; }
          .detail-value { color: #2d3748; }
          .footer { background: #6b7280; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
          .notification-icon { font-size: 48px; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔔 New Booking Alert!</h1>
        </div>
        
        <div class="content">
          <div class="notification-icon">📅</div>
          
          <p><strong>You have a new booking!</strong></p>
          
          <p>A new meeting has been scheduled through your booking system. Here are the details:</p>
          
          <div class="details">
            <h3 style="margin-top: 0; color: #059669;">Booking Information</h3>
            
            <div class="detail-row">
              <span class="detail-label">👤 Attendee:</span>
              <span class="detail-value">${data.attendeeName}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">📧 Email:</span>
              <span class="detail-value">${data.attendeeEmail}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">📋 Event:</span>
              <span class="detail-value">${data.eventName}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">📅 Date:</span>
              <span class="detail-value">${data.bookingDate}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">🕒 Time:</span>
              <span class="detail-value">${data.bookingTime}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">⏱️ Duration:</span>
              <span class="detail-value">${data.duration} minutes</span>
            </div>
            
            ${data.notes ? `
            <div class="detail-row">
              <span class="detail-label">📝 Notes:</span>
              <span class="detail-value">${data.notes}</span>
            </div>
            ` : ''}
          </div>
          
          <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #166534; margin-top: 0;">⚡ Quick Actions</h4>
            <ul style="color: #166534; margin: 0;">
              <li>Add this meeting to your calendar</li>
              <li>Review attendee information and notes</li>
              <li>Prepare meeting materials if needed</li>
              <li>Set up meeting room/video link</li>
            </ul>
          </div>
          
          <p>The attendee has been sent a confirmation email with these details.</p>
        </div>
        
        <div class="footer">
          <p>This notification was sent automatically from your BookEasy system.</p>
        </div>
      </body>
    </html>
  `;
}

// Send confirmation email to attendee
export async function sendAttendeeConfirmation(emailData: BookingEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY environment variable is not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'BookEasy <noreply@yourdomain.com>',
      to: [emailData.attendeeEmail],
      subject: `✅ Booking Confirmed: ${emailData.eventName} on ${emailData.bookingDate}`,
      html: generateAttendeeConfirmationHTML(emailData),
      text: `
Hi ${emailData.attendeeName},

Your meeting has been confirmed!

Event: ${emailData.eventName}
Date: ${emailData.bookingDate}
Time: ${emailData.bookingTime}
Duration: ${emailData.duration} minutes
${emailData.hostName ? `Host: ${emailData.hostName}` : ''}
${emailData.notes ? `Notes: ${emailData.notes}` : ''}

Looking forward to our meeting!
      `.trim()
    });

    if (error) {
      console.error('Error sending attendee confirmation:', error);
      return { success: false, error: error.message };
    }

    console.log('Attendee confirmation email sent successfully:', data?.id);
    return { success: true };

  } catch (error) {
    console.error('Error sending attendee confirmation email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

// Send notification email to host/admin
export async function sendHostNotification(
  emailData: BookingEmailData, 
  hostEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY environment variable is not configured');
      return { success: false, error: 'Email service not configured' };
    }

    if (!hostEmail || !hostEmail.includes('@')) {
      console.error('Invalid host email address provided');
      return { success: false, error: 'Invalid notification email address' };
    }

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'BookEasy <noreply@yourdomain.com>',
      to: [hostEmail],
      subject: `🔔 New Booking: ${emailData.attendeeName} - ${emailData.eventName}`,
      html: generateHostNotificationHTML(emailData),
      text: `
New Booking Alert!

Attendee: ${emailData.attendeeName}
Email: ${emailData.attendeeEmail}
Event: ${emailData.eventName}
Date: ${emailData.bookingDate}
Time: ${emailData.bookingTime}
Duration: ${emailData.duration} minutes
${emailData.notes ? `Notes: ${emailData.notes}` : ''}

The attendee has been sent a confirmation email.
      `.trim()
    });

    if (error) {
      console.error('Error sending host notification:', error);
      return { success: false, error: error.message };
    }

    console.log('Host notification email sent successfully:', data?.id);
    return { success: true };

  } catch (error) {
    console.error('Error sending host notification email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send notification' 
    };
  }
}