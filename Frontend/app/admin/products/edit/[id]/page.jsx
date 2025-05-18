"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import AdminProductEditForm from "@/components/admin/admin-product-edit-form"

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState(null)

  const productId = params.id

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    setToken(storedToken)
  }, [])

  useEffect(() => {
    if (token && productId) {
      fetchProduct()
    }
  }, [token, productId])

  const fetchProduct = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`http://localhost:8000/products/${productId}`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch product')
      }
      
      const data = await response.json()
      
      setProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Failed to fetch product details')
      router.push('/admin/products')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
          <p className="text-muted-foreground">Update product information in your inventory</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-4">Loading product details...</div>
          ) : (
            product && <AdminProductEditForm initialData={product} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}