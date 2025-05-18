"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { toast } from "sonner" // Make sure you're using the same toast library throughout the app
import { addToCart } from "@/lib/actions/cart"

export default function AddToCartButton({ 
  productId, 
  className = "", 
  availableSizes = ["S", "M", "L", "XL"],
  availableColors = ["Black", "Blue", "Gray"]
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSize, setSelectedSize] = useState(availableSizes[0])
  const [selectedColor, setSelectedColor] = useState(availableColors[0])
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = async () => {
    if (!productId) {
      toast.error("Product ID is required")
      return
    }

    setIsLoading(true)
    
    try {
      const result = await addToCart({ 
        productId, 
        quantity,
        size: selectedSize,
        color: selectedColor
      })
      
      if (result.success) {
        toast.success("Added to cart", {
          description: `Product has been added to your cart`,
        })
      } else {
        toast.error(result.error || "Failed to add product to cart")
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add product to cart")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={className}>
      <div className="flex flex-col gap-4 mb-4">
        <div>
          <h3 className="font-medium mb-2">Size</h3>
          <div className="flex gap-2">
            {availableSizes.map((size) => (
              <Button 
                key={size} 
                variant={selectedSize === size ? "default" : "outline"} 
                className="h-10 w-10 p-0 flex items-center justify-center"
                onClick={() => setSelectedSize(size)}
                type="button"
              >
                {size}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Color</h3>
          <div className="flex gap-2">
            {availableColors.map((color) => (
              <div
                key={color}
                className={`h-8 w-8 rounded-full border cursor-pointer ${
                  selectedColor === color ? "ring-2 ring-offset-2 ring-primary" : ""
                }`}
                style={{
                  backgroundColor: color.toLowerCase(),
                  borderColor: color.toLowerCase() === "white" ? "#e5e7eb" : color.toLowerCase(),
                }}
                title={color}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Quantity</h3>
          <div className="flex items-center border rounded-md w-32">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none rounded-l-md"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              type="button"
            >
              -
            </Button>
            <span className="w-16 text-center">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none rounded-r-md"
              onClick={() => setQuantity(quantity + 1)}
              type="button"
            >
              +
            </Button>
          </div>
        </div>
      </div>
      
      <Button 
        className="w-full flex items-center gap-2" 
        onClick={handleAddToCart}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="animate-spin mr-2">⏳</span>
        ) : (
          <ShoppingCart className="h-4 w-4" />
        )}
        {isLoading ? "Adding..." : "Add to Cart"}
      </Button>
    </div>
  )
}