/**
 * API utilities for making authenticated requests to the backend
 * This file serves as a central location for all API-related functionality
 */

const API_BASE_URL ='http://localhost:8000';

/**
 * Gets the authentication token from local storage
 * @returns {string|null} The authentication token if available
 */
export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

/**
 * Sets the authentication token in local storage
 * @param {string} token - The authentication token to store
 */
export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

/**
 * Removes the authentication token from local storage
 */
export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

/**
 * Utility function for making API requests with authentication
 * @param {string} endpoint - API endpoint path (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - JSON response from the API
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      // Optionally trigger logout
      removeAuthToken();
      // If you're using any state management like Redux, dispatch logout action here
      // e.g. store.dispatch(logoutUser());
      
      // If you want to redirect to login page from here:
      // window.location.href = '/login';
      
      throw new Error('Authentication expired. Please log in again.');
    }
    
    // Parse response as JSON, handling both success and error responses
    const data = await response.json();
    
    // If the response status is not in the 200-299 range, throw an error
    if (!response.ok) {
      throw new Error(data.message || data.error || 'An error occurred');
    }
    
    return data;
  } catch (error) {
    // Enhance error with additional information
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Network error. Please check your connection.');
    }
    
    // Re-throw the error for the calling function to handle
    throw error;
  }
};

/**
 * API endpoints for Auth operations
 */
export const AuthAPI = {
  login: async (credentials) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },
  
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  logout: () => {
    removeAuthToken();
    // Add any additional cleanup here
  },
  
  getCurrentUser: async () => {
    return apiRequest('/auth/me', { method: 'GET' });
  },
  
  resetPassword: async (email) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  
  confirmResetPassword: async (token, newPassword) => {
    return apiRequest('/auth/reset-password/confirm', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },
  
  updateProfile: async (userData) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
};

/**
 * API endpoints for Products
 */
export const ProductAPI = {
  getAllProducts: async (params = {}) => {
    // Build query string from params
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.category) queryParams.append('category', params.category);
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice);
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
    
    const url = `/products?${queryParams.toString()}`;
    
    try {
      const responseData = await apiRequest(url, { method: 'GET' });
      
      return {
        success: true,
        ...responseData
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      return {
        success: false,
        error: error.message || "An error occurred while fetching products"
      };
    }
  },
  
  getProductById: async (productId) => {
    try {
      if (!productId) {
        return { success: false, error: "Product ID is required" };
      }
      
      const responseData = await apiRequest(`/products/${productId}`, {
        method: 'GET'
      });
      
      return {
        success: true,
        product: responseData
      };
    } catch (error) {
      console.error("Error fetching product details:", error);
      return {
        success: false,
        error: error.message || "An error occurred while fetching product details"
      };
    }
  },
  
  // Admin functions
  createProduct: async (productData) => {
    try {
      const responseData = await apiRequest('/admin/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      });
      
      return {
        success: true,
        product: responseData.product,
        message: responseData.message || "Product created successfully"
      };
    } catch (error) {
      console.error("Error creating product:", error);
      return {
        success: false,
        error: error.message || "An error occurred while creating the product"
      };
    }
  },
  
  updateProduct: async (productId, productData) => {
    try {
      if (!productId) {
        return { success: false, error: "Product ID is required" };
      }
      
      const responseData = await apiRequest(`/admin/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      });
      
      return {
        success: true,
        product: responseData.product,
        message: responseData.message || "Product updated successfully"
      };
    } catch (error) {
      console.error("Error updating product:", error);
      return {
        success: false,
        error: error.message || "An error occurred while updating the product"
      };
    }
  },
  
  deleteProduct: async (productId) => {
    try {
      if (!productId) {
        return { success: false, error: "Product ID is required" };
      }
      
      const responseData = await apiRequest(`/admin/products/${productId}`, {
        method: 'DELETE'
      });
      
      return {
        success: true,
        message: responseData.message || "Product deleted successfully"
      };
    } catch (error) {
      console.error("Error deleting product:", error);
      return {
        success: false,
        error: error.message || "An error occurred while deleting the product"
      };
    }
  },
  
  toggleProductStatus: async (productId) => {
    try {
      if (!productId) {
        return { success: false, error: "Product ID is required" };
      }
      
      const responseData = await apiRequest(`/admin/products/${productId}/toggle-active`, {
        method: 'PATCH'
      });
      
      return {
        success: true,
        product: responseData.product,
        message: responseData.message || "Product status updated successfully"
      };
    } catch (error) {
      console.error("Error toggling product status:", error);
      return {
        success: false,
        error: error.message || "An error occurred while updating product status"
      };
    }
  },
};

/**
 * API endpoints for Categories
 */
export const CategoryAPI = {
  getAllCategories: async () => {
    try {
      const responseData = await apiRequest('/categories', { method: 'GET' });
      
      return {
        success: true,
        categories: responseData
      };
    } catch (error) {
      console.error("Error fetching categories:", error);
      return {
        success: false,
        error: error.message || "An error occurred while fetching categories"
      };
    }
  },
  
  // Admin functions
  createCategory: async (categoryData) => {
    try {
      const responseData = await apiRequest('/admin/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData)
      });
      
      return {
        success: true,
        category: responseData.category,
        message: responseData.message || "Category created successfully"
      };
    } catch (error) {
      console.error("Error creating category:", error);
      return {
        success: false,
        error: error.message || "An error occurred while creating the category"
      };
    }
  },
  
  updateCategory: async (categoryId, categoryData) => {
    try {
      if (!categoryId) {
        return { success: false, error: "Category ID is required" };
      }
      
      const responseData = await apiRequest(`/admin/categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData)
      });
      
      return {
        success: true,
        category: responseData.category,
        message: responseData.message || "Category updated successfully"
      };
    } catch (error) {
      console.error("Error updating category:", error);
      return {
        success: false,
        error: error.message || "An error occurred while updating the category"
      };
    }
  },
  
  deleteCategory: async (categoryId) => {
    try {
      if (!categoryId) {
        return { success: false, error: "Category ID is required" };
      }
      
      const responseData = await apiRequest(`/admin/categories/${categoryId}`, {
        method: 'DELETE'
      });
      
      return {
        success: true,
        message: responseData.message || "Category deleted successfully"
      };
    } catch (error) {
      console.error("Error deleting category:", error);
      return {
        success: false,
        error: error.message || "An error occurred while deleting the category"
      };
    }
  },
};

/**
 * API endpoints for Orders
 */
export const OrderAPI = {
  createOrder: async (orderData) => {
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
      
      // Make the API call
      const responseData = await apiRequest('/orders', {
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
  },
  
  getUserOrders: async (params = {}) => {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      
      const url = `/orders/myorders?${queryParams.toString()}`;
      
      const responseData = await apiRequest(url, { method: 'GET' });
      
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
  },
  
  getOrderDetails: async (orderId) => {
    try {
      if (!orderId) {
        return { success: false, error: "Order ID is required" };
      }
      
      const responseData = await apiRequest(`/orders/${orderId}`, {
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
  },
  
  cancelOrder: async (orderId) => {
    try {
      if (!orderId) {
        return { success: false, error: "Order ID is required" };
      }
      
      const responseData = await apiRequest(`/orders/${orderId}/cancel`, {
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
  },
  
  // Admin functions
  getAllOrders: async (params = {}) => {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.searchTerm) queryParams.append('search', params.searchTerm);
      if (params.userId) queryParams.append('userId', params.userId);
      
      const url = `/admin/orders?${queryParams.toString()}`;
      
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
  },
  
  getOrderStats: async () => {
    try {
      const responseData = await apiRequest('/admin/orders/stats', {
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
  },
  
  updateOrderStatus: async (orderId, updateData) => {
    try {
      if (!orderId) {
        return { success: false, error: "Order ID is required" };
      }
      
      if (!updateData.orderStatus) {
        return { success: false, error: "Order status is required" };
      }
      
      const responseData = await apiRequest(`/admin/orders/${orderId}/status`, {
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
  },
  
  updatePaymentStatus: async (orderId, paymentData) => {
    try {
      if (!orderId) {
        return { success: false, error: "Order ID is required" };
      }
      
      if (!paymentData.paymentStatus) {
        return { success: false, error: "Payment status is required" };
      }
      
      const responseData = await apiRequest(`/admin/orders/${orderId}/payment`, {
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
  },
};

/**
 * API endpoints for Users (Admin only)
 */
export const UserAPI = {
  getAllUsers: async (params = {}) => {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.search) queryParams.append('search', params.search);
      if (params.role) queryParams.append('role', params.role);
      if (params.status) queryParams.append('status', params.status);
      
      const url = `/admin/users?${queryParams.toString()}`;
      
      const responseData = await apiRequest(url, { method: 'GET' });
      
      return {
        success: true,
        ...responseData
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        success: false,
        error: error.message || "An error occurred while fetching users"
      };
    }
  },
  
  getUserById: async (userId) => {
    try {
      if (!userId) {
        return { success: false, error: "User ID is required" };
      }
      
      const responseData = await apiRequest(`/admin/users/${userId}`, {
        method: 'GET'
      });
      
      return {
        success: true,
        user: responseData
      };
    } catch (error) {
      console.error("Error fetching user details:", error);
      return {
        success: false,
        error: error.message || "An error occurred while fetching user details"
      };
    }
  },
  
  updateUser: async (userId, userData) => {
    try {
      if (!userId) {
        return { success: false, error: "User ID is required" };
      }
      
      const responseData = await apiRequest(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
      
      return {
        success: true,
        user: responseData.user,
        message: responseData.message || "User updated successfully"
      };
    } catch (error) {
      console.error("Error updating user:", error);
      return {
        success: false,
        error: error.message || "An error occurred while updating the user"
      };
    }
  },
  
  toggleUserStatus: async (userId) => {
    try {
      if (!userId) {
        return { success: false, error: "User ID is required" };
      }
      
      const responseData = await apiRequest(`/admin/users/${userId}/status`, {
        method: 'PATCH'
      });
      
      return {
        success: true,
        user: responseData.user,
        message: responseData.message || "User status updated successfully"
      };
    } catch (error) {
      console.error("Error toggling user status:", error);
      return {
        success: false,
        error: error.message || "An error occurred while updating user status"
      };
    }
  },
};

/**
 * API endpoints for Dashboard (Admin only)
 */
export const DashboardAPI = {
  getStats: async () => {
    try {
      const responseData = await apiRequest('/admin/dashboard', { method: 'GET' });
      
      return {
        success: true,
        stats: responseData
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        success: false,
        error: error.message || "An error occurred while fetching dashboard statistics"
      };
    }
  },
};

// Export all APIs
export default {
  apiRequest,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  AuthAPI,
  ProductAPI,
  CategoryAPI,
  OrderAPI,
  UserAPI,
  DashboardAPI
};