"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardAPI } from "@/lib/api/admin"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

const formatCurrency = (value) => {
  return `$${value.toLocaleString()}`
}

export default function AdminTopProductsChart() {
  const router = useRouter()
  // Client-side rendering workaround for Recharts/Next.js
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [topProducts, setTopProducts] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    setMounted(true)
    fetchTopProducts()
  }, [])

  const fetchTopProducts = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard data
      const response = await DashboardAPI.getStats()
      
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch dashboard data")
      }
      
      const { topProducts } = response.stats
      
      // Process top products data
      if (topProducts && topProducts.length > 0) {
        // Transform the product data for the chart
        const processedData = topProducts.map(product => ({
          id: product._id,
          name: product.productName || "Unknown Product",
          sales: product.totalSold || 0,
          revenue: product.totalRevenue || 0
        }))
        
        setTopProducts(processedData)
      } else {
        setTopProducts([])
      }
    } catch (err) {
      console.error("Error fetching top products:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast.error("Error", { description: "Failed to load top products data" })
    } finally {
      setLoading(false)
    }
  }

  // Render placeholder while SSR or loading
  if (!mounted || (loading && topProducts.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Best performing products by revenue</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="mt-4 text-sm text-muted-foreground">Loading product data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If there's an error and no data
  if (error && topProducts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Best performing products by revenue</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] flex flex-col items-center justify-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchTopProducts}>
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  // If no products found
  if (!loading && topProducts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Best performing products by revenue</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] flex flex-col items-center justify-center">
          <p className="text-muted-foreground mb-4">No sales data available yet</p>
          <Button onClick={fetchTopProducts}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Best performing products by revenue</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchTopProducts}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topProducts}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" domain={[0, 'dataMax']} tickFormatter={formatCurrency} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={120}
                tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
              />
              <Tooltip
                formatter={(value, name) => {
                  return name === "revenue" 
                    ? [formatCurrency(value), "Revenue"] 
                    : [value, "Units Sold"]
                }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.5rem',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Bar 
                dataKey="revenue" 
                fill="hsl(var(--primary))" 
                name="Revenue"
                radius={[0, 4, 4, 0]}
                onClick={(data) => {
                  // Navigate to product detail on click
                  router.push(`/admin/products/${data.id}`)
                }}
                style={{ cursor: 'pointer' }}
              >
                <LabelList 
                  dataKey="sales" 
                  position="right" 
                  formatter={(value) => `${value} sold`}
                  style={{ fill: 'hsl(var(--muted-foreground))' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}