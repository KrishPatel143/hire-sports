'use client'

import React from "react"
import { redirect } from "next/navigation"
import { toast } from "sonner"
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  BarChart, 
  Package, 
  Shield
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

// Admin navigation items
const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart },
];

// Utility function to conditionally join classNames
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

export default function AdminLayout({
  children,
}) {
  const [user, setUser] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isOpen, setIsOpen] = React.useState(false) // For mobile menu
  const pathname = usePathname()

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
    <div className="flex flex-col min-h-screen">


      {/* Main Content Area */}
      <div className="flex-1">
        <div className="container mx-auto py-6 px-4">
          {children}
        </div>
      </div>
    </div>
  )
}