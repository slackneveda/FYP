import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import adminApi from '@/services/adminApi';

const CreateOrderModal = ({ isOpen, onClose, onOrderCreated }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    total: '',
    order_type: 'delivery',
    payment_method: 'card',
    status: 'pending',
    payment_status: 'pending',
    delivery_address: '',
    delivery_instructions: '',
    items: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentItem, setCurrentItem] = useState({
    product_name: '',
    unit_price: '',
    quantity: 1,
    total_price: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await adminApi.createOrder(formData);
      onOrderCreated(result.order);
      onClose();
      
      // Reset form
      setFormData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        total: '',
        order_type: 'delivery',
        payment_method: 'card',
        status: 'pending',
        payment_status: 'pending',
        delivery_address: '',
        delivery_instructions: '',
        items: []
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-calculate total price
      if (name === 'unit_price' || name === 'quantity') {
        const unitPrice = parseFloat(name === 'unit_price' ? value : updated.unit_price) || 0;
        const quantity = parseInt(name === 'quantity' ? value : updated.quantity) || 0;
        updated.total_price = (unitPrice * quantity).toFixed(2);
      }
      
      return updated;
    });
  };

  const addItem = () => {
    if (currentItem.product_name && currentItem.unit_price && currentItem.quantity) {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, { ...currentItem }]
      }));
      
      setCurrentItem({
        product_name: '',
        unit_price: '',
        quantity: 1,
        total_price: ''
      });
      
      // Recalculate total
      updateTotal();
    }
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
    updateTotal();
  };

  const updateTotal = () => {
    const total = formData.items.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
    setFormData(prev => ({
      ...prev,
      total: total.toFixed(2)
    }));
  };

  useEffect(() => {
    updateTotal();
  }, [formData.items]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <ModalHeader>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Order</h2>
      </ModalHeader>
      <ModalBody>
        <form id="create-order-form" onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Customer Name *</Label>
                <Input
                  id="customer_name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customer_email">Customer Email *</Label>
                <Input
                  id="customer_email"
                  name="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customer_phone">Phone Number</Label>
              <Input
                id="customer_phone"
                name="customer_phone"
                value={formData.customer_phone}
                onChange={handleChange}
              />
            </div>
          </div>
          
          {/* Order Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Order Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order_type">Order Type</Label>
                <select
                  name="order_type"
                  value={formData.order_type}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="delivery">Delivery</option>
                  <option value="pickup">Pickup</option>
                  <option value="dine_in">Dine In</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                  <option value="digital_wallet">Digital Wallet</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Order Status</Label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment_status">Payment Status</Label>
                <select
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="pending">Pending</option>
                  <option value="succeeded">Succeeded</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
            
            {formData.order_type === 'delivery' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="delivery_address">Delivery Address</Label>
                  <Textarea
                    id="delivery_address"
                    name="delivery_address"
                    value={formData.delivery_address}
                    onChange={handleChange}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="delivery_instructions">Delivery Instructions</Label>
                  <Textarea
                    id="delivery_instructions"
                    name="delivery_instructions"
                    value={formData.delivery_instructions}
                    onChange={handleChange}
                    rows={2}
                  />
                </div>
              </>
            )}
          </div>
          
          {/* Order Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Order Items</h3>
            
            {/* Add Item Form */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Add Item</h4>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product_name">Product Name</Label>
                  <Input
                    id="product_name"
                    name="product_name"
                    value={currentItem.product_name}
                    onChange={handleItemChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unit_price">Unit Price</Label>
                  <Input
                    id="unit_price"
                    name="unit_price"
                    type="number"
                    step="0.01"
                    value={currentItem.unit_price}
                    onChange={handleItemChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={currentItem.quantity}
                    onChange={handleItemChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Total</Label>
                  <div className="h-9 px-3 py-2 border rounded-md bg-muted">
                    ${currentItem.total_price || '0.00'}
                  </div>
                </div>
              </div>
              
              <Button type="button" onClick={addItem} variant="outline">
                Add Item
              </Button>
            </div>
            
            {/* Items List */}
            {formData.items.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Items ({formData.items.length})</h4>
                {formData.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium">{item.product_name}</span>
                      <span className="text-muted-foreground ml-2">
                        {item.quantity} × ${item.unit_price} = ${item.total_price}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                
                <div className="text-right font-semibold text-lg">
                  Order Total: ${formData.total || '0.00'}
                </div>
              </div>
            )}
          </div>
          
        </form>
      </ModalBody>
      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || formData.items.length === 0}
          onClick={() => document.getElementById('create-order-form').requestSubmit()}
        >
          {loading ? 'Creating...' : 'Create Order'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CreateOrderModal;