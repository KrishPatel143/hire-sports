import { Button } from "@/components/ui/button"
import AdminCustomersTable from "@/components/admin/admin-customers-table"
import AdminCustomersFilter from "@/components/admin/admin-customers-filter"

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">View and manage customer accounts</p>
        </div>
      </div>

      <AdminCustomersFilter />
      <AdminCustomersTable />
    </div>
  )
}

