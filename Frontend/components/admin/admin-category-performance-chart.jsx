"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { name: "Footwear", sales: 12500, orders: 95 },
  { name: "Men", sales: 9800, orders: 80 },
  { name: "Women", sales: 11200, orders: 90 },
  { name: "Accessories", sales: 7500, orders: 120 },
  { name: "Equipment", sales: 5200, orders: 45 },
]

const formatCurrency = (value) => {
  return `$${value.toLocaleString()}`
}

export default function AdminCategoryPerformanceChart() {
  // Client-side rendering workaround for Recharts/Next.js
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)    
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" tickFormatter={formatCurrency} />
        <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--secondary))" />
        <Tooltip
          formatter={(value, name) => {
            if (name === "sales") {
              return [formatCurrency(value ), "Sales"]
            }
            return [value, "Orders"]
          }}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="sales" name="Sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        <Bar yAxisId="right" dataKey="orders" name="Orders" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

