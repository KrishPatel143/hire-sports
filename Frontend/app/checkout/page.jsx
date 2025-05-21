"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  MapPin,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getCart } from "@/lib/actions/cart";
import { createOrder } from "@/lib/api/order";

export default function Checkout() {
  const router = useRouter();
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1 = shipping, 2 = payment
  const [formErrors, setFormErrors] = useState({});

  // Update your formData state to include card details
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

    // Payment method
    paymentMethod: "creditCard",

    // Credit card details
    cardNumber: "",
    cardHolderName: "",
    expiryDate: "",
    cvv: "",
  });

  // Fetch cart data on component mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setIsLoading(true);
        const cartData = await getCart();
        setCart({
          items: cartData.items || [],
          subtotal: cartData.subtotal || 0,
          tax: cartData.tax || 0,
          total: cartData.total || 0,
          shipping: 0, // Free shipping (you can adjust this logic as needed)
        });
      } catch (error) {
        console.error("Error fetching cart:", error);
        toast.error("Failed to load cart data");
        router.push("/cart");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [router]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  // Validate shipping form
  const validateShippingForm = () => {
    const errors = {};

    // Required fields
    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "postalCode",
      "country",
    ];
    requiredFields.forEach((field) => {
      if (!formData[field].trim()) {
        errors[field] = "This field is required";
      }
    });

    // Email validation
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation (simple version)
    if (
      formData.phone &&
      !/^\d{10,15}$/.test(formData.phone.replace(/[^\d]/g, ""))
    ) {
      errors.phone = "Please enter a valid phone number";
    }

    // Postal code validation (simple version)
    if (formData.postalCode && !/^\d{5}(-\d{4})?$/.test(formData.postalCode)) {
      errors.postalCode =
        "Please enter a valid postal code (e.g., 12345 or 12345-6789)";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle proceed to payment
  const handleProceedToPayment = () => {
    if (validateShippingForm()) {
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  // Handle back to shipping
  const handleBackToShipping = () => {
    setStep(1);
    window.scrollTo(0, 0);
  };

  // Handle place order
// Handle place order
const handlePlaceOrder = async () => {
  try {
    setIsSubmitting(true);
    
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
    };
    
    // Add card details if payment method is credit card
    if (formData.paymentMethod === 'creditCard') {
      orderPayload.cardDetails = {
        cardNumber: formData.cardNumber,
        cardHolderName: formData.cardHolderName,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv
      };
    } else if (formData.paymentMethod === 'cod') {
      // Add cod-specific fields if needed
      orderPayload.codDetails = {
        // cod specific info would go here
      };
    }
    
    // Use the updated createOrder function from api.js
    const result = await createOrder(orderPayload);
    
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
// Add validation for payment form
const validatePaymentForm = () => {
  const errors = {};
  
  if (formData.paymentMethod === 'creditCard') {
    // Validate card number (simple check for now)
    if (!formData.cardNumber.trim()) {
      errors.cardNumber = "Card number is required";
    } else if (!/^\d{13,19}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      errors.cardNumber = "Please enter a valid card number";
    }
    
    // Validate expiry date
    if (!formData.expiryDate.trim()) {
      errors.expiryDate = "Expiry date is required";
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      errors.expiryDate = "Please use MM/YY format";
    }
    
    // Validate CVV
    if (!formData.cvv.trim()) {
      errors.cvv = "Security code is required";
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      errors.cvv = "Please enter a valid security code";
    }
    
    // Validate card holder name
    if (!formData.cardHolderName.trim()) {
      errors.cardHolderName = "Name on card is required";
    }
  }
  
  setFormErrors(errors);
  return Object.keys(errors).length === 0;
}
  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading checkout...</span>
        </div>
      </div>
    );
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
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="p-0 hover:bg-transparent">
          <Link
            href="/cart"
            className="inline-flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mt-4">Checkout</h1>
        <div className="flex items-center mt-6 mb-8">
          <div
            className={`flex items-center ${
              step >= 1 ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                step >= 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > 1 ? <Check className="h-4 w-4" /> : 1}
            </div>
            <span className="font-medium">Shipping</span>
          </div>
          <Separator className="mx-4 w-12" />
          <div
            className={`flex items-center ${
              step >= 2 ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                step >= 2
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </div>
            <span className="font-medium">Payment</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Column - Shipping & Payment Forms */}
        <div className="md:col-span-2">
          {step === 1 ? (
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
                      className={
                        formErrors.fullName ? "border-destructive" : ""
                      }
                    />
                    {formErrors.fullName && (
                      <p className="text-destructive text-sm mt-1">
                        {formErrors.fullName}
                      </p>
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
                      <p className="text-destructive text-sm mt-1">
                        {formErrors.email}
                      </p>
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
                      <p className="text-destructive text-sm mt-1">
                        {formErrors.phone}
                      </p>
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
                      <p className="text-destructive text-sm mt-1">
                        {formErrors.address}
                      </p>
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
                      <p className="text-destructive text-sm mt-1">
                        {formErrors.city}
                      </p>
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
                      <p className="text-destructive text-sm mt-1">
                        {formErrors.state}
                      </p>
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
                      className={
                        formErrors.postalCode ? "border-destructive" : ""
                      }
                    />
                    {formErrors.postalCode && (
                      <p className="text-destructive text-sm mt-1">
                        {formErrors.postalCode}
                      </p>
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
                      <p className="text-destructive text-sm mt-1">
                        {formErrors.country}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={handleProceedToPayment}
                  className="w-full md:w-auto"
                >
                  Continue to Payment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-primary" />
                  Payment Method
                </CardTitle>
                <CardDescription>
                  Choose your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    handleInputChange({
                      target: { name: "paymentMethod", value },
                    })
                  }
                  className="space-y-3"
                >
                  <div className="flex items-center border rounded-lg p-4 hover:bg-accent cursor-pointer">
                    <RadioGroupItem
                      value="creditCard"
                      id="creditCard"
                      className="mr-3"
                    />
                    <Label
                      htmlFor="creditCard"
                      className="flex-1 flex items-center cursor-pointer"
                    >
                      <CreditCard className="mr-2 h-5 w-5" />
                      Credit / Debit Card
                    </Label>
                  </div>
                  <div className="flex items-center border rounded-lg p-4 hover:bg-accent cursor-pointer">
                    <RadioGroupItem
                      value="cod"
                      id="cod"
                      className="mr-3"
                    />
                    <Label
                      htmlFor="cod"
                      className="flex-1 flex items-center cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6 mr-2"
                      >
                        <path
                          d="M7.996 0H19.5c.554 0 1 .446 1 1v4.8c0 .554-.446 1-1 1h-1.363V22.2c0 .998-.803 1.8-1.8 1.8h-4.674c-.998 0-1.8-.802-1.8-1.8v-8.7h-2.869c-.998 0-1.811-.803-1.811-1.8V1.8c0-.997.813-1.8 1.811-1.8z"
                          fill="#00457C"
                        />
                        <path
                          d="M18.2 0H7.996C7 0 6.2.812 6.2 1.8v10c0 .988.8 1.8 1.796 1.8h2.895v8.4c0 .988.8 1.8 1.796 1.8H16.4c.996 0 1.8-.812 1.8-1.8V1.8c0-.988-.805-1.8-1.8-1.8z"
                          fill="#0079C1"
                        />
                      </svg>
                      cod
                    </Label>
                  </div>
                </RadioGroup>

                {formData.paymentMethod === "creditCard" && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <Label htmlFor="cardNumber" className="mb-1 block">
                        Card Number
                      </Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        className="font-mono"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate" className="mb-1 block">
                          Expiry Date
                        </Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          placeholder="MM/YY"
                          className="font-mono"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv" className="mb-1 block">
                          Security Code (CVV)
                        </Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          placeholder="123"
                          className="font-mono"
                          value={formData.cvv}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cardHolderName" className="mb-1 block">
                        Name on Card
                      </Label>
                      <Input
                        id="cardHolderName"
                        name="cardHolderName"
                        placeholder="John Doe"
                        value={formData.cardHolderName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <p className="text-sm text-muted-foreground">
                    Your payment information is processed securely. We do not
                    store your credit card details.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col-reverse sm:flex-row gap-4 sm:justify-between">
                <Button variant="outline" onClick={handleBackToShipping}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Shipping
                </Button>
                <Button 
                onClick={() => {
                  if (validatePaymentForm()) {
                    handlePlaceOrder();
                  }
                }} 
                className="w-full sm:w-auto"
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
          )}
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                {cart.items.length} {cart.items.length === 1 ? "item" : "items"}{" "}
                in your cart
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Item list with limited details */}
              <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
                {cart.items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="flex gap-3 pb-3 border-b"
                  >
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                      <img
                        src={
                          item.image || "/placeholder.svg?height=100&width=100"
                        }
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="flex flex-1 flex-col min-w-0">
                      <h4 className="text-sm font-medium truncate">
                        {item.name}
                      </h4>
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
                                borderColor:
                                  item.color.toLowerCase() === "white"
                                    ? "#e5e7eb"
                                    : item.color.toLowerCase(),
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
                  <span>
                    {cart.shipping > 0
                      ? `$${cart.shipping.toFixed(2)}`
                      : "Free"}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>

              {/* Shipping info preview when on payment step */}
              {step === 2 && (
                <div className="mt-4 bg-accent p-3 rounded-lg text-sm space-y-2">
                  <div className="flex items-center">
                    <Truck className="h-4 w-4 mr-2 text-primary" />
                    <h4 className="font-medium">Shipping Information</h4>
                  </div>
                  <p>{formData.fullName}</p>
                  <p>{formData.address}</p>
                  <p>
                    {formData.city}, {formData.state} {formData.postalCode}
                  </p>
                  <p>{formData.country}</p>
                  <p className="text-muted-foreground">{formData.email}</p>
                  <p className="text-muted-foreground">{formData.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
