"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import AdminOrdersTable from "@/components/admin/admin-orders-table"
import AdminOrdersFilter from "@/components/admin/admin-orders-filter"
import { getAllOrders } from "@/lib/api/order"  // Assuming this is the correct path
import { toast } from "sonner"

// Function to map API order to component format
function mapApiOrderToComponentOrder(apiOrder) {
  // Extract customer name and email from shipping address
  const customerName = apiOrder.shippingAddress?.fullName || 'Guest Customer';
  const phoneNumber = apiOrder.shippingAddress?.phoneNumber || '';
  
  // Calculate total from all items or use totalPrice
  const total = apiOrder.totalPrice || 0;
  
  // Format date from createdAt
  const createdAt = new Date(apiOrder.createdAt);
  const formattedDate = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}`;
  
  return {
    id: apiOrder._id,
    customer: customerName,
    email: `Phone: ${phoneNumber}`, // Using phone as we don't have email
    items: apiOrder.orderItems,
    status: apiOrder.orderStatus,
    date: formattedDate,
    total: total,
    paymentStatus: apiOrder.paymentStatus,
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterParams, setFilterParams] = useState({
    page: 1,
    limit: 10,
    status: '',
    paymentStatus: '',
    startDate: '',
    endDate: '',
    searchTerm: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0
  })

  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterParams.page, filterParams.status, filterParams.paymentStatus, filterParams.startDate, filterParams.endDate])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      console.log("Fetching orders with params:", filterParams)
      
      // Convert dates to the format expected by the API
      const apiParams = { ...filterParams }
      if (filterParams.startDate) {
        apiParams.startDate = new Date(filterParams.startDate).toISOString().split('T')[0]
      }
      if (filterParams.endDate) {
        apiParams.endDate = new Date(filterParams.endDate).toISOString().split('T')[0]
      }

      const response = await getAllOrders(apiParams)
      
      if (response.success) {
        // Map the API response to our component format
        const mappedOrders = response.orders.map(order => mapApiOrderToComponentOrder(order));
        
        setOrders(mappedOrders)
        setPagination({
          page: response.currentPage || 1,
          totalPages: response.totalPages || 1,
          totalItems: response.totalOrders || 0
        })
      } else {
        toast.error("Error fetching orders", {
          description: response.error || "Could not load orders"
        })
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Error fetching orders", {
        description: "An unexpected error occurred"
      })
    } finally {
      setLoading(false)
    }
  }

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
      setFilterParams(prev => ({
        ...prev,
        ...filters,
        page: 1, // Reset to first page on filter change
      }))
    }
  }

  const handlePageChange = (page) => {
    setFilterParams(prev => ({
      ...prev,
      page,
    }))
  }

  const handleExportOrders = () => {
    // In a real application, this would trigger an API call to export orders
    toast.success("Export started", {
      description: "Your orders export has been initiated and will be available shortly."
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">
            View and manage customer orders 
            {pagination.totalItems > 0 && ` (${pagination.totalItems} total)`}
          </p>
        </div>
        <Button variant="outline" onClick={handleExportOrders}>Export Orders</Button>
      </div>
      
      <AdminOrdersFilter 
        onSearch={handleSearch} 
        onFilterChange={handleFilterChange} 
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <AdminOrdersTable 
          orders={orders} 
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}