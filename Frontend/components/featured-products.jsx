"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getProducts } from "@/lib/products"

export default function FeaturedProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts({ featured: true, limit: 4 })
        setProducts(response.products) // Access the products array from the response
      } catch (error) {
        console.error("Error fetching featured products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Effect to auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleAddToCart = (product) => {
    // In a real app, this would add the product to cart
    setNotification({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`
    })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3 animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {notification && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 max-w-md animate-in fade-in slide-in-from-bottom-5 z-50">
          <h4 className="font-medium">{notification.title}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{notification.description}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden group">
            <Link href={`/products/${product.id}`}>
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg?height=400&width=400"}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </Link>
            <CardContent className="p-4">
              <Link href={`/products/${product.id}`}>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{product.name}</h3>
              </Link>
              <div className="flex items-center justify-between mt-2">
                <p className="font-bold">${product.price.toFixed(2)}</p>
                {product.compareAtPrice && (
                  <p className="text-sm text-gray-500 line-through">${product.compareAtPrice.toFixed(2)}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button className="w-full" size="sm" onClick={() => handleAddToCart(product)}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  )
}