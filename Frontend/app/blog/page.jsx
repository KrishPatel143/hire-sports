import Link from "next/link"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const blogPosts = [
  {
    id: "1",
    title: "The Best Workout Clothes for Summer",
    summary:
      "Stay cool and comfortable with our top picks for summer workouts. Learn which fabrics and styles work best in hot weather.",
    image: "/placeholder.svg?height=200&width=600&text=Summer+Workout+Clothes",
    author: "Jane Smith",
    date: "June 15, 2024",
    tags: ["Summer", "Workout", "Clothing"],
  },
  {
    id: "2",
    title: "How to Choose the Right Running Shoes",
    summary:
      "Finding the perfect running shoes can be a challenge. This guide will help you understand what to look for based on your running style and foot type.",
    image: "/placeholder.svg?height=200&width=600&text=Running+Shoes+Guide",
    author: "Michael Johnson",
    date: "June 10, 2024",
    tags: ["Running", "Footwear", "Guide"],
  },
  {
    id: "3",
    title: "5 Tips for Athletic Recovery",
    summary:
      "Recovery is just as important as your workout. Discover five essential tips to help your body recover faster and perform better.",
    image: "/placeholder.svg?height=200&width=600&text=Athletic+Recovery",
    author: "Sarah Lee",
    date: "June 5, 2024",
    tags: ["Recovery", "Wellness", "Performance"],
  },
  {
    id: "4",
    title: "The Benefits of High-Intensity Interval Training",
    summary:
      "HIIT workouts are known for their efficiency and effectiveness. Learn about the science behind HIIT and how to incorporate it into your routine.",
    image: "/placeholder.svg?height=200&width=600&text=HIIT+Training",
    author: "David Chen",
    date: "May 28, 2024",
    tags: ["HIIT", "Cardio", "Fitness"],
  },
  {
    id: "5",
    title: "Nutrition Tips for Endurance Athletes",
    summary:
      "Proper nutrition is crucial for endurance performance. This article covers essential nutrition strategies for before, during, and after long workouts.",
    image: "/placeholder.svg?height=200&width=600&text=Nutrition+for+Athletes",
    author: "Emily Rodriguez",
    date: "May 20, 2024",
    tags: ["Nutrition", "Endurance", "Performance"],
  },
  {
    id: "6",
    title: "Sustainable Sportswear: The Future of Athletic Clothing",
    summary:
      "Eco-friendly sportswear is on the rise. Discover how sustainable practices are changing the sportswear industry and how you can make more environmentally conscious choices.",
    image: "/placeholder.svg?height=200&width=600&text=Sustainable+Sportswear",
    author: "Alex Thompson",
    date: "May 15, 2024",
    tags: ["Sustainability", "Environment", "Fashion"],
  },
]

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">The HireSports Blog</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <div className="aspect-video overflow-hidden">
              <img
                src={post.image || "/placeholder.svg"}
                alt={post.title}
                className="object-cover w-full h-full transition-transform hover:scale-105 duration-300"
              />
            </div>
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <CardTitle>
                <Link href={`/blog/${post.id}`} className="hover:text-primary transition-colors">
                  {post.title}
                </Link>
              </CardTitle>
              <CardDescription>{post.summary}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                By {post.author} • {post.date}
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/blog/${post.id}`}>Read More</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Button variant="outline">Load More Articles</Button>
      </div>
    </div>
  )
}

