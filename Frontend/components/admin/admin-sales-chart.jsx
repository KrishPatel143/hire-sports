"use client"

import { useEffect, useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: "Jan", sales: 4000, orders: 240 },
  { name: "Feb", sales: 3000, orders: 198 },
  { name: "Mar", sales: 5000, orders: 306 },
  { name: "Apr", sales: 2780, orders: 189 },
  { name: "May", sales: 1890, orders: 142 },
  { name: "Jun", sales: 2390, orders: 178 },
  { name: "Jul", sales: 3490, orders: 251 },
  { name: "Aug", sales: 4000, orders: 273 },
  { name: "Sep", sales: 4500, orders: 298 },
  { name: "Oct", sales: 5200, orders: 334 },
  { name: "Nov", sales: 6100, orders: 352 },
  { name: "Dec", sales: 7500, orders: 401 },
]

const formatCurrency = (value) => {
  return `$${value.toLocaleString()}`
}

export default function AdminSalesChart() {
  // Client-side rendering workaround for Recharts/Next.js
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="name" className="text-xs" />
          <YAxis className="text-xs" tickFormatter={formatCurrency} />
          <Tooltip
            formatter={(value, name) => {
              return name === "sales" ? [formatCurrency(value), "Sales"] : [value, "Orders"]
            }}
          />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.2}
          />
          <Area
            type="monotone"
            dataKey="orders"
            stroke="hsl(var(--secondary))"
            fill="hsl(var(--secondary))"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

