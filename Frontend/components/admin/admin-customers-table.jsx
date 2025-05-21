"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUpDown, Eye, MoreHorizontal, UserCog, Mail, Ban, CheckCircle } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { UserAPI } from "@/lib/api/admin"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AdminCustomersTable({ filterParams = {}, onPageChange }) {
  const [customers, setCustomers] = useState([])
  const [sortColumn, setSortColumn] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: filterParams.page || 1,
    totalPages: 1,
    totalItems: 0
  })
  const [selectedUser, setSelectedUser] = useState(null)
  const [showStatusDialog, setShowStatusDialog] = useState(false)

  // Fetch customers from the API
  useEffect(() => {
    fetchCustomers()
  }, [
    filterParams.page,
    filterParams.status,
    filterParams.searchTerm,
    filterParams.startDate,
    filterParams.endDate,
    sortColumn, 
    sortDirection
  ])

  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      
      const params = {
        page: filterParams.page || pagination.page,
        limit: filterParams.limit || 10,
        sortBy: `${sortColumn}:${sortDirection}`,
        status: filterParams.status || '',
        search: filterParams.searchTerm || '',
        startDate: filterParams.startDate || '',
        endDate: filterParams.endDate || ''
      }
      
      const response = await UserAPI.getAllUsers(params)
      
      if (response.success) {
        setCustomers(response.users || [])
        setPagination({
          page: response.currentPage || 1,
          totalPages: response.totalPages || 1,
          totalItems: response.totalUsers || 0
        })
      } else {
        setError(response.error || 'Failed to fetch customers')
        toast.error('Error', { description: 'Failed to load customers' })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      toast.error('Error', { description: 'Failed to load customers' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleToggleStatus = async () => {
    if (!selectedUser) return
    
    try {
      const response = await UserAPI.toggleUserStatus(selectedUser._id)
      
      if (response.success) {
        // Update the user in the local state
        setCustomers(customers.map(user =>
          user._id === selectedUser._id
            ? { ...user, isActive: !user.isActive }
            : user
        ))
        
        toast.success('Success', { 
          description: `User status has been ${selectedUser.isActive ? 'deactivated' : 'activated'}`
        })
      } else {
        toast.error('Error', { description: response.error || 'Failed to update user status' })
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
      toast.error('Error', { description: 'An unexpected error occurred' })
    } finally {
      setSelectedUser(null)
      setShowStatusDialog(false)
    }
  }

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
        Inactive
      </Badge>
    )
  }

  // Generate avatar fallback
  const getAvatarFallback = (name) => {
    if (!name) return "??"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
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
              if (onPageChange) {
                onPageChange(i)
              } else {
                setPagination(prev => ({ ...prev, page: i }))
              }
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading && customers.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error && customers.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <div className="text-center text-red-500 mb-4">{error}</div>
        <Button onClick={fetchCustomers}>Try Again</Button>
      </div>
    )
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
                  onClick={() => handleSort("name")}
                  className="flex items-center p-0 h-auto font-medium"
                >
                  Customer
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("orderCount")}
                  className="flex items-center p-0 h-auto font-medium"
                >
                  Orders
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("totalSpent")}
                  className="flex items-center p-0 h-auto font-medium"
                >
                  Total Spent
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("createdAt")}
                  className="flex items-center p-0 h-auto font-medium"
                >
                  Join Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length > 0 ? (
              customers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage 
                          src={customer.avatar || `/api/placeholder/40/40?text=${getAvatarFallback(customer.name)}`} 
                          alt={customer.name} 
                        />
                        <AvatarFallback>
                          {getAvatarFallback(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-xs text-muted-foreground">{customer.email}</div>
                        {getStatusBadge(customer.isActive)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{customer.orderCount || 0}</TableCell>
                  <TableCell>${customer.totalSpent?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell>{formatDate(customer.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/customers/${customer._id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View Profile
                          </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/customers/${customer._id}/edit`}>
                            <UserCog className="mr-2 h-4 w-4" /> Edit Customer
                          </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(customer)
                            setShowStatusDialog(true)
                          }}
                        >
                          {customer.isActive ? (
                            <>
                              <Ban className="mr-2 h-4 w-4 text-red-500" /> Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Activate
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No customers found
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
                  if (pagination.page > 1) {
                    if (onPageChange) {
                      onPageChange(pagination.page - 1)
                    } else {
                      setPagination(prev => ({ ...prev, page: prev.page - 1 }))
                    }
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
                  if (pagination.page < pagination.totalPages) {
                    if (onPageChange) {
                      onPageChange(pagination.page + 1)
                    } else {
                      setPagination(prev => ({ ...prev, page: prev.page + 1 }))
                    }
                  }
                }}
                className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Confirmation Dialog for Status Toggle */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.isActive 
                ? "Deactivate User Account" 
                : "Activate User Account"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.isActive 
                ? "Are you sure you want to deactivate this user account? They will no longer be able to log in or place orders."
                : "Are you sure you want to activate this user account? They will be able to log in and place orders."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleToggleStatus}
              className={selectedUser?.isActive ? "bg-red-500 hover:bg-red-600" : ""}
            >
              {selectedUser?.isActive ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}