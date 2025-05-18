"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const userActivities = [
  {
    id: "1",
    user: {
      name: "Emma Wilson",
      email: "emma.w@example.com",
      avatar: "/placeholder.svg?height=32&width=32&text=EW",
    },
    action: "signed up",
    time: "10 minutes ago",
  },
  {
    id: "2",
    user: {
      name: "James Rodriguez",
      email: "james.r@example.com",
      avatar: "/placeholder.svg?height=32&width=32&text=JR",
    },
    action: "placed an order",
    time: "25 minutes ago",
  },
  {
    id: "3",
    user: {
      name: "Sophia Chen",
      email: "sophia.c@example.com",
      avatar: "/placeholder.svg?height=32&width=32&text=SC",
    },
    action: "left a review",
    time: "1 hour ago",
  },
  {
    id: "4",
    user: {
      name: "Lucas Brown",
      email: "lucas.b@example.com",
      avatar: "/placeholder.svg?height=32&width=32&text=LB",
    },
    action: "updated their profile",
    time: "2 hours ago",
  },
  {
    id: "5",
    user: {
      name: "Olivia Martinez",
      email: "olivia.m@example.com",
      avatar: "/placeholder.svg?height=32&width=32&text=OM",
    },
    action: "added items to cart",
    time: "3 hours ago",
  },
]

export default function AdminUserActivity() {
  return (
    <div className="space-y-4">
      {userActivities.map((activity) => (
        <div key={activity.id} className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
            <AvatarFallback>
              {activity.user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{activity.user.name}</p>
            <p className="text-xs text-muted-foreground">
              {activity.action} • {activity.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

