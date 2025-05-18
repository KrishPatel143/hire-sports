"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { getProductById } from "@/lib/products"

/**
 * Add a product to the cart
 */
export async function addToCart({
  productId,
  quantity = 1,
  size = null,
  color = null,
}) {
  try {
    // Validate inputs
    if (!productId) {
      return { success: false, error: "Product ID is required" }
    }
    
    if (typeof quantity !== 'number' || quantity < 1) {
      return { success: false, error: "Quantity must be a positive number" }
    }
    
    // Get the cookieStore instance
    const cookieStore = cookies()
    
    // Get the current cart or initialize a new one
    let cart
    try {
      const cartCookie = cookieStore.get("cart")
      cart = cartCookie ? JSON.parse(cartCookie.value) : { items: [] }
      
      // Ensure cart has the right structure
      if (!cart.items || !Array.isArray(cart.items)) {
        cart = { items: [] }
      }
    } catch (parseError) {
      console.error("Error parsing cart cookie:", parseError)
      cart = { items: [] }
    }

    // Check if product exists
    const product = await getProductById(productId)
    if (!product) {
      return { success: false, error: "Product not found" }
    }

    // Check if product is already in cart with the same size and color
    const existingItemIndex = cart.items.findIndex(
      (item) => 
        item.productId === productId && 
        item.size === size && 
        item.color === color
    )

    if (existingItemIndex >= 0) {
      // Update quantity if product already exists in cart with same options
      cart.items[existingItemIndex].quantity += quantity
    } else {
      // Get the product image safely
      let productImage = null
      if (product.image) {
        productImage = product.image
      } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        productImage = product.images[0]
      }
      
      // Add new product to cart
      cart.items.push({
        productId,
        name: product.name,
        price: product.price,
        quantity,
        image: productImage,
        size,
        color,
      })
    }

    // Calculate cart totals
    cart.subtotal = calculateCartSubtotal(cart.items)
    cart.tax = calculateCartTax(cart.subtotal)
    cart.total = cart.subtotal + cart.tax
    
    // Set the cart cookie
    cookieStore.set("cart", JSON.stringify(cart), {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    revalidatePath("/cart")

    return { success: true, cart }
  } catch (error) {
    console.error("Error adding to cart:", error)
    return { success: false, error: "Failed to add product to cart" }
  }
}

/**
 * Remove a product from the cart
 */
export async function removeFromCart(productId, size = null, color = null) {
  try {
    // Handle different parameter formats (object or separate parameters)
    let productIdValue, sizeValue, colorValue;
    
    if (typeof productId === 'object') {
      // If first parameter is an object with these properties
      productIdValue = productId.productId;
      sizeValue = productId.size;
      colorValue = productId.color;
    } else {
      // If parameters are passed separately
      productIdValue = productId;
      sizeValue = size;
      colorValue = color;
    }

    if (!productIdValue) {
      return { success: false, error: "Product ID is required" }
    }
    
    // Get the cookieStore instance
    const cookieStore = cookies()
    
    // Get the current cart
    const cartCookie = cookieStore.get("cart")
    if (!cartCookie) {
      return { success: true, cart: { items: [], subtotal: 0, tax: 0, total: 0 } }
    }

    let cart
    try {
      cart = JSON.parse(cartCookie.value)
      
      // Ensure cart has the right structure
      if (!cart.items || !Array.isArray(cart.items)) {
        cart = { items: [] }
      }
    } catch (parseError) {
      console.error("Error parsing cart cookie:", parseError)
      return { success: false, error: "Invalid cart data" }
    }

    // Filter out the product with matching size and color
    if (sizeValue !== null && colorValue !== null) {
      cart.items = cart.items.filter(
        item => !(item.productId === productIdValue && item.size === sizeValue && item.color === colorValue)
      )
    } else {
      // Backward compatibility for items without size and color
      cart.items = cart.items.filter(item => item.productId !== productIdValue)
    }

    // Recalculate cart totals
    cart.subtotal = calculateCartSubtotal(cart.items)
    cart.tax = calculateCartTax(cart.subtotal)
    cart.total = cart.subtotal + cart.tax

    // Set the cart cookie
    cookieStore.set("cart", JSON.stringify(cart), {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    revalidatePath("/cart")

    return { success: true, cart }
  } catch (error) {
    console.error("Error removing from cart:", error)
    return { success: false, error: "Failed to remove product from cart" }
  }
}

/**
 * Update the quantity of a product in the cart
 */
export async function updateCartItemQuantity({
  productId,
  quantity,
  size = null,
  color = null,
}) {
  try {
    if (!productId) {
      return { success: false, error: "Product ID is required" }
    }
    
    if (typeof quantity !== 'number') {
      return { success: false, error: "Quantity must be a number" }
    }
    
    if (quantity < 1) {
      return removeFromCart({ productId, size, color })
    }

    // Get the cookieStore instance
    const cookieStore = cookies()
    
    // Get the current cart
    const cartCookie = cookieStore.get("cart")
    if (!cartCookie) {
      return { success: false, error: "Cart not found" }
    }

    let cart
    try {
      cart = JSON.parse(cartCookie.value)
      
      // Ensure cart has the right structure
      if (!cart.items || !Array.isArray(cart.items)) {
        return { success: false, error: "Invalid cart structure" }
      }
    } catch (parseError) {
      console.error("Error parsing cart cookie:", parseError)
      return { success: false, error: "Invalid cart data" }
    }

    // Find the product with matching size and color
    let itemIndex = -1
    if (size !== null && color !== null) {
      itemIndex = cart.items.findIndex(
        item => item.productId === productId && item.size === size && item.color === color
      )
    } else {
      // Backward compatibility for items without size and color
      itemIndex = cart.items.findIndex(item => item.productId === productId)
    }

    if (itemIndex === -1) {
      return { success: false, error: "Product not found in cart" }
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity

    // Recalculate cart totals
    cart.subtotal = calculateCartSubtotal(cart.items)
    cart.tax = calculateCartTax(cart.subtotal)
    cart.total = cart.subtotal + cart.tax

    // Set the cart cookie
    cookieStore.set("cart", JSON.stringify(cart), {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    revalidatePath("/cart")

    return { success: true, cart }
  } catch (error) {
    console.error("Error updating cart:", error)
    return { success: false, error: "Failed to update cart" }
  }
}

/**
 * Get the current cart
 */
export async function getCart() {
  try {
    // Get the cookieStore instance
    const cookieStore = cookies()
    
    // Get the cart
    const cartCookie = cookieStore.get("cart")
    if (!cartCookie) {
      return { items: [], subtotal: 0, tax: 0, total: 0 }
    }

    let cart
    try {
      cart = JSON.parse(cartCookie.value)
      
      // Ensure cart has the right structure
      if (!cart.items || !Array.isArray(cart.items)) {
        return { items: [], subtotal: 0, tax: 0, total: 0 }
      }
    } catch (parseError) {
      console.error("Error parsing cart cookie:", parseError)
      return { items: [], subtotal: 0, tax: 0, total: 0 }
    }

    // Recalculate totals to ensure they're accurate
    const subtotal = calculateCartSubtotal(cart.items)
    const tax = calculateCartTax(subtotal)
    const total = subtotal + tax

    return {
      items: cart.items,
      subtotal,
      tax,
      total
    }
  } catch (error) {
    console.error("Error getting cart:", error)
    return { items: [], subtotal: 0, tax: 0, total: 0 }
  }
}

/**
 * Clear the cart
 */
export async function clearCart() {
  try {
    // Get the cookieStore instance
    const cookieStore = cookies()
    
    // Set an empty cart
    cookieStore.set("cart", JSON.stringify({ 
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0
    }), {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    revalidatePath("/cart")

    return { success: true }
  } catch (error) {
    console.error("Error clearing cart:", error)
    return { success: false, error: "Failed to clear cart" }
  }
}

/**
 * Calculate the subtotal of all items in the cart
 */
function calculateCartSubtotal(items) {
  return items.reduce((sum, item) => {
    const price = typeof item.price === 'number' ? item.price : 0
    const quantity = typeof item.quantity === 'number' ? item.quantity : 0
    return sum + (price * quantity)
  }, 0)
}

/**
 * Calculate tax based on subtotal
 */
function calculateCartTax(subtotal) {
  // Using a tax rate of 8% as an example
  const TAX_RATE = 0.08
  return subtotal * TAX_RATE
}