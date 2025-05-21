"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardAPI } from "@/lib/api/admin"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { RefreshCw, ShoppingBag, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

const formatCurrency = (value) => {
  return `$${value.toLocaleString()}`
}

export default function RecentOrdersCard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({ total: 0 })

  useEffect(() => {
    fetchRecentOrders()
  }, [])

  const fetchRecentOrders = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard data for recent orders
      const response = await DashboardAPI.getStats()
      
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch dashboard data")
      }
      
      const { orders, latestOrders } = response.stats
      
      // Set overall order stats
      setStats({ total: orders?.total || 0 })
      
      // Format recent orders for display
      if (latestOrders && latestOrders.length > 0) {
        const processedOrders = latestOrders.map(order => ({
          id: order._id,
          customer: order.shippingAddress?.fullName || 'Guest Customer',
          status: order.orderStatus,
          paymentStatus: order.paymentStatus,
          total: order.totalPrice || 0,
          date: new Date(order.createdAt),
          items: order.orderItems?.length || 0
        }))
        
        setOrders(processedOrders)
      } else {
        setOrders([])
      }
    } catch (err) {
      console.error("Error fetching recent orders:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast.error("Error", { description: "Failed to load recent orders" })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      refunded: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300",
    }

    return (
      <Badge variant="outline" className={statusStyles[status] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatDate = (date) => {
    if (!date) return "N/A"
    
    // Get time difference in days
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return "Today"
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString("en-US", { month: 'short', day: 'numeric' })
    }
  }

  // Show loading state
  if (loading && orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest customer purchases</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="mt-4 text-sm text-muted-foreground">Loading recent orders...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show error state
  if (error && orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest customer purchases</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] flex flex-col items-center justify-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchRecentOrders}>
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Show empty state
  if (!loading && orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest customer purchases</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] flex flex-col items-center justify-center">
          <div className="flex flex-col items-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest customer purchases</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/admin/orders')}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">
                    {order.customer}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {order.items} {order.items === 1 ? 'item' : 'items'} • {formatDate(order.date)}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="font-medium">{formatCurrency(order.total)}</div>
                <div className="flex gap-2">
                  {getStatusBadge(order.status)}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5"
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                  >
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="text-sm text-muted-foreground">
          Total of {stats.total} {stats.total === 1 ? 'order' : 'orders'}
        </div>
      </CardFooter>
    </Card>
  )
}