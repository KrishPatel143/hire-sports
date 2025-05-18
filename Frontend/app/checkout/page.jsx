"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Truck, 
  MapPin, 
  AlertCircle, 
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { getCart } from "@/lib/actions/cart"
import { addOrder } from "@/lib/api/order"


export default function Checkout() {
  const router = useRouter()
  const [cart, setCart] = useState({ items: [], subtotal: 0, tax: 0, total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  
  // Form state
  const [formData, setFormData] = useState({
    // Shipping info
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
    
    // Default payment method
    paymentMethod: "creditCard"
  })

  // Fetch cart data on component mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setIsLoading(true)
        const cartData = await getCart()
        setCart({
          items: cartData.items || [],
          subtotal: cartData.subtotal || 0,
          tax: cartData.tax || 0,
          total: cartData.total || 0,
          shipping: 0 // Free shipping (you can adjust this logic as needed)
        })
      } catch (error) {
        console.error("Error fetching cart:", error)
        toast.error("Failed to load cart data")
        router.push("/cart")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCart()
  }, [router])

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      })
    }
  }

  // Validate shipping form
  const validateShippingForm = () => {
    const errors = {}
    
    // Required fields
    const requiredFields = ["fullName", "email", "phone", "address", "city", "state", "postalCode", "country"]
    requiredFields.forEach(field => {
      if (!formData[field].trim()) {
        errors[field] = "This field is required"
      }
    })
    
    // Email validation
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }
    
    // Phone validation (simple version)
    if (formData.phone && !/^\d{10,15}$/.test(formData.phone.replace(/[^\d]/g, ''))) {
      errors.phone = "Please enter a valid phone number"
    }
    
    // Postal code validation (simple version)
    if (formData.postalCode && !/^\d{5}(-\d{4})?$/.test(formData.postalCode)) {
      errors.postalCode = "Please enter a valid postal code (e.g., 12345 or 12345-6789)"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle place order directly after shipping info
  const handlePlaceOrder = async () => {
    // First validate the shipping form
    if (!validateShippingForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true)
      
      // Create order payload
      const orderPayload = {
        orderItems: cart.items.map(item => ({
          product: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size || null,
          color: item.color || null
        })),
        shippingAddress: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone,
          email: formData.email
        },
        paymentMethod: formData.paymentMethod,
        itemsPrice: cart.subtotal,
        shippingPrice: cart.shipping || 0,
        taxPrice: cart.tax,
        totalPrice: cart.total
      }
      
      // Use the updated addOrder function from api.js
      const result = await addOrder(orderPayload);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create order');
      }
      
      // Order successfully placed
      toast.success("Order placed successfully!");
      
      // Redirect to order confirmation page
      router.push(`/orders/${result.order._id}`);
      
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(error.message || "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading checkout...</span>
        </div>
      </div>
    )
  }

  if (cart.items.length === 0) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-10 pb-10 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold">Your cart is empty</h2>
            <p className="text-muted-foreground mt-2">
              You need to add some items to your cart before checking out.
            </p>
            <Button asChild className="mt-6">
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="p-0 hover:bg-transparent">
          <Link href="/cart" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mt-4">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Column - Shipping Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-primary" />
                Shipping Information
              </CardTitle>
              <CardDescription>
                Enter your shipping details for delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1">
                  <Label htmlFor="fullName" className="mb-1 block">
                    Full Name*
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={formErrors.fullName ? "border-destructive" : ""}
                  />
                  {formErrors.fullName && (
                    <p className="text-destructive text-sm mt-1">{formErrors.fullName}</p>
                  )}
                </div>
                <div className="col-span-1">
                  <Label htmlFor="email" className="mb-1 block">
                    Email Address*
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={formErrors.email ? "border-destructive" : ""}
                  />
                  {formErrors.email && (
                    <p className="text-destructive text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>
                <div className="col-span-1">
                  <Label htmlFor="phone" className="mb-1 block">
                    Phone Number*
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="(123) 456-7890"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={formErrors.phone ? "border-destructive" : ""}
                  />
                  {formErrors.phone && (
                    <p className="text-destructive text-sm mt-1">{formErrors.phone}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address" className="mb-1 block">
                    Street Address*
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="123 Main St, Apt 4B"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={formErrors.address ? "border-destructive" : ""}
                  />
                  {formErrors.address && (
                    <p className="text-destructive text-sm mt-1">{formErrors.address}</p>
                  )}
                </div>
                <div className="col-span-1">
                  <Label htmlFor="city" className="mb-1 block">
                    City*
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="New York"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={formErrors.city ? "border-destructive" : ""}
                  />
                  {formErrors.city && (
                    <p className="text-destructive text-sm mt-1">{formErrors.city}</p>
                  )}
                </div>
                <div className="col-span-1">
                  <Label htmlFor="state" className="mb-1 block">
                    State/Province*
                  </Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="NY"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={formErrors.state ? "border-destructive" : ""}
                  />
                  {formErrors.state && (
                    <p className="text-destructive text-sm mt-1">{formErrors.state}</p>
                  )}
                </div>
                <div className="col-span-1">
                  <Label htmlFor="postalCode" className="mb-1 block">
                    Postal Code*
                  </Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    placeholder="10001"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className={formErrors.postalCode ? "border-destructive" : ""}
                  />
                  {formErrors.postalCode && (
                    <p className="text-destructive text-sm mt-1">{formErrors.postalCode}</p>
                  )}
                </div>
                <div className="col-span-1">
                  <Label htmlFor="country" className="mb-1 block">
                    Country*
                  </Label>
                  <Input
                    id="country"
                    name="country"
                    placeholder="United States"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={formErrors.country ? "border-destructive" : ""}
                  />
                  {formErrors.country && (
                    <p className="text-destructive text-sm mt-1">{formErrors.country}</p>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm text-muted-foreground">
                  Your information is processed securely. We respect your privacy.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handlePlaceOrder} 
                className="w-full md:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Item list with limited details */}
              <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
                {cart.items.map((item) => (
                  <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3 pb-3 border-b">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                      <img
                        src={item.image || "/placeholder.svg?height=100&width=100"}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="flex flex-1 flex-col min-w-0">
                      <h4 className="text-sm font-medium truncate">{item.name}</h4>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <span>Qty: {item.quantity}</span>
                        {item.size && <span className="mx-1">•</span>}
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span className="mx-1">•</span>}
                        {item.color && (
                          <span className="flex items-center">
                            Color:
                            <span
                              className="inline-block h-2 w-2 rounded-full border ml-1"
                              style={{
                                backgroundColor: item.color.toLowerCase(),
                                borderColor: item.color.toLowerCase() === "white" ? "#e5e7eb" : item.color.toLowerCase(),
                              }}
                            ></span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Order totals */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${cart.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{cart.shipping > 0 ? `$${cart.shipping.toFixed(2)}` : "Free"}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>

              <div className="mt-4 bg-accent p-3 rounded-lg text-sm">
                <div className="flex items-center">
                  <Truck className="h-4 w-4 mr-2 text-primary" />
                  <h4 className="font-medium">Delivery Information</h4>
                </div>
                <p className="mt-2 text-muted-foreground">
                  Orders are typically delivered within 3-5 business days.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}