"use client"

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardAPI } from "@/lib/api/admin"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

// Define colors for different order statuses
const STATUS_COLORS = {
  pending: "#fbbf24", // amber
  processing: "#3b82f6", // blue
  shipped: "#10b981", // emerald
  completed: "#22c55e", // green
  cancelled: "#ef4444", // red
  refunded: "#f43f5e", // rose
}

export default function AdminOrderStatusChart() {
  // Client-side rendering workaround for Recharts/Next.js
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [statusData, setStatusData] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    setMounted(true)
    fetchStatusData()
  }, [])

  const fetchStatusData = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard data
      const response = await DashboardAPI.getStats()
      
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch dashboard data")
      }
      
      const { orders } = response.stats
      
      // Process order status data
      if (orders && orders.byStatus && orders.byStatus.length > 0) {
        // Transform the order status data for the chart
        const processedData = orders.byStatus.map(status => ({
          name: status._id.charAt(0).toUpperCase() + status._id.slice(1), // Capitalize status
          value: status.count,
          color: STATUS_COLORS[status._id] || "#6b7280" // Default to gray if no color defined
        }))
        
        setStatusData(processedData)
      } else {
        // If no status data available, create a placeholder
        setStatusData([
          { name: "No Orders", value: 100, color: "#6b7280" }
        ])
      }
    } catch (err) {
      console.error("Error fetching order status data:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast.error("Error", { description: "Failed to load order status data" })
    } finally {
      setLoading(false)
    }
  }

  // Render placeholder while SSR or loading
  if (!mounted || (loading && statusData.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
          <CardDescription>Distribution of orders by status</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="mt-4 text-sm text-muted-foreground">Loading order data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If there's an error and no data
  if (error && statusData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
          <CardDescription>Distribution of orders by status</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] flex flex-col items-center justify-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchStatusData}>
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Order Status</CardTitle>
          <CardDescription>Distribution of orders by status</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchStatusData}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value, percent }) => value > 0 ? `${name}: ${value} (${(percent * 100).toFixed(0)}%)` : ''}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [value, "Orders"]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.5rem',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}