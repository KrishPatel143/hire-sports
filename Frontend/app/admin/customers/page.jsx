"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import AdminCustomersTable from "@/components/admin/admin-customers-table"
import AdminCustomersFilter from "@/components/admin/admin-customers-filter"
import { UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminCustomersPage() {
  const router = useRouter()
  const [filterParams, setFilterParams] = useState({
    page: 1,
    limit: 10,
    status: '',
    searchTerm: '',
    startDate: '',
    endDate: ''
  })

  const handleSearch = (searchTerm) => {
    if (searchTerm !== filterParams.searchTerm) {
      setFilterParams(prev => ({
        ...prev,
        searchTerm,
        page: 1, // Reset to first page on new search
      }))
    }
  }

  const handleFilterChange = (filters) => {
    const hasChanges = Object.keys(filters).some(key => 
      filters[key] !== filterParams[key]
    );
    
    if (hasChanges) {
      const updatedFilters = {
        ...filterParams,
        ...filters,
        page: 1, // Reset to first page on filter change
      }
      
      // Transform date objects to ISO strings if needed
      if (filters.startDate && filters.startDate instanceof Date) {
        updatedFilters.startDate = filters.startDate.toISOString().split('T')[0]
      }
      
      if (filters.endDate && filters.endDate instanceof Date) {
        updatedFilters.endDate = filters.endDate.toISOString().split('T')[0]
      }
      
      setFilterParams(updatedFilters)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">
            View and manage customer accounts
          </p>
        </div>
        <Button onClick={() => router.push('/admin/customers/create')}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <AdminCustomersFilter 
        onSearch={handleSearch} 
        onFilterChange={handleFilterChange} 
      />
      
      <AdminCustomersTable 
        filterParams={filterParams}
        onPageChange={(page) => setFilterParams(prev => ({ ...prev, page }))}
      />
    </div>
  )
}