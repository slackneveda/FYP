// cspell:disable
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Banknote, Clock, MapPin, Phone, Store, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { AuroraText } from '@/components/ui/aurora-text';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { useCart } from '@/contexts/CartProvider';
import { useAuth } from '@/contexts/AuthContext';
import { formatPriceWithCurrency } from '@/utils/priceUtils';

const TakeAwayInfoPage = () => {
  const navigate = useNavigate();
  const { items, getTotalItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username || '',
    phone: user?.phone || '',
    email: user?.email || '',
    pickupTime: '',
    specialInstructions: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate totals
  const subtotal = getTotalPrice();
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleInputChange = (field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };



  const handleSubmitOrder = async () => {
    // Validate required fields - phone is required for all users
    const requiredFieldsEmpty = !customerInfo.name || 
      !customerInfo.phone || // Phone is required for all users
      !customerInfo.pickupTime;
    
    if (requiredFieldsEmpty) {
      alert('Please fill in all required fields (Name, Phone, and Pickup Time)');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data for backend
      const orderData = {
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        pickup_time: customerInfo.pickupTime,
        special_instructions: customerInfo.specialInstructions,
        payment_method: paymentMethod,
        items: items.map(item => ({
          name: item.name,
          price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
          quantity: item.quantity,
          image: item.image,
          customizations: item.customizations || {}
        }))
      };
      
      console.log('📋 Prepared order data:', orderData);
      console.log('👤 Customer info:', customerInfo);

      // For online payment, redirect to checkout with takeaway data
      if (paymentMethod === 'online') {
        // Store takeaway info in localStorage for checkout process
        localStorage.setItem('takeawayInfo', JSON.stringify({
          name: customerInfo.name,
          phone: customerInfo.phone,
          email: customerInfo.email,
          pickupTime: customerInfo.pickupTime,
          specialInstructions: customerInfo.specialInstructions,
          paymentMethod,
          orderType: 'takeaway',
          orderData
        }));
        navigate('/checkout');
      } else {
        // For pay-at-store, create order directly
        const response = await fetch('http://localhost:8000/api/takeaway/create-order/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create order');
        }

        const result = await response.json();
        
        if (result.success) {
          console.log('Takeaway order created successfully:', result);
          
          // Clear cart and redirect to order confirmation
          clearCart();
          
          // Navigate to order confirmation page with takeaway details
          navigate(`/order-confirmation?orderNumber=${result.order_number}&type=takeaway&total=${getTotalPrice()}&customerName=${encodeURIComponent(customerInfo.name)}&pickupTime=${encodeURIComponent(customerInfo.pickupTime)}&paymentMethod=store`);
        } else {
          throw new Error('Failed to create takeaway order');
        }
      }
    } catch (error) {
      console.error('Error submitting takeaway order:', error);
      alert(`There was an error processing your order: ${error.message}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate pickup time options (next 4 hours in 30-minute intervals)
  const generatePickupTimes = () => {
    const times = [];
    const now = new Date();
    
    // Get the next whole hour
    const nextHour = new Date();
    nextHour.setHours(now.getHours() + 1, 0, 0, 0); // Next hour, 0 minutes, 0 seconds, 0 milliseconds
    
    // Generate 8 hourly slots starting from next hour
    for (let i = 0; i < 8; i++) {
      const time = new Date(nextHour.getTime() + i * 60 * 60000); // Add i hours
      const timeString = time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
      const dateString = time.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      // Clean format: "1:00 PM - Sep 24"
      times.push({
        value: `${timeString} - ${dateString}`,
        label: `${timeString} - ${dateString}`,
        isoValue: time.toISOString()
      });
    }
    return times;
  };

  const pickupTimes = generatePickupTimes();
  
  // Debug logging (can be removed in production)
  // console.log('Current customerInfo:', customerInfo);



  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/order-type')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Order Type
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              <AuroraText>Takeaway Information</AuroraText>
            </h1>
            <p className="text-muted-foreground">
              Complete your pickup order details
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Customer Information - Only show for non-authenticated users */}
            {!user && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="h-5 w-5" />
                    <span>Contact Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={customerInfo.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        placeholder="+92 300 1234567"
                        value={customerInfo.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={customerInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Logged in user info display with phone input */}
            {user && (
              <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-primary">
                    <CheckCircle className="h-5 w-5" />
                    <span>Account Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Name</Label>
                        <p className="text-foreground">{customerInfo.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm text-muted-foreground">{customerInfo.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userPhone">Phone Number *</Label>
                      <Input
                        id="userPhone"
                        placeholder="+92 300 1234567"
                        value={customerInfo.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                        className="bg-background"
                      />
                      <p className="text-xs text-muted-foreground">
                        📱 Phone number is required for order updates and pickup coordination
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pickup Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Store className="h-5 w-5" />
                  <span>Pickup Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pickupTime">Preferred Pickup Time *</Label>
                  <select
                    id="pickupTime"
                    className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={customerInfo.pickupTime || ""}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      handleInputChange('pickupTime', selectedValue);
                    }}
                    required
                  >
                    <option value="">Select pickup time</option>
                    {pickupTimes.map((time, index) => (
                      <option key={index} value={time.value}>
                        {time.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Any special requests or dietary requirements..."
                    value={customerInfo.specialInstructions}
                    onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    💾 These instructions will be saved with your order and visible to our team
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment Method</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="online">Pay Online Now (Recommended)</option>
                    <option value="store">Pay at Store</option>
                  </Select>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-lg text-sm">
                  {paymentMethod === 'online' ? (
                    <p className="text-muted-foreground">
                      💳 Secure online payment with card or digital wallet
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      💰 Pay with cash or card when you pick up your order
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.cartId} className="flex justify-between items-start text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">
                          {formatPriceWithCurrency((typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <hr />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal ({getTotalItems()} items)</span>
                      <span>{formatPriceWithCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pickup Fee</span>
                      <span className="text-green-600">FREE</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>{formatPriceWithCurrency(tax)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>{formatPriceWithCurrency(total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Store Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pickup Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                      <div>
                        <p className="font-medium">Sweet Dessert Bakery</p>
                        <p className="text-muted-foreground">123 Sweet Street, Dessert District</p>
                        <p className="text-muted-foreground">City Center, Your City 12345</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Open: 8 AM - 10 PM</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>+92 300 1234567</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <ShimmerButton 
                className="w-full" 
                size="lg"
                onClick={handleSubmitOrder}
                disabled={isSubmitting || !customerInfo.name || !customerInfo.phone || !customerInfo.pickupTime}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Processing...
                  </>
                ) : paymentMethod === 'online' ? (
                  'Continue to Payment'
                ) : (
                  'Confirm Order'
                )}
              </ShimmerButton>

              {paymentMethod === 'store' && (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Your order will be confirmed. Please pay the full amount ({formatPriceWithCurrency(total)}) when you arrive at the store.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeAwayInfoPage;