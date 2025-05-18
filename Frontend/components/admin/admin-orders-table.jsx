"use client"

import { useState } from "react"
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
} from "@/components/ui/pagination"

// Mock data for orders
const mockOrders = [
  {
    id: "ORD-7523",
    customer: "John Smith",
    email: "john.smith@example.com",
    items: [{ name: "Running Shoes XZ-400", quantity: 1, price: 129.99 }],
    status: "processing",
    date: "2024-03-15",
    total: 129.99,
    paymentStatus: "paid",
  },
  {
    id: "ORD-7522",
    customer: "Sarah Johnson",
    email: "sarah.j@example.com",
    items: [{ name: "Yoga Mat Pro", quantity: 1, price: 59.95 }],
    status: "completed",
    date: "2024-03-14",
    total: 59.95,
    paymentStatus: "paid",
  },
  {
    id: "ORD-7521",
    customer: "Michael Brown",
    email: "michael.b@example.com",
    items: [{ name: "Gym Leggings", quantity: 1, price: 45.5 }],
    status: "shipped",
    date: "2024-03-14",
    total: 45.5,
    paymentStatus: "paid",
  },
  {
    id: "ORD-7520",
    customer: "Emily Davis",
    email: "emily.d@example.com",
    items: [{ name: "Sport Water Bottle", quantity: 1, price: 24.99 }],
    status: "completed",
    date: "2024-03-13",
    total: 24.99,
    paymentStatus: "paid",
  },
  {
    id: "ORD-7519",
    customer: "David Wilson",
    email: "david.w@example.com",
    items: [{ name: "Running Jacket", quantity: 1, price: 89.99 }],
    status: "cancelled",
    date: "2024-03-12",
    total: 89.99,
    paymentStatus: "refunded",
  },
  {
    id: "ORD-7518",
    customer: "Jessica Taylor",
    email: "jessica.t@example.com",
    items: [
      { name: "Training Shorts", quantity: 2, price: 34.99 },
      { name: "Performance T-Shirt", quantity: 1, price: 29.99 },
    ],
    status: "processing",
    date: "2024-03-12",
    total: 99.97,
    paymentStatus: "paid",
  },
  {
    id: "ORD-7517",
    customer: "Robert Martinez",
    email: "robert.m@example.com",
    items: [{ name: "Fitness Tracker", quantity: 1, price: 99.99 }],
    status: "pending",
    date: "2024-03-11",
    total: 99.99,
    paymentStatus: "pending",
  },
  {
    id: "ORD-7516",
    customer: "Jennifer Garcia",
    email: "jennifer.g@example.com",
    items: [
      { name: "Yoga Block Set", quantity: 1, price: 24.99 },
      { name: "Resistance Bands", quantity: 1, price: 19.99 },
    ],
    status: "shipped",
    date: "2024-03-10",
    total: 44.98,
    paymentStatus: "paid",
  },
  {
    id: "ORD-7515",
    customer: "Thomas Anderson",
    email: "thomas.a@example.com",
    items: [{ name: "Compression Socks", quantity: 3, price: 14.99 }],
    status: "completed",
    date: "2024-03-09",
    total: 44.97,
    paymentStatus: "paid",
  },
  {
    id: "ORD-7514",
    customer: "Lisa Rodriguez",
    email: "lisa.r@example.com",
    items: [{ name: "Sports Bra", quantity: 2, price: 39.99 }],
    status: "completed",
    date: "2024-03-08",
    total: 79.98,
    paymentStatus: "paid",
  },
]

export default function AdminOrdersTable() {
  const [orders, setOrders] = useState(mockOrders)
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState("asc")

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const sortedOrders = [...orders].sort((a, b) => {
    if (!sortColumn) return 0

    const aValue = a[sortColumn ]
    const bValue = b[sortColumn ]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  const handleChangeStatus = (orderId, newStatus) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))

    toast({
      title: "Order status updated",
      description: `Order ${orderId} is now ${newStatus}`,
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
            {sortedOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>
                  <div>{order.customer}</div>
                  <div className="text-xs text-muted-foreground">{order.email}</div>
                </TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
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
                      <DropdownMenuItem>
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

