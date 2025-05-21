"use client"

import { useEffect, useState } from "react"
import { DashboardAPI } from "@/lib/api/admin"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { 
  ShoppingCart, 
  DollarSign, 
  Package, 
  Users,
  TrendingUp,
  TrendingDown
} from "lucide-react"

const formatCurrency = (value) => {
  return `$${value.toLocaleString()}`
}

export default function DashboardStatsGrid() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    orders: {
      total: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0
    },
    revenue: {
      total: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      lastMonth: 0,
      growth: 0
    },
    products: {
      total: 0,
      active: 0,
      inactive: 0,
      outOfStock: 0,
      lowStock: 0
    },
    users: {
      total: 0,
      newToday: 0,
      newThisMonth: 0
    }
  })
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard data
      const response = await DashboardAPI.getStats()
      
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch dashboard data")
      }
      
      setStats(response.stats)
    } catch (err) {
      console.error("Error fetching dashboard stats:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast.error("Error", { description: "Failed to load dashboard statistics" })
    } finally {
      setLoading(false)
    }
  }

  // Show loading state
  if (loading && stats.orders.total === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between space-y-2">
                <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-7 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </Card>
        ))}
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg mb-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button onClick={fetchDashboardStats} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Calculate revenue growth percentage
  const revenueGrowth = stats.revenue.growth || (
    stats.revenue.lastMonth > 0 
      ? ((stats.revenue.thisMonth - stats.revenue.lastMonth) / stats.revenue.lastMonth) * 100 
      : stats.revenue.thisMonth > 0 ? 100 : 0
  )

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Revenue Card */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-2">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1 text-right">
              <p className="text-sm font-medium text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.revenue.total)}</p>
              <div className="flex items-center justify-end gap-1">
                {revenueGrowth >= 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-500">+{revenueGrowth.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-red-500">{revenueGrowth.toFixed(1)}%</span>
                  </>
                )}
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </div>
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
      </Card>

      {/* Orders Card */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-2">
            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-1 text-right">
              <p className="text-sm font-medium text-muted-foreground">Orders</p>
              <p className="text-2xl font-bold">{stats.orders.total}</p>
              <div className="flex justify-end">
                <p className="text-xs text-muted-foreground">
                  {stats.orders.thisMonth} this month
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
      </Card>

      {/* Products Card */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-2">
            <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-1 text-right">
              <p className="text-sm font-medium text-muted-foreground">Products</p>
              <p className="text-2xl font-bold">{stats.products.total}</p>
              <div className="flex justify-end">
                <p className="text-xs text-muted-foreground">
                  {stats.products.active} active / {stats.products.lowStock} low stock
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500" />
      </Card>

      {/* Customers Card */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-2">
            <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="space-y-1 text-right">
              <p className="text-sm font-medium text-muted-foreground">Customers</p>
              <p className="text-2xl font-bold">{stats.users.total}</p>
              <div className="flex justify-end">
                <p className="text-xs text-muted-foreground">
                  {stats.users.newThisMonth} new this month
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500" />
      </Card>
    </div>
  )
}