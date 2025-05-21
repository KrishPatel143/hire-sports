"use client"

import { useEffect, useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardAPI } from "@/lib/api/admin"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

const formatCurrency = (value) => {
  return `$${value.toLocaleString()}`
}

// Function to generate last 12 months of data based on total revenue
function generateMonthlyData(totalRevenue, thisMonth) {
  const currentDate = new Date()
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const result = []
  
  // Get current month index
  const currentMonthIndex = currentDate.getMonth()
  
  // Distribute the total revenue across months with a slight upward trend
  // This is simulated data - in a real app, you'd use actual monthly data from API
  let remainingRevenue = totalRevenue
  const baseOrderCount = Math.floor(totalRevenue / 100) // Roughly 1 order per $100
  
  // Loop through the last 12 months
  for (let i = 11; i >= 0; i--) {
    const monthIndex = (currentMonthIndex - i + 12) % 12
    const monthName = monthNames[monthIndex]
    
    // For the most recent month, use the actual "thisMonth" value
    if (i === 0) {
      result.push({
        name: monthName,
        sales: thisMonth,
        orders: Math.max(Math.floor(thisMonth / 100), 1)
      })
      continue
    }
    
    // Create randomized historical data
    const monthlySales = i === 0 
      ? thisMonth 
      : Math.max(totalRevenue * (0.05 + Math.random() * 0.1 * (12 - i) / 12), 0)
      
    remainingRevenue -= monthlySales
    
    result.push({
      name: monthName,
      sales: Math.round(monthlySales * 100) / 100,
      orders: Math.max(Math.floor(monthlySales / 100), 1)
    })
  }
  
  return result
}

export default function AdminSalesChart() {
  // Client-side rendering workaround for Recharts/Next.js
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [salesData, setSalesData] = useState([])
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    growth: 0
  })

  useEffect(() => {
    setMounted(true)
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await DashboardAPI.getStats()
      
      if (response.success) {
        const { revenue } = response.stats
        
        setStats({
          total: revenue.total || 0,
          thisMonth: revenue.thisMonth || 0,
          lastMonth: revenue.lastMonth || 0,
          growth: revenue.growth || 0
        })
        
        // Generate monthly data based on the total revenue
        const monthlyData = generateMonthlyData(revenue.total, revenue.thisMonth)
        setSalesData(monthlyData)
      } else {
        throw new Error(response.error || "Failed to fetch dashboard data")
      }
    } catch (err) {
      console.error("Error fetching sales data:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast.error("Error", { description: "Failed to load sales data" })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  if (loading && salesData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>View your sales performance over time</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[350px] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="mt-4 text-sm text-muted-foreground">Loading sales data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && salesData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>View your sales performance over time</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[350px] flex flex-col items-center justify-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>
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
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>
            Total Revenue: {formatCurrency(stats.total)} | This Month: {formatCurrency(stats.thisMonth)}
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchDashboardData}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={salesData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" tickFormatter={formatCurrency} />
              <Tooltip
                formatter={(value, name) => {
                  return name === "sales" ? [formatCurrency(value), "Sales"] : [value, "Orders"]
                }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.5rem',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <ReferenceLine
                y={stats.lastMonth}
                label="Last Month"
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
              />
              <Area
                type="monotone"
                dataKey="sales"
                name="Sales"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
                activeDot={{ r: 6 }}
              />
              <Area
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="hsl(var(--secondary))"
                fill="hsl(var(--secondary))"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}