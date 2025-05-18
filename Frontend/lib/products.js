// products.js - Updated to connect to backend API
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

export async function getProducts(options = {}) {
  // Build query parameters for the API call
  const params = new URLSearchParams();
  
  // Add pagination parameters
  if (options.page) params.append('page', options.page);
  if (options.limit) params.append('limit', options.limit || 12);
  
  // Add filtering parameters
  if (options.category && options.category !== 'all') params.append('category', options.category);
  if (options.minPrice !== undefined) params.append('minPrice', options.minPrice);
  if (options.maxPrice !== undefined) params.append('maxPrice', options.maxPrice);
  if (options.search) params.append('search', options.search);
  if (options.showInactive) params.append('showInactive', 'true');
  
  // Add sorting parameter (convert from our sort options to backend sort options)
  if (options.sort) {
    let sortBy;
    switch(options.sort) {
      case 'price-asc':
      case 'price-desc':
      case 'newest':
      case 'oldest':
        sortBy = options.sort;
        break;
      case 'popular':
        sortBy = 'rating-desc'; // Map 'popular' to 'rating-desc'
        break;
      case 'name-asc':
      case 'name-desc':
        sortBy = options.sort;
        break;
      default:
        sortBy = 'newest';
    }
    params.append('sortBy', sortBy);
  }
  
  // Make the API call
  try {
    const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform the response to match the expected structure if needed
    return {
      products: data.products,
      total: data.totalProducts,
      page: data.currentPage,
      limit: options.limit || 12,
      totalPages: data.totalPages
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    // Return empty data on error
    return {
      products: [],
      total: 0,
      page: options.page || 1,
      limit: options.limit || 12,
      totalPages: 0
    };
  }
}

// Keep the existing product detail and related products functions
export async function getProductById(id) {
  try {
    const response = await fetch(`http://localhost:8000/products/${id}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching product details:", error);
    return null;
  }
}

export async function getRelatedProducts(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/related/${productId}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}