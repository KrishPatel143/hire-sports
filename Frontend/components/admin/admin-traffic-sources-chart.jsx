"use client"

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const data = [
  { name: "Direct", value: 35 },
  { name: "Organic Search", value: 25 },
  { name: "Social Media", value: 20 },
  { name: "Referral", value: 15 },
  { name: "Email", value: 5 },
]

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#ff8042", "#0088fe", "#00c49f"]

export default function AdminTrafficSourcesChart() {
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
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value}%`, "Traffic"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

