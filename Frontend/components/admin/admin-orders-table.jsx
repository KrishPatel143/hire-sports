"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUpDown, Eye, MoreHorizontal, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"// Import API functions
import { OrderAPI } from "@/lib/api/admin"

export default function AdminOrdersTable({ orders = [], pagination = { page: 1, totalPages: 1 }, onPageChange }) {
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState("asc")
  const [localOrders, setLocalOrders] = useState([])

  // Update local state when props change
  useEffect(() => {
    setLocalOrders(orders)
  }, [orders])

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const sortedOrders = [...localOrders].sort((a, b) => {
    if (!sortColumn) return 0

    const aValue = a[sortColumn]
    const bValue = b[sortColumn]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  const handleChangeStatus = async (orderId, newStatus) => {
    try {
      const response = await OrderAPI.updateOrderStatus(orderId, { orderStatus: newStatus })
      
      if (response.success) {
        setLocalOrders(localOrders.map((order) => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ))
        
        toast.success("Order status updated", {
          description: `Order ${orderId} is now ${newStatus}`
        })
      } else {
        toast.error("Error updating order", {
          description: response.error || "Could not update order status"
        })
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Error updating order", {
        description: "An unexpected error occurred"
      })
    }
  }

  const handleChangePaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      const response = await OrderAPI.updatePaymentStatus(orderId, { paymentStatus: newPaymentStatus })
      
      if (response.success) {
        setLocalOrders(localOrders.map((order) => 
          order.id === orderId ? { ...order, paymentStatus: newPaymentStatus } : order
        ))
        
        toast.success("Payment status updated", {
          description: `Order ${orderId} payment is now ${newPaymentStatus}`
        })
      } else {
        toast.error("Error updating payment", {
          description: response.error || "Could not update payment status"
        })
      }
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast.error("Error updating payment", {
        description: "An unexpected error occurred"
      })
    }
  }

  const handlePrintInvoice = (orderId) => {
    // In a real application, this would trigger invoice printing
    toast.info("Printing invoice", {
      description: `Preparing invoice for order ${orderId}`
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            Pending
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            Processing
          </Badge>
        )
      case "shipped":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            Shipped
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Paid
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            Pending
          </Badge>
        )
      case "refunded":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Refunded
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = []
    const maxPages = Math.min(5, pagination.totalPages)
    
    let startPage = Math.max(1, pagination.page - 2)
    let endPage = Math.min(pagination.totalPages, startPage + maxPages - 1)
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={(e) => {
              e.preventDefault()
              onPageChange && onPageChange(i)
            }}
            href="#" 
            isActive={i === pagination.page}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }
    
    return items
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("id")}
                  className="flex items-center p-0 h-auto font-medium"
                >
                  Order
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("customer")}
                  className="flex items-center p-0 h-auto font-medium"
                >
                  Customer
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("date")}
                  className="flex items-center p-0 h-auto font-medium"
                >
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("total")}
                  className="flex items-center p-0 h-auto font-medium"
                >
                  Total
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.length > 0 ? (
              sortedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div>{order.customer}</div>
                    <div className="text-xs text-muted-foreground">{order.email}</div>
                  </TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                  <TableCell>${parseFloat(order.total).toFixed(2)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePrintInvoice(order.id)}>
                          <Printer className="mr-2 h-4 w-4" /> Print Invoice
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleChangeStatus(order.id, "pending")}>
                          Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeStatus(order.id, "processing")}>
                          Processing
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeStatus(order.id, "shipped")}>
                          Shipped
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeStatus(order.id, "completed")}>
                          Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeStatus(order.id, "cancelled")}>
                          Cancelled
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Change Payment</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleChangePaymentStatus(order.id, "pending")}>
                          Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangePaymentStatus(order.id, "paid")}>
                          Paid
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangePaymentStatus(order.id, "refunded")}>
                          Refunded
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  if (pagination.page > 1 && onPageChange) {
                    onPageChange(pagination.page - 1)
                  }
                }}
                className={pagination.page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {renderPaginationItems()}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  if (pagination.page < pagination.totalPages && onPageChange) {
                    onPageChange(pagination.page + 1)
                  }
                }}
                className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}