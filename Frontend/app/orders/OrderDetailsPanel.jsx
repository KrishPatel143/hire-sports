'use client'
import React from 'react';
import { formatDate } from '../utils/dateUtils';

const OrderDetailsPanel = ({ order, isOpen, onClose, onCancelOrder }) => {
  // Define the status badge component
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
    <div 
      className={`fixed top-0 right-0 h-screen w-full lg:w-2/5 bg-white border-l shadow-lg z-20 transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } overflow-y-auto`}
    >
      {/* Header with close button */}
      <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
        <h2 className="text-xl font-bold">Order Details</h2>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Close panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Panel content with padding */}
      <div className="p-4 space-y-6">
        {/* Order Header */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex justify-between items-center flex-wrap">
            <div>
              <p className="text-sm text-gray-600">Order #</p>
              <p className="font-medium">{order._id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date Placed</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <StatusBadge status={order.orderStatus} />
            </div>
          </div>
        </div>
        
        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h3 className="font-medium">Shipping Address</h3>
            </div>
            <div className="p-4">
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && <p className="mt-2">Phone: {order.shippingAddress.phone}</p>}
            </div>
          </div>
        )}
        
        {/* Payment Info */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h3 className="font-medium">Payment Information</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Method</p>
                <p className="font-medium">{order.paymentMethod || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium">{order.paymentStatus || 'Not specified'}</p>
              </div>
              {order.paymentId && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Payment ID</p>
                  <p className="font-medium break-words">{order.paymentId}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Order Items */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h3 className="font-medium">Items</h3>
          </div>
          
          <div className="divide-y">
            {order.orderItems.map((item, index) => (
              <div key={index} className="p-4 flex items-center">
                {item.product && item.product.image && (
                  <div className="w-16 h-16 bg-gray-100 mr-4 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">
                    {item.product ? item.product.name : item.name}
                  </p>
                  {item.product && item.product.sku && (
                    <p className="text-sm text-gray-600">SKU: {item.product.sku}</p>
                  )}
                  {item.variant && (
                    <p className="text-sm text-gray-600">Variant: {item.variant}</p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <p className="font-medium">${item.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h3 className="font-medium">Order Summary</h3>
          </div>
          <div className="p-4">
            <div className="flex justify-between py-1">
              <span>Subtotal</span>
              <span>${order.subtotal ? order.subtotal.toFixed(2) : order.totalPrice.toFixed(2)}</span>
            </div>
            
            {order.taxAmount !== undefined && (
              <div className="flex justify-between py-1">
                <span>Tax</span>
                <span>${order.taxAmount.toFixed(2)}</span>
              </div>
            )}
            
            {order.shippingAmount !== undefined && (
              <div className="flex justify-between py-1">
                <span>Shipping</span>
                <span>${order.shippingAmount.toFixed(2)}</span>
              </div>
            )}
            
            {order.discount !== undefined && order.discount > 0 && (
              <div className="flex justify-between py-1">
                <span>Discount</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between py-2 font-bold border-t mt-2">
              <span>Total</span>
              <span>${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Tracking Information */}
        {order.trackingNumber && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h3 className="font-medium">Tracking Information</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {order.shippingCarrier && (
                  <div>
                    <p className="text-sm text-gray-600">Carrier</p>
                    <p className="font-medium">{order.shippingCarrier}</p>
                  </div>
                )}
                <div className={order.shippingCarrier ? '' : 'col-span-2'}>
                  <p className="text-sm text-gray-600">Tracking Number</p>
                  <p className="font-medium break-words">{order.trackingNumber}</p>
                </div>
                {order.estimatedDelivery && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Estimated Delivery</p>
                    <p className="font-medium">{formatDate(order.estimatedDelivery)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Order Notes */}
        {order.notes && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h3 className="font-medium">Order Notes</h3>
            </div>
            <div className="p-4">
              <p>{order.notes}</p>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white pt-4 pb-6 border-t mt-4 space-x-3 flex justify-end">
          {['pending', 'processing'].includes(order.orderStatus) && (
            <button
              onClick={() => {
                onCancelOrder(order._id);
                onClose();
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
            >
              Cancel Order
            </button>
          )}
          
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPanel;