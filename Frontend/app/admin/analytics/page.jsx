import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminSalesChart from "@/components/admin/admin-sales-chart"
import AdminTrafficSourcesChart from "@/components/admin/admin-traffic-sources-chart"
import AdminCategoryPerformanceChart from "@/components/admin/admin-category-performance-chart"
import AdminDeviceChart from "@/components/admin/admin-device-chart"

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">Insights and statistics about your store performance</p>
        </div>
        <Tabs defaultValue="30days">
          <TabsList>
            <TabsTrigger value="7days">7 Days</TabsTrigger>
            <TabsTrigger value="30days">30 Days</TabsTrigger>
            <TabsTrigger value="90days">90 Days</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>View your sales performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <AdminSalesChart />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Where your visitors are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <AdminTrafficSourcesChart />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>What devices your customers are using</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <AdminDeviceChart />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Sales by product category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <AdminCategoryPerformanceChart />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

