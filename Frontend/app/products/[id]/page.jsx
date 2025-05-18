"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { getProductById, getRelatedProducts } from "@/lib/products"
import ProductImageGallery from "@/components/product-image-gallery"
import AddToCartButton from "@/components/add-to-cart-button"
import ProductSkeleton from "@/components/product-skeleton"
import ProductsSkeleton from "@/components/products-skeleton"
import { useParams } from "next/navigation"

export default function ProductPage() {
  const params = useParams()
  
  return (
    <div className="container px-4 py-8">
      <ProductDetails id={params.id} />
    </div>
  )
}

function ProductDetails({ id }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const productData = await getProductById(id)
        setProduct(productData)
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (loading) {
    return <ProductSkeleton />
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4">
        <Link href="/products" className="flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Products
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <ProductImageGallery images={[product.images]} />

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center mt-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < (product.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground ml-2">{product.reviewCount || 0} reviews</span>
            </div>
          </div>

          <div className="flex items-baseline">
            <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
            {product.compareAtPrice && (
              <p className="ml-2 text-muted-foreground line-through">${product.compareAtPrice.toFixed(2)}</p>
            )}
            {product.compareAtPrice && (
              <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-0.5 rounded-md dark:bg-red-900 dark:text-red-100">
                {Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
              </span>
            )}
          </div>

          <p className="text-gray-700 dark:text-gray-300">{product.description}</p>

          <AddToCartButton 
            productId={product._id} 
            className="flex-1" 
            availableSizes={product.sizes || ["S", "M", "L", "XL"]} 
            availableColors={product.colors || ["Black", "Blue", "Gray"]}
          />

          <div className="space-y-2 text-sm">
            <p className="flex items-center">
              <span className="font-medium mr-2">SKU:</span> {product.sku || `SKU-${product._id}`}
            </p>
            <p className="flex items-center">
              <span className="font-medium mr-2">Category:</span> {product.category || "Sportswear"}
            </p>
            <p className="flex items-center">
              <span className="font-medium mr-2">Tags:</span>{" "}
              {(product.tags || ["Sport", "Athleisure", "Performance"]).join(", ")}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="description" className="mt-12">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="p-6">
          <div className="prose dark:prose-invert max-w-none">
            <p>{product.longDescription || product.description}</p>
            <ul className="mt-4">
              <li>High-performance fabric</li>
              <li>Moisture-wicking technology</li>
              <li>4-way stretch for maximum comfort</li>
              <li>Reinforced stitching for durability</li>
            </ul>
          </div>
        </TabsContent>
        <TabsContent value="specifications" className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Materials</h3>
                <p>88% Polyester, 12% Elastane</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Care Instructions</h3>
                <p>Machine wash cold, tumble dry low</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Origin</h3>
                <p>Imported</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Fit</h3>
                <p>True to size</p>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="p-6">
          <div className="space-y-6">
            {product.reviewCount ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="border-b pb-4 mb-4 last:border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Customer {i + 1}</h4>
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, j) => (
                          <Star
                            key={j}
                            className={`h-4 w-4 ${j < 4 + (i % 2) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(Date.now() - 86400000 * (i + 1)).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2">
                    {
                      [
                        "Great product! Fits perfectly and the material is very comfortable.",
                        "Excellent quality and very durable. I've already ordered another one.",
                        "Love the design and color. The size runs a bit large though.",
                      ][i]
                    }
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to review this product</p>
                <Button variant="outline">Write a Review</Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Separator className="my-16" />

      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">You May Also Like</h2>
        </div>
        <RelatedProducts id={id} />
      </div>
    </>
  )
}

function RelatedProducts({ id }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRelatedProducts() {
      try {
        const relatedProducts = await getRelatedProducts(id)
        setProducts(relatedProducts)
      } catch (error) {
        console.error("Error fetching related products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [id])

  if (loading) {
    return <ProductsSkeleton />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product._id} className="group border rounded-lg overflow-hidden">
          <Link href={`/products/${product._id}`}>
            <div className="aspect-square overflow-hidden">
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </Link>
          <div className="p-4">
            <Link href={`/products/${product._id}`}>
              <h3 className="font-semibold group-hover:text-primary transition-colors">{product.name}</h3>
            </Link>
            <div className="flex items-center justify-between mt-2">
              <p className="font-bold">${product.price.toFixed(2)}</p>
              {product.compareAtPrice && (
                <p className="text-sm text-gray-500 line-through">${product.compareAtPrice.toFixed(2)}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}