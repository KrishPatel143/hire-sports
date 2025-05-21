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
  const ORDER_ENDPOINT = `http://localhost:8000/orders`;
  
  /**
   * Create a new order
   * @param {Object} orderData - Order data including items, shipping address, payment method, and prices
   * @returns {Promise<Object>} The API response with order details or error
   */
  export async function createOrder(orderData) {
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
      console.log(orderData );
      
      // Make the API call
      const responseData = await apiRequest(ORDER_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(orderData)
      });
      
      return { 
        success: true, 
        order: responseData.order || responseData,
        message: responseData.message || "Order created successfully"
      };
    } catch (error) {
      console.error("Order creation error:", error);
      return { 
        success: false, 
        error: error.message || "An error occurred while creating the order" 
      };
    }
  }
  
  /**
   * Get orders for the current user with optional filtering
   * @param {Object} params - Optional filter parameters (page, limit, status, sortBy, startDate, endDate)
   * @returns {Promise<Object>} The API response with paginated orders
   */
  export async function getUserOrders(params = {}) {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      
      const url = `${ORDER_ENDPOINT}/myorders?${queryParams.toString()}`;
      
      const responseData = await apiRequest(url, { method: 'GET' });
      console.log(responseData);
      
      return {
        success: true,
        ...responseData
      };
    } catch (error) {
      console.error("Error fetching user orders:", error);
      return {
        success: false,
        error: error.message || "An error occurred while fetching your orders"
      };
    }
  }
  
  /**
   * Get details for a specific order
   * @param {string} orderId - The ID of the order to retrieve
   * @returns {Promise<Object>} The API response with order details
   */
  export async function getOrderDetails(orderId) {
    try {
      if (!orderId) {
        return { success: false, error: "Order ID is required" };
      }
      
      const responseData = await apiRequest(`${ORDER_ENDPOINT}/${orderId}`, {
        method: 'GET'
      });
      
      return {
        success: true,
        order: responseData
      };
    } catch (error) {
      console.error("Error fetching order details:", error);
      return {
        success: false,
        error: error.message || "An error occurred while fetching order details"
      };
    }
  }
  
  /**
   * Cancel an order
   * @param {string} orderId - The ID of the order to cancel
   * @returns {Promise<Object>} The API response with the updated order
   */
  export async function cancelOrder(orderId) {
    try {
      if (!orderId) {
        return { success: false, error: "Order ID is required" };
      }
      
      const responseData = await apiRequest(`${ORDER_ENDPOINT}/${orderId}/cancel`, {
        method: 'POST'
      });
      
      return {
        success: true,
        order: responseData.order,
        message: responseData.message || "Order cancelled successfully"
      };
    } catch (error) {
      console.error("Error cancelling order:", error);
      return {
        success: false,
        error: error.message || "An error occurred while cancelling the order"
      };
    }
  }
  
  // ADMIN FUNCTIONS
  
  /**
   * Get all orders with optional filtering (admin only)
   * @param {Object} params - Optional filter parameters
   * @returns {Promise<Object>} The API response with paginated orders
   */
  export async function getAllOrders(params = {}) {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.userId) queryParams.append('userId', params.userId);
      
      const url = `${ORDER_ENDPOINT}?${queryParams.toString()}`;
      
      const responseData = await apiRequest(url, { method: 'GET' });
      
      return {
        success: true,
        ...responseData
      };
    } catch (error) {
      console.error("Error fetching all orders:", error);
      return {
        success: false,
        error: error.message || "An error occurred while fetching orders"
      };
    }
  }
  
  /**
   * Get order statistics (admin only)
   * @returns {Promise<Object>} The API response with order statistics
   */
  export async function getOrderStats() {
    try {
      const responseData = await apiRequest(`${ORDER_ENDPOINT}/stats`, {
        method: 'GET'
      });
      
      return {
        success: true,
        stats: responseData
      };
    } catch (error) {
      console.error("Error fetching order statistics:", error);
      return {
        success: false,
        error: error.message || "An error occurred while fetching order statistics"
      };
    }
  }
  
  /**
   * Update an order's status (admin only)
   * @param {string} orderId - The ID of the order to update
   * @param {Object} updateData - Data to update (orderStatus, trackingNumber, notes)
   * @returns {Promise<Object>} The API response with the updated order
   */
  export async function updateOrderStatus(orderId, updateData) {
    try {
      if (!orderId) {
        return { success: false, error: "Order ID is required" };
      }
      
      if (!updateData.orderStatus) {
        return { success: false, error: "Order status is required" };
      }
      
      const responseData = await apiRequest(`${ORDER_ENDPOINT}/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      
      return {
        success: true,
        order: responseData.order,
        message: responseData.message || "Order status updated successfully"
      };
    } catch (error) {
      console.error("Error updating order status:", error);
      return {
        success: false,
        error: error.message || "An error occurred while updating order status"
      };
    }
  }
  
  /**
   * Update an order's payment status (admin only)
   * @param {string} orderId - The ID of the order to update
   * @param {Object} paymentData - Payment data (paymentStatus, paymentResult)
   * @returns {Promise<Object>} The API response with the updated order
   */
  export async function updatePaymentStatus(orderId, paymentData) {
    try {
      if (!orderId) {
        return { success: false, error: "Order ID is required" };
      }
      
      if (!paymentData.paymentStatus) {
        return { success: false, error: "Payment status is required" };
      }
      
      const responseData = await apiRequest(`${ORDER_ENDPOINT}/${orderId}/payment`, {
        method: 'PUT',
        body: JSON.stringify(paymentData)
      });
      
      return {
        success: true,
        order: responseData.order,
        message: responseData.message || "Payment status updated successfully"
      };
    } catch (error) {
      console.error("Error updating payment status:", error);
      return {
        success: false,
        error: error.message || "An error occurred while updating payment status"
      };
    }
  }
  
  export default {
    createOrder,
    getUserOrders,
    getOrderDetails,
    cancelOrder,
    getAllOrders,
    getOrderStats,
    updateOrderStatus,
    updatePaymentStatus
  };