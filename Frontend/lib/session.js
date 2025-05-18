// lib/session.js
'use server'

import { cookies } from 'next/headers'
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

// Fetch current user profile from backend
export async function getCurrentUser() {
  try {
    // Retrieve token from cookies
    const token = cookies().get('token')?.value

    // If no token is present, return null
    if (!token) {
      return null
    }

    // Fetch user profile from backend
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store' // Ensure fresh data
    })

    // Check if response is successful
    if (!response.ok) {
      // Token might be invalid or expired
      return null
    }

    const user = await response.json()

    // Return user data with role
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

// Server-side logout function
export async function logout() {
  'use server'
  
  // Clear token cookie
  cookies().delete('token')
  
  // Redirect to login page
  // Note: This should be used with redirect() from next/navigation
}