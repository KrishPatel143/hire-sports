"use client"

import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

const topProducts = [
  {
    id: "1",
    name: "Performance Running Shoes",
    category: "Footwear",
    sales: 142,
    revenue: 18458.58,
    stock: 35,
    trend: "up",
  },
  {
    id: "3",
    name: "High-Waisted Leggings",
    category: "Women",
    sales: 98,
    revenue: 5879.02,
    stock: 12,
    trend: "up",
  },
  {
    id: "8",
    name: "Fitness Tracker",
    category: "Accessories",
    sales: 76,
    revenue: 7599.24,
    stock: 8,
    trend: "down",
  },
  {
    id: "6",
    name: "Yoga Mat",
    category: "Accessories",
    sales: 65,
    revenue: 3249.35,
    stock: 42,
    trend: "stable",
  },
  {
    id: "2",
    name: "Breathable Training Shirt",
    category: "Men",
    sales: 54,
    revenue: 1889.46,
    stock: 27,
    trend: "up",
  },
]

export default function AdminTopProducts() {
  const [products] = useState(topProducts)
  const maxSales = Math.max(...products.map((p) => p.sales))

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.id} className="flex items-center space-x-4">
          <div className="flex-1 min-w-0">
            <div className="flex justify-between mb-1">
              <div>
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.category}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  ${product.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">{product.sales} units</p>
              </div>
            </div>
            <Progress value={(product.sales / maxSales) * 100} className="h-2" />
            <div className="flex justify-between mt-1">
              <div className="text-xs">
                <Badge variant={product.stock < 10 ? "destructive" : "outline"} className="text-xs">
                  {product.stock} in stock
                </Badge>
              </div>
              <div className="text-xs">
                {product.trend === "up" && <span className="text-green-500">↑ Trending up</span>}
                {product.trend === "down" && <span className="text-red-500">↓ Trending down</span>}
                {product.trend === "stable" && <span className="text-gray-500">→ Stable</span>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

