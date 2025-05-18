"use client"

import Link from "next/link"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const recentOrders = [
  {
    id: "ORD-7523",
    customer: "John Smith",
    product: "Running Shoes XZ-400",
    status: "processing",
    date: "2024-03-15",
    total: 129.99,
  },
  {
    id: "ORD-7522",
    customer: "Sarah Johnson",
    product: "Yoga Mat Pro",
    status: "completed",
    date: "2024-03-14",
    total: 59.95,
  },
  {
    id: "ORD-7521",
    customer: "Michael Brown",
    product: "Gym Leggings",
    status: "shipped",
    date: "2024-03-14",
    total: 45.5,
  },
  {
    id: "ORD-7520",
    customer: "Emily Davis",
    product: "Sport Water Bottle",
    status: "completed",
    date: "2024-03-13",
    total: 24.99,
  },
  {
    id: "ORD-7519",
    customer: "David Wilson",
    product: "Running Jacket",
    status: "cancelled",
    date: "2024-03-12",
    total: 89.99,
  },
]

export default function AdminRecentOrders() {

  const [orders, setOrders] = useState(recentOrders)

  const getStatusColor = (status) => {
    switch (status) {
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "shipped":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const handleChangeStatus = (orderId, newStatus) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))

  }

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                <div>{order.id}</div>
                <div className="text-xs text-muted-foreground">{order.date}</div>
              </TableCell>
              <TableCell>
                <div>{order.customer}</div>
                <div className="text-xs text-muted-foreground">{order.product}</div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
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
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" /> View details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleChangeStatus(order.id, "processing")}>
                      Processing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleChangeStatus(order.id, "shipped")}>Shipped</DropdownMenuItem>
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
      <div className="mt-4 flex justify-center">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/orders">View All Orders</Link>
        </Button>
      </div>
    </div>
  )
}

