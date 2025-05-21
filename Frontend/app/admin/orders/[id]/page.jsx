"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Package, Check, Truck, X, MapPin, Phone, Clock, CreditCard, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getOrderDetails, updateOrderStatus, updatePaymentStatus } from "@/lib/api/order"
import { toast } from "sonner"

export default function AdminOrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params?.id
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    setLoading(true)
    try {
      const response = await getOrderDetails(orderId)
      
      if (response.success) {
        setOrder(response.order)
      } else {
        toast.error("Error fetching order", {
          description: response.error || "Could not load order details"
        })
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
      toast.error("Error fetching order", {
        description: "An unexpected error occurred"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateOrderStatus = async (newStatus) => {
    try {
      const response = await updateOrderStatus(orderId, { orderStatus: newStatus })
      
      if (response.success) {
        setOrder(prev => ({ ...prev, orderStatus: newStatus }))
        
        toast.success("Order status updated", {
          description: `Order is now ${newStatus}`
        })
      } else {
        toast.error("Error updating order", {
          description: response.error || "Could not update order status"
        })
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Error updating order", {
        description: "An unexpected error occurred"
      })
    }
  }

  const handleUpdatePaymentStatus = async (newStatus) => {
    try {
      const response = await updatePaymentStatus(orderId, { paymentStatus: newStatus })
      
      if (response.success) {
        setOrder(prev => ({ 
          ...prev, 
          paymentStatus: newStatus,
          isPaid: newStatus === 'paid'
        }))
        
        toast.success("Payment status updated", {
          description: `Payment is now ${newStatus}`
        })
      } else {
        toast.error("Error updating payment", {
          description: response.error || "Could not update payment status"
        })
      }
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast.error("Error updating payment", {
        description: "An unexpected error occurred"
      })
    }
  }

  const handlePrintInvoice = () => {
    toast.info("Printing invoice", {
      description: "Preparing invoice..."
    })
    // In a real application, this would generate and print an invoice
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            <RefreshCw className="mr-1 h-3 w-3" /> Processing
          </Badge>
        )
      case "shipped":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            <Truck className="mr-1 h-3 w-3" /> Shipped
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <Check className="mr-1 h-3 w-3" /> Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            <X className="mr-1 h-3 w-3" /> Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <Check className="mr-1 h-3 w-3" /> Paid
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        )
      case "refunded":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            <RefreshCw className="mr-1 h-3 w-3" /> Refunded
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
        </Button>
        
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
            <p className="text-muted-foreground">The order you're looking for could not be found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrintInvoice}>
            Print Invoice
          </Button>
          <Button variant="default" onClick={fetchOrderDetails}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-start">
              <div>
                <span>Order {order._id}</span>
              </div>
              {getOrderStatusBadge(order.orderStatus)}
            </CardTitle>
            <CardDescription>
              Placed on {formatDate(order.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Actions */}
            <div className="space-y-4">
              <h3 className="font-medium">Order Status</h3>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={order.orderStatus === "pending" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleUpdateOrderStatus("pending")}
                >
                  Pending
                </Button>
                <Button 
                  variant={order.orderStatus === "processing" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleUpdateOrderStatus("processing")}
                >
                  Processing
                </Button>
                <Button 
                  variant={order.orderStatus === "shipped" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleUpdateOrderStatus("shipped")}
                >
                  Shipped
                </Button>
                <Button 
                  variant={order.orderStatus === "completed" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleUpdateOrderStatus("completed")}
                >
                  Completed
                </Button>
                <Button 
                  variant={order.orderStatus === "cancelled" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleUpdateOrderStatus("cancelled")}
                >
                  Cancelled
                </Button>
              </div>
            </div>

            {/* Payment Status */}
            <div className="space-y-4">
              <h3 className="font-medium">Payment Status</h3>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>Status: {getPaymentStatusBadge(order.paymentStatus)}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={order.paymentStatus === "pending" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleUpdatePaymentStatus("pending")}
                >
                  Pending
                </Button>
                <Button 
                  variant={order.paymentStatus === "paid" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleUpdatePaymentStatus("paid")}
                >
                  Paid
                </Button>
                <Button 
                  variant={order.paymentStatus === "refunded" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleUpdatePaymentStatus("refunded")}
                >
                  Refunded
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Customer</h3>
              <p>{order.shippingAddress?.fullName || 'Guest Customer'}</p>
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <Phone className="h-3 w-3 mr-1" />
                {order.shippingAddress?.phoneNumber || 'No phone provided'}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium mb-2">Shipping Address</h3>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <div>
                  <p>{order.shippingAddress?.fullName}</p>
                  <p>{order.shippingAddress?.addressLine1}</p>
                  <p>
                    {order.shippingAddress?.state}{order.shippingAddress?.postalCode ? `, ${order.shippingAddress.postalCode}` : ''}
                  </p>
                  <p>{order.shippingAddress?.country}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>
            {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'} in this order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-1 divide-y">
              {order.orderItems.map((item) => (
                <div key={item._id} className="p-4 grid grid-cols-5 gap-4 items-center">
                  <div className="col-span-3 md:col-span-2 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                      {item.product?.image ? (
                        <img 
                          src={item.product.image} 
                          alt={item.name} 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <Package className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="text-sm text-muted-foreground space-y-1 mt-1">
                        {item.size && <p>Size: {item.size}</p>}
                        {item.color && <p>Color: {item.color}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block text-center">
                    <span className="text-sm text-muted-foreground">Quantity</span>
                    <p>{item.quantity}</p>
                  </div>
                  <div className="text-center">
                    <span className="md:hidden text-sm text-muted-foreground">Qty: {item.quantity} × </span>
                    <span>${item.price.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${order.itemsPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>${order.shippingPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>${order.taxPrice.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}