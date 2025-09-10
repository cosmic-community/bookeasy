import { cookies } from 'next/headers'

export async function isAuthenticated(): Promise<boolean> {
  const requiredAccessCode = process.env.ACCESS_CODE
  
  // If no access code is configured, consider unauthenticated for security
  if (!requiredAccessCode) {
    return false
  }

  const cookieStore = await cookies()
  const accessCodeCookie = cookieStore.get('access_code')?.value
  
  return accessCodeCookie === requiredAccessCode
}