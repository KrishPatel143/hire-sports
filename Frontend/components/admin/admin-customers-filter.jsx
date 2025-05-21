"use client"

import { useState, useEffect } from "react"
import { Search, Filter, X } from "lucide-react"
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
import { DateRangePicker } from "@/components/ui/date-range-picker"

export default function AdminCustomersFilter({ onSearch, onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState({})

  // Filter form state
  const [status, setStatus] = useState("")
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined })

  // Pass search term to parent when it changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (onSearch && searchTerm !== undefined) {
        onSearch(searchTerm)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, onSearch])

  // Pass active filters to parent when they change
  useEffect(() => {
    if (onFilterChange && Object.keys(activeFilters).length > 0) {
      const apiFilters = {}
      
      if (activeFilters.status && activeFilters.status !== 'all') {
        apiFilters.status = activeFilters.status
      }
      
      if (activeFilters.dateRange) {
        apiFilters.startDate = activeFilters.dateRange.from
        apiFilters.endDate = activeFilters.dateRange.to
      }
      
      onFilterChange(apiFilters)
    }
  }, [activeFilters, onFilterChange])

  const handleSearch = (e) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchTerm)
    }
  }

  const handleApplyFilters = () => {
    const newFilters = {}

    if (status) newFilters.status = status
    if (dateRange.from && dateRange.to) {
      newFilters.dateRange = dateRange
    }

    setActiveFilters(newFilters)
  }

  const handleClearFilters = () => {
    setStatus("")
    setDateRange({ from: undefined, to: undefined })
    setActiveFilters({})
    
    if (onFilterChange) {
      onFilterChange({})
    }
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
      case "dateRange":
        setDateRange({ from: undefined, to: undefined })
        break
    }
  }

  const getFilterLabel = (key, value) => {
    switch (key) {
      case "status":
        return `Status: ${value === "true" ? "Active" : "Inactive"}`
      case "dateRange":
        return `Joined: ${value.from.toLocaleDateString()} - ${value.to.toLocaleDateString()}`
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
              placeholder="Search by name, email, or phone..."
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
                <Label htmlFor="status">Account Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Join Date</Label>
                <DateRangePicker 
                  from={dateRange.from} 
                  to={dateRange.to} 
                  onFromChange={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                  onToChange={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                />
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

      {/* Active filters */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => (
            <Badge key={key} variant="secondary" className="flex items-center gap-1">
              {getFilterLabel(key, value)}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handleRemoveFilter(key)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove filter</span>
              </Button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleClearFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}