"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { DashboardAPI } from "@/lib/api/admin"

// Import our updated components
import AdminSalesChart from "@/components/admin/admin-sales-chart"
import AdminCategoryPerformanceChart from "@/components/admin/admin-category-performance-chart"
import AdminOrderStatusChart from "@/components/admin/admin-order-status-chart"
import AdminTopProductsChart from "@/components/admin/admin-top-products-chart"

// We'll keep the traffic sources and device charts since they're not in the API response
import AdminTrafficSourcesChart from "@/components/admin/admin-traffic-sources-chart"
import AdminDeviceChart from "@/components/admin/admin-device-chart"

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30days")
  const [refreshing, setRefreshing] = useState(false)

  const handleRefreshAnalytics = async () => {
    setRefreshing(true)
    try {
      // Trigger a fresh data load from the API
      const response = await DashboardAPI.getStats()
      
      if (!response.success) {
        throw new Error(response.error || "Failed to refresh analytics data")
      }
      
      toast.success("Analytics refreshed", {
        description: "Latest data has been loaded"
      })
      
      // Force all components to reload by toggling the time range
      setTimeRange(prev => {
        const temp = prev
        setTimeRange("refreshing")
        setTimeout(() => setTimeRange(temp), 100)
        return temp
      })
    } catch (error) {
      console.error("Error refreshing analytics:", error)
      toast.error("Refresh failed", {
        description: error.message || "Could not refresh analytics data"
      })
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Insights and statistics about your store performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Tabs value={timeRange} onValueChange={setTimeRange} className="w-[400px]">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="7days">7 Days</TabsTrigger>
              <TabsTrigger value="30days">30 Days</TabsTrigger>
              <TabsTrigger value="90days">90 Days</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button 
            variant="outline" 
            onClick={handleRefreshAnalytics}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Analytics Content */}
      <Tabs value={timeRange} className="space-y-6">
        <TabsContent value="7days" className="space-y-6">
          <AnalyticsContent />
        </TabsContent>
        
        <TabsContent value="30days" className="space-y-6">
          <AnalyticsContent />
        </TabsContent>
        
        <TabsContent value="90days" className="space-y-6">
          <AnalyticsContent />
        </TabsContent>
        
        <TabsContent value="year" className="space-y-6">
          <AnalyticsContent />
        </TabsContent>
        
        <TabsContent value="refreshing" className="space-y-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Extracted analytics content to avoid duplication in tab content
function AnalyticsContent() {
  return (
    <>
      {/* Sales Chart */}
      <AdminSalesChart />

      {/* 2-column layout for Order Status and Top Products */}
      <div className="grid gap-6 md:grid-cols-2">
        <AdminOrderStatusChart />
        <AdminTopProductsChart />
      </div>

      {/* Traffic and Device Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <AdminTrafficSourcesChart />
        <AdminDeviceChart />
      </div>

      {/* Category Performance Chart */}
      <AdminCategoryPerformanceChart />
    </>
  )
}