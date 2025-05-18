import { Button } from "@/components/ui/button"
import AdminOrdersTable from "@/components/admin/admin-orders-table"
import AdminOrdersFilter from "@/components/admin/admin-orders-filter"

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">View and manage customer orders</p>
        </div>
        <Button variant="outline">Export Orders</Button>
      </div>

      <AdminOrdersFilter />
      <AdminOrdersTable />
    </div>
  )
}

