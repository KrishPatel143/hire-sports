/**
 * Utility function for making API requests with authentication
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - JSON response from the API
 */
export const apiRequest = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    
    const headers = {
      ...options.headers,
      ...(token && { 'Authorization': `Bearer ${token}` }),
      'Content-Type': 'application/json',
    };
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'An error occurred');
    }
    
    return response.json();
  };
  

export async function addOrder(orderData) {
try {
    // Validate required order data
    if (!orderData.orderItems || orderData.orderItems.length === 0) {
    return { success: false, error: "Order must contain at least one item" };
    }
    
    if (!orderData.shippingAddress) {
    return { success: false, error: "Shipping address is required" };
    }
    
    if (!orderData.paymentMethod) {
    return { success: false, error: "Payment method is required" };
    }
    console.log(orderData);
    
    // Use the apiRequest utility function to make the API call
    const responseData = await apiRequest('http://localhost:8000/orders/', {
    method: 'POST',
    body: JSON.stringify(orderData)
    });
    
    return { 
    success: true, 
    order: responseData.order || responseData,
    message: "Order created successfully"
    };
} catch (error) {
    console.error("Order creation error:", error);
    return { 
    success: false, 
    error: error.message || "An error occurred while creating the order" 
    };
}
}