"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { FilterX, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

const categories = [
  { id: "all", name: "All Products" },
  { id: "men", name: "Men" },
  { id: "women", name: "Women" },
  { id: "accessories", name: "Accessories" },
  { id: "footwear", name: "Footwear" },
]

const sortOptions = [
  { id: "newest", name: "Newest" },
  { id: "price-asc", name: "Price: Low to High" },
  { id: "price-desc", name: "Price: High to Low" },
  { id: "popular", name: "Popularity" },
]

export default function ProductsFilter({
  activeCategory = "all",
  activeSort = "newest",
  minPrice = 0,
  maxPrice = 500,
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [priceRange, setPriceRange] = useState([minPrice || 0, maxPrice || 500])
  const [isOpen, setIsOpen] = useState(false)

  const handleCategoryChange = (category) => {
    const params = new URLSearchParams()
    if (category !== "all") {
      params.set("category", category)
    }
    if (activeSort !== "newest") {
      params.set("sort", activeSort)
    }
    if (priceRange[0] > 0) {
      params.set("minPrice", priceRange[0].toString())
    }
    if (priceRange[1] < 500) {
      params.set("maxPrice", priceRange[1].toString())
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSortChange = (sort) => {
    const params = new URLSearchParams()
    if (activeCategory !== "all") {
      params.set("category", activeCategory)
    }
    if (sort !== "newest") {
      params.set("sort", sort)
    }
    if (priceRange[0] > 0) {
      params.set("minPrice", priceRange[0].toString())
    }
    if (priceRange[1] < 500) {
      params.set("maxPrice", priceRange[1].toString())
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const handlePriceChange = (value) => {
    setPriceRange(value)
  }

  const applyPriceFilter = () => {
    const params = new URLSearchParams()
    if (activeCategory !== "all") {
      params.set("category", activeCategory)
    }
    if (activeSort !== "newest") {
      params.set("sort", activeSort)
    }
    if (priceRange[0] > 0) {
      params.set("minPrice", priceRange[0].toString())
    }
    if (priceRange[1] < 500) {
      params.set("maxPrice", priceRange[1].toString())
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const clearFilters = () => {
    setPriceRange([0, 500])
    router.push(pathname)
  }

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Categories</h3>
        <RadioGroup value={activeCategory} onValueChange={handleCategoryChange} className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <RadioGroupItem value={category.id} id={`category-${category.id}`} />
              <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-4">Sort By</h3>
        <RadioGroup value={activeSort} onValueChange={handleSortChange} className="space-y-2">
          {sortOptions.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem value={option.id} id={`sort-${option.id}`} />
              <Label htmlFor={`sort-${option.id}`}>{option.name}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Price Range</h3>
          <div className="text-sm text-muted-foreground">
            ${priceRange[0]} - ${priceRange[1]}
          </div>
        </div>
        <Slider value={priceRange} min={0} max={500} step={10} onValueChange={handlePriceChange} className="mb-6" />
        <Button onClick={applyPriceFilter} className="w-full">
          Apply Price Filter
        </Button>
      </div>

      <Separator />

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        <FilterX className="mr-2 h-4 w-4" /> Clear All Filters
      </Button>
    </div>
  )

  return (
    <>
      {/* Desktop Filter */}
      <div className="hidden md:block sticky top-24 h-fit">
        <FilterContent />
      </div>

      {/* Mobile Filter */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:max-w-md">
            <FilterContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

