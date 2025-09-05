'use client'

import { useState } from 'react'
import { Settings } from '@/types'

interface SettingsFormProps {
  settings: Settings | null
}

export default function SettingsForm({ settings }: SettingsFormProps) {
  const [formData, setFormData] = useState({
    site_name: settings?.metadata?.site_name || 'BookEasy',
    buffer_time: settings?.metadata?.buffer_time || 15,
    email_notifications: settings?.metadata?.email_notifications ?? true,
    // New availability settings
    default_start_time: '09:00',
    default_end_time: '17:00',
    default_available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    timezone: 'Eastern Time (EST)',
    booking_window_days: 30,
    minimum_notice_hours: 24
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ]

  const timezones = [
    { key: 'EST', value: 'Eastern Time (EST)' },
    { key: 'CST', value: 'Central Time (CST)' },
    { key: 'MST', value: 'Mountain Time (MST)' },
    { key: 'PST', value: 'Pacific Time (PST)' }
  ]

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      default_available_days: prev.default_available_days.includes(day)
        ? prev.default_available_days.filter(d => d !== day)
        : [...prev.default_available_days, day]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update settings')
      }

      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 3000)
    } catch (error) {
      console.error('Error updating settings:', error)
      setError(error instanceof Error ? error.message : 'Failed to update settings. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* General Settings Card */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            🏢 General Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="site_name" className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                id="site_name"
                className="input"
                value={formData.site_name}
                onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="buffer_time" className="block text-sm font-medium text-gray-700 mb-2">
                Buffer Time (minutes)
              </label>
              <select
                id="buffer_time"
                className="select"
                value={formData.buffer_time}
                onChange={(e) => setFormData({ ...formData, buffer_time: Number(e.target.value) })}
              >
                <option value={0}>No buffer</option>
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Time between bookings to prevent back-to-back meetings
              </p>
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary focus:ring-primary"
                checked={formData.email_notifications}
                onChange={(e) => setFormData({ ...formData, email_notifications: e.target.checked })}
              />
              <span className="ml-2 text-sm text-gray-700">
                Send email notifications for new bookings
              </span>
            </label>
          </div>
        </div>

        {/* Default Availability Settings Card */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            📅 Default Availability
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="default_start_time" className="block text-sm font-medium text-gray-700 mb-2">
                Default Start Time
              </label>
              <input
                type="time"
                id="default_start_time"
                className="input"
                value={formData.default_start_time}
                onChange={(e) => setFormData({ ...formData, default_start_time: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="default_end_time" className="block text-sm font-medium text-gray-700 mb-2">
                Default End Time
              </label>
              <input
                type="time"
                id="default_end_time"
                className="input"
                value={formData.default_end_time}
                onChange={(e) => setFormData({ ...formData, default_end_time: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Default Available Days
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {daysOfWeek.map((day) => (
                <label key={day} className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    checked={formData.default_available_days.includes(day)}
                    onChange={() => handleDayToggle(day)}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {day.slice(0, 3)}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              These will be the default available days for new event types
            </p>
          </div>

          <div className="mt-6">
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              id="timezone"
              className="select"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            >
              {timezones.map((tz) => (
                <option key={tz.key} value={tz.value}>
                  {tz.value}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Booking Rules Card */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            📋 Booking Rules
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="booking_window_days" className="block text-sm font-medium text-gray-700 mb-2">
                Booking Window (days)
              </label>
              <select
                id="booking_window_days"
                className="select"
                value={formData.booking_window_days}
                onChange={(e) => setFormData({ ...formData, booking_window_days: Number(e.target.value) })}
              >
                <option value={7}>1 week</option>
                <option value={14}>2 weeks</option>
                <option value={30}>1 month</option>
                <option value={60}>2 months</option>
                <option value={90}>3 months</option>
                <option value={180}>6 months</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                How far in advance people can book
              </p>
            </div>

            <div>
              <label htmlFor="minimum_notice_hours" className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Notice (hours)
              </label>
              <select
                id="minimum_notice_hours"
                className="select"
                value={formData.minimum_notice_hours}
                onChange={(e) => setFormData({ ...formData, minimum_notice_hours: Number(e.target.value) })}
              >
                <option value={1}>1 hour</option>
                <option value={4}>4 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>24 hours</option>
                <option value={48}>48 hours</option>
                <option value={72}>72 hours</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Minimum time before a meeting can be booked
              </p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800 font-medium">Settings updated successfully!</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-8"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}