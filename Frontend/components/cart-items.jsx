"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCart, updateCartItemQuantity, removeFromCart, clearCart } from "@/lib/actions/cart"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion" // You'll need to install framer-motion

export default function CartItems() {
  const [cartItems, setCartItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [subtotal, setSubtotal] = useState(0)
  const [tax, setTax] = useState(0)
  const [total, setTotal] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [activeItemId, setActiveItemId] = useState(null)

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setIsLoading(true)
        const cart = await getCart()
        setCartItems(cart.items || [])
        setSubtotal(cart.subtotal || 0)
        setTax(cart.tax || 0)
        setTotal(cart.total || 0)
      } catch (error) {
        console.error("Error fetching cart:", error)
        toast.error("Failed to load your cart")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCart()
  }, [])

  const handleUpdateQuantity = async (productId, quantity, size = null, color = null) => {
    try {
      setIsUpdating(true)
      setActiveItemId(`${productId}-${size}-${color}`)
      
      const result = await updateCartItemQuantity({ 
        productId, 
        quantity, 
        size, 
        color 
      })

      if (result.success) {
        // Update local state with new cart data
        const updatedCart = await getCart()
        setCartItems(updatedCart.items || [])
        setSubtotal(updatedCart.subtotal || 0)
        setTax(updatedCart.tax || 0)
        setTotal(updatedCart.total || 0)
      } else {
        toast.error(result.error || "Failed to update quantity")
      }
    } catch (error) {
      console.error("Error updating quantity:", error)
      toast.error("Failed to update quantity")
    } finally {
      setIsUpdating(false)
      setActiveItemId(null)
    }
  }

  const handleRemoveItem = async (productId, size = null, color = null) => {
    try {
      setIsUpdating(true)
      setActiveItemId(`${productId}-${size}-${color}`)
      
      const result = await removeFromCart({ productId, size, color })

      if (result.success) {
        // Update local state
        const updatedCart = await getCart()
        setCartItems(updatedCart.items || [])
        setSubtotal(updatedCart.subtotal || 0)
        setTax(updatedCart.tax || 0)
        setTotal(updatedCart.total || 0)

        toast.success("Item removed", {
          description: "The item has been removed from your cart"
        })
      } else {
        toast.error(result.error || "Failed to remove item")
      }
    } catch (error) {
      console.error("Error removing item:", error)
      toast.error("Failed to remove item")
    } finally {
      setIsUpdating(false)
      setActiveItemId(null)
    }
  }

  const handleClearCart = async () => {
    try {
      setIsUpdating(true)
      const result = await clearCart()
      
      if (result.success) {
        setCartItems([])
        setSubtotal(0)
        setTax(0)
        setTotal(0)
        
        toast.success("Cart cleared", {
          description: "All items have been removed from your cart"
        })
      } else {
        toast.error(result.error || "Failed to clear cart")
      }
    } catch (error) {
      console.error("Error clearing cart:", error)
      toast.error("Failed to clear cart")
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-6 border rounded-lg p-6 animate-pulse">
                    <div className="h-24 w-24 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mt-4"></div>
                    </div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-20"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-full mt-4"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-10 pb-10 flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-primary/10 p-6 mb-4">
            <ShoppingBag className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mt-2">Your cart is empty</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            Looks like you haven't added any products to your cart yet. Let's change that!
          </p>
          <Button asChild className="mt-8" size="lg">
            <Link href="/products">
              Start Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Cart Items - Takes 2/3 on all screens */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">
                Shopping Cart
                <Badge variant="secondary" className="ml-2">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </Badge>
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearCart}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Clear Cart
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AnimatePresence>
              <div className="space-y-3">
                {cartItems.map((item) => {
                  const itemKey = `${item.productId}-${item.size}-${item.color}`;
                  const isItemUpdating = activeItemId === itemKey && isUpdating;
                  
                  return (
                    <motion.div
                      key={itemKey}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`bg-card border rounded-xl p-4 ${isItemUpdating ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border bg-background">
                          <Link href={`/products/${item.productId}`}>
                            <img
                              src={item.image || "/placeholder.svg?height=100&width=100"}
                              alt={item.name}
                              className="h-full w-full object-cover object-center hover:scale-105 transition-transform duration-300"
                            />
                          </Link>
                        </div>

                        <div className="flex flex-1 flex-col min-w-0">
                          <Link href={`/products/${item.productId}`} className="group">
                            <h3 className="font-medium truncate text-foreground group-hover:text-primary transition-colors">
                              {item.name}
                            </h3>
                          </Link>
                          
                          {/* Display size and color if available */}
                          {(item.size || item.color) && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.size && (
                                <Badge variant="outline" className="text-xs rounded-md font-normal">
                                  Size: {item.size}
                                </Badge>
                              )}
                              {item.color && (
                                <Badge variant="outline" className="text-xs rounded-md font-normal flex items-center gap-1">
                                  <span 
                                    className="inline-block h-2 w-2 rounded-full border"
                                    style={{
                                      backgroundColor: item.color.toLowerCase(),
                                      borderColor: item.color.toLowerCase() === "white" ? "#e5e7eb" : item.color.toLowerCase(),
                                    }}
                                  ></span>
                                  {item.color}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center mt-2">
                            <div className="flex items-center border rounded-md overflow-hidden bg-background">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-none"
                                onClick={() => handleUpdateQuantity(item.productId, Math.max(1, item.quantity - 1), item.size, item.color)}
                                disabled={isItemUpdating || item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                                <span className="sr-only">Decrease quantity</span>
                              </Button>
                              <span className="w-8 text-center text-xs font-medium">
                                {isItemUpdating ? (
                                  <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                                ) : (
                                  item.quantity
                                )}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-none"
                                onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1, item.size, item.color)}
                                disabled={isItemUpdating}
                              >
                                <Plus className="h-3 w-3" />
                                <span className="sr-only">Increase quantity</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <div className="font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ${item.price.toFixed(2)} each
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-destructive hover:text-destructive/90 hover:bg-destructive/10 p-0 h-auto"
                            onClick={() => handleRemoveItem(item.productId, item.size, item.color)}
                            disabled={isItemUpdating}
                          >
                            {isItemUpdating ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <Trash2 className="h-3 w-3 mr-1" />
                            )}
                            Remove
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          </CardContent>
          <CardFooter className="pt-2 flex justify-start">
            <Button variant="outline" asChild size="sm">
              <Link href="/products">
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Continue Shopping
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Order Summary Card - Takes 1/3 on all screens */}
      <div className="md:col-span-1">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              {/* Optional: Add shipping estimation */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-semibold">${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full h-11 text-base" size="lg" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                <Link href="/checkout">
                  Proceed to Checkout
                </Link>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <div className="text-center text-xs text-muted-foreground">
              Taxes and shipping calculated at checkout
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}