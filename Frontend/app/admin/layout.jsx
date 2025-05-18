'use client'

import React from "react"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { getCurrentUser } from "@/lib/session"
import { toast } from "sonner"

export default function AdminLayout({
  children,
}) {
  const [user, setUser] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const checkUser = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          redirect("/login")
          return
        }

        const response = await fetch(`http://localhost:8000/auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          // Token is invalid or expired
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          toast.error("Session Expired", {
            description: "Please log in again."
          })
          redirect("/login")
          return
        }

        const userData = await response.json()

        // Check if user has admin role
        if (userData.role !== 'admin' && userData.role !== 'superadmin') {
          toast.error("Unauthorized Access", {
            description: "You do not have admin privileges."
          })
          redirect("/login")
          return
        }

        setUser(userData)
      } catch (error) {
        console.error('Error checking user:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        redirect("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()
  }, [])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If no user, redirect happens in useEffect
  if (!user) return null

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AdminSidebar user={user} />
        <div className="flex-1">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}