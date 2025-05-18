"use client";

import React, { useEffect } from "react";
import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

export default function AdminProductsFilter({ filters, onApplyFilters }) {
  // Local state for the form
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [category, setCategory] = useState(filters.category || "all"); // Changed from "" to "all"
  const [status, setStatus] = useState(filters.status || "all"); // Changed from "" to "all"
  const [priceRange, setPriceRange] = useState(filters.priceRange || [0, 500]);
  const [stock, setStock] = useState(filters.stock || "all"); // Changed from "" to "all"
  const [activeFilters, setActiveFilters] = useState({});

  // Initialize active filters from props
  useEffect(() => {
    const newActiveFilters = {};

    if (filters.search) newActiveFilters.search = filters.search;
    if (filters.category && filters.category !== "all")
      newActiveFilters.category = filters.category;
    if (filters.status && filters.status !== "all")
      newActiveFilters.status = filters.status;
    if (
      filters.priceRange &&
      (filters.priceRange[0] > 0 || filters.priceRange[1] < 500)
    )
      newActiveFilters.priceRange = filters.priceRange;
    if (filters.stock && filters.stock !== "all")
      newActiveFilters.stock = filters.stock;

    setActiveFilters(newActiveFilters);

    // Update local state when props change
    setSearchTerm(filters.search || "");
    setCategory(filters.category || "all");
    setStatus(filters.status || "all");
    setPriceRange(filters.priceRange || [0, 500]);
    setStock(filters.stock || "all");
  }, [filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    const newFilters = { ...filters, search: searchTerm };
    onApplyFilters(newFilters);

    // Update active filters
    if (searchTerm) {
      setActiveFilters((prev) => ({ ...prev, search: searchTerm }));
    } else {
      const newActive = { ...activeFilters };
      delete newActive.search;
      setActiveFilters(newActive);
    }
  };

  const handleApplyFilters = () => {
    const newFilters = { ...filters };

    // Apply all filter values
    newFilters.category = category !== "all" ? category : undefined;
    newFilters.status = status !== "all" ? status : undefined;
    newFilters.priceRange = priceRange;
    newFilters.stock = stock !== "all" ? stock : undefined;

    onApplyFilters(newFilters);

    // Update active filters display
    const newActiveFilters = {};
    if (filters.search) newActiveFilters.search = filters.search;
    if (category && category !== "all") newActiveFilters.category = category;
    if (status && status !== "all") newActiveFilters.status = status;
    if (priceRange[0] > 0 || priceRange[1] < 500)
      newActiveFilters.priceRange = priceRange;
    if (stock && stock !== "all") newActiveFilters.stock = stock;

    setActiveFilters(newActiveFilters);
  };

  const handleClearFilters = () => {
    // Reset local state
    setCategory("all");
    setStatus("all");
    setPriceRange([0, 500]);
    setStock("all");

    // Clear active filters but preserve search
    const newFilters = { search: filters.search };
    onApplyFilters(newFilters);

    // Update active filters display (keeping search if it exists)
    const newActiveFilters = {};
    if (filters.search) newActiveFilters.search = filters.search;
    setActiveFilters(newActiveFilters);
  };

  const handleRemoveFilter = (key) => {
    // Create new filters without the removed one
    const newFilters = { ...filters };
    delete newFilters[key];
    onApplyFilters(newFilters);

    // Update local state
    switch (key) {
      case "search":
        setSearchTerm("");
        break;
      case "category":
        setCategory("all");
        break;
      case "status":
        setStatus("all");
        break;
      case "priceRange":
        setPriceRange([0, 500]);
        break;
      case "stock":
        setStock("all");
        break;
    }

    // Update active filters display
    const newActiveFilters = { ...activeFilters };
    delete newActiveFilters[key];
    setActiveFilters(newActiveFilters);
  };

  const getFilterLabel = (key, value) => {
    switch (key) {
      case "search":
        return `Search: ${value}`;
      case "category":
        return `Category: ${value}`;
      case "status":
        return `Status: ${value}`;
      case "priceRange":
        return `Price: $${value[0]} - $${value[1]}`;
      case "stock":
        return `Stock: ${value}`;
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
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
          <SheetContent className="w-full p-5 sm:max-w-md" side="right">
            <SheetHeader>
              <SheetTitle>Filter Products</SheetTitle>
              <SheetDescription>
                Narrow down products by applying filters
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="footwear">Footwear</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Price Range</Label>
                  <span className="text-sm text-muted-foreground">
                    ${priceRange[0]} - ${priceRange[1]}
                  </span>
                </div>
                <Slider
                  value={priceRange}
                  min={0}
                  max={500}
                  step={10}
                  onValueChange={(value) => setPriceRange(value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Select value={stock} onValueChange={setStock}>
                  <SelectTrigger id="stock">
                    <SelectValue placeholder="Select stock status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock Levels</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
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
            <Badge
              key={key}
              variant="secondary"
              className="flex items-center gap-1"
            >
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
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={handleClearFilters}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
