'use client'
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { formatDate } from '../utils/dateUtils';
import OrderDetailsPanel from './OrderDetailsPanel';
import { OrderAPI } from '@/lib/api/admin';

const UserOrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0
  });
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'newest',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  });
  
  // Add state for the order details panel
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);

  // Fetch orders based on current filters
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const result = await OrderAPI.getUserOrders(filters);
      
      if (result.success) {
        setOrders(result.orders);
        setPagination({
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalOrders: result.totalOrders
        });
      } else {
        setError(result.error || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize component
  useEffect(() => {
    fetchOrders();
  }, [filters.page, filters.status, filters.sortBy, filters.startDate, filters.endDate]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
      // Reset to page 1 when changing filters
      page: name !== 'page' ? 1 : value
    });
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    
    try {
      const result = await OrderAPI.cancelOrder(orderId);
      
      if (result.success) {
        // Update the order in the list without refetching
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, orderStatus: 'cancelled' } 
            : order
        ));
        
        // If the cancelled order is currently displayed in the panel, update it there too
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: 'cancelled' });
        }
        
        alert(result.message || 'Order cancelled successfully');
      } else {
        alert(result.error || 'Failed to cancel order');
      }
    } catch (err) {
      alert('An unexpected error occurred');
      console.error(err);
    }
  };

  // Handle viewing order details
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailsPanelOpen(true);
  };

  // Handle closing the details panel
  const handleCloseDetails = () => {
    setIsDetailsPanelOpen(false);
    // Optional: add a slight delay before clearing the selected order data
    setTimeout(() => setSelectedOrder(null), 300);
  };

  // Order status badge component
  const StatusBadge = ({ status }) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="container  mx-auto ">
      {/* Main content */}
      <div className={`w-full ${isDetailsPanelOpen ? 'lg:w-3/5' : 'w-full'} transition-all duration-300 px-4`}>
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
            {error}
          </div>
        )}
        
        {/* Filters */}
        <div className="bg-white p-4 rounded shadow-sm mb-6 border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="total-high">Highest Total</option>
                <option value="total-low">Lowest Total</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Orders List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-8 rounded shadow-sm text-center border">
            <p className="text-lg mb-4">You don't have any orders yet</p>
            <Link 
              href="/products" 
              className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div 
                key={order._id} 
                className={`bg-white p-4 rounded shadow-sm border transition duration-200 ${
                  selectedOrder && selectedOrder._id === order._id ? 'border-blue-500 ring-2 ring-blue-200' : 'hover:shadow-md'
                }`}
              >
                <div className="flex flex-wrap justify-between items-center mb-3 pb-2 border-b">
                  <div>
                    <p className="text-sm text-gray-600">Order #{order._id.substring(0, 8)}</p>
                    <p className="text-sm text-gray-600">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  
                  <div className="flex space-x-3 items-center">
                    <StatusBadge status={order.orderStatus} />
                    <span className="font-bold">${order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {order.orderItems.slice(0, 2).map((item, index) => (
                    <div key={index} className="flex items-center">
                      {item.product && item.product.image && (
                        <div className="w-12 h-12 bg-gray-100 mr-3 rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={item.product.image} 
                            alt={item.product.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {item.product ? item.product.name : item.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {order.orderItems.length > 2 && (
                    <p className="text-sm text-gray-600 italic">
                      +{order.orderItems.length - 2} more item(s)
                    </p>
                  )}
                </div>
                
                <div className="mt-4 pt-3 border-t flex flex-wrap justify-between">
                  <button
                    onClick={() => handleViewDetails(order)}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                  >
                    <span>View Details</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {['pending', 'processing'].includes(order.orderStatus) && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {!loading && orders.length > 0 && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-1">
              <button
                onClick={() => handleFilterChange({ target: { name: 'page', value: 1 } })}
                disabled={pagination.currentPage === 1}
                className={`px-3 py-1 rounded ${
                  pagination.currentPage === 1
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                «
              </button>
              
              <button
                onClick={() => 
                  handleFilterChange({ 
                    target: { name: 'page', value: pagination.currentPage - 1 } 
                  })
                }
                disabled={pagination.currentPage === 1}
                className={`px-3 py-1 rounded ${
                  pagination.currentPage === 1
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                ‹
              </button>
              
              {/* Page numbers */}
              {[...Array(pagination.totalPages).keys()].map(page => {
                // Only show a few pages around the current page
                if (
                  page + 1 === 1 ||
                  page + 1 === pagination.totalPages ||
                  (page + 1 >= pagination.currentPage - 1 && page + 1 <= pagination.currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => 
                        handleFilterChange({ target: { name: 'page', value: page + 1 } })
                      }
                      className={`px-3 py-1 rounded ${
                        pagination.currentPage === page + 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {page + 1}
                    </button>
                  );
                } else if (
                  page + 1 === pagination.currentPage - 2 ||
                  page + 1 === pagination.currentPage + 2
                ) {
                  return <span key={page} className="px-1">...</span>;
                }
                return null;
              })}
              
              <button
                onClick={() => 
                  handleFilterChange({ 
                    target: { name: 'page', value: pagination.currentPage + 1 } 
                  })
                }
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-3 py-1 rounded ${
                  pagination.currentPage === pagination.totalPages
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                ›
              </button>
              
              <button
                onClick={() => 
                  handleFilterChange({ 
                    target: { name: 'page', value: pagination.totalPages } 
                  })
                }
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-3 py-1 rounded ${
                  pagination.currentPage === pagination.totalPages
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Details panel - slide in from the right */}
      {selectedOrder && (
        <OrderDetailsPanel 
          order={selectedOrder}
          isOpen={isDetailsPanelOpen}
          onClose={handleCloseDetails}
          onCancelOrder={handleCancelOrder}
        />
      )}
    </div>
  );
};

export default UserOrdersList;