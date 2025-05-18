"use client"

import  React from "react"

import { useState } from "react"
import { Search, Filter, X, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"

export default function AdminCustomersFilter() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState()

  // Filter form state
  const [status, setStatus] = useState ("")
  const [orderCount, setOrderCount] = useState ("")
  const [joinDateFrom, setJoinDateFrom] = useState(undefined)
  const [joinDateTo, setJoinDateTo] = useState(undefined)

  const handleSearch = (e) => {
    e.preventDefault()
    console.log("Searching for:", searchTerm)
    // In a real app, this would trigger a search
  }

  const handleApplyFilters = () => {
    const newFilters = {}

    if (status) newFilters.status = status
    if (orderCount) newFilters.orderCount = orderCount
    if (joinDateFrom && joinDateTo) {
      newFilters.joinDate = { from: joinDateFrom, to: joinDateTo }
    }

    setActiveFilters(newFilters)
  }

  const handleClearFilters = () => {
    setStatus("")
    setOrderCount("")
    setJoinDateFrom(undefined)
    setJoinDateTo(undefined)
    setActiveFilters({})
  }

  const handleRemoveFilter = (key) => {
    const newFilters = { ...activeFilters }
    delete newFilters[key]
    setActiveFilters(newFilters)

    // Reset the corresponding form state
    switch (key) {
      case "status":
        setStatus("")
        break
      case "orderCount":
        setOrderCount("")
        break
      case "joinDate":
        setJoinDateFrom(undefined)
        setJoinDateTo(undefined)
        break
    }
  }

  const getFilterLabel = (key, value) => {
    switch (key) {
      case "status":
        return `Status: ${value}`
      case "orderCount":
        return `Orders: ${value}`
      case "joinDate":
        return `Join Date: ${format(value.from, "MMM d, yyyy")} - ${format(value.to, "MMM d, yyyy")}`
      default:
        return ""
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers by name or email..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Customers</SheetTitle>
              <SheetDescription>Narrow down customers by applying filters</SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="status">Customer Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderCount">Order Count</Label>
                <Select value={orderCount} onValueChange={setOrderCount}>
                  <SelectTrigger id="orderCount">
                    <SelectValue placeholder="Select order count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="0">No orders</SelectItem>
                    <SelectItem value="1-3">1-3 orders</SelectItem>
                    <SelectItem value="4-10">4-10 orders</SelectItem>
                    <SelectItem value="10+">10+ orders</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Join Date Range</Label>
                <div className="flex flex-col gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {joinDateFrom ? format(joinDateFrom, "PPP") : "From date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={joinDateFrom}
                        onSelect={setJoinDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {joinDateTo ? format(joinDateTo, "PPP") : "To date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent mode="single" selected={joinDateTo} onSelect={setJoinDateTo} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline" onClick={handleClearFilters}>
                  Reset
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button onClick={handleApplyFilters}>Apply Filters</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

    </div>
  )
}

