// cspell:disable
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PaymentElement,
  AddressElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { AlertCircle, CheckCircle, CreditCard, MapPin, User, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartProvider';
import { formatPriceWithCurrency } from '@/utils/priceUtils';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api';

const CheckoutForm = ({ clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { items, getTotalItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    email: isAuthenticated ? user?.email || '' : '',
    phone: '',
    name: isAuthenticated ? user?.username || '' : ''
  });

  // Check if this is a takeaway order and get customer info from localStorage
  const takeawayInfo = JSON.parse(localStorage.getItem('takeawayInfo') || 'null');
  const isTakeawayOrder = !!takeawayInfo;

  // Calculate totals based on order type
  const deliveryFee = isTakeawayOrder ? 0 : (getTotalPrice() > 25 ? 0 : 4.99);
  const tax = getTotalPrice() * 0.08;
  const total = getTotalPrice() + deliveryFee + tax;



  useEffect(() => {
    if (!stripe) return;

    if (clientSecret === 'demo_client_secret') {
      setMessage('⚠️ Demo Mode: Using test data (Django backend not connected)');
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case 'succeeded':
          setMessage('✅ Payment succeeded!');
          break;
        case 'processing':
          setMessage('🔄 Your payment is processing...');
          break;
        case 'requires_payment_method':
          setMessage('⚠️ Payment failed. Please try again.');
          break;
        default:
          setMessage('⚠️ Something went wrong.');
          break;
      }
    });
  }, [stripe, clientSecret]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);
    setMessage(null);

    // Debug logging
    console.log('🔍 Debug: isAuthenticated =', isAuthenticated);
    console.log('🔍 Debug: isTakeawayOrder =', isTakeawayOrder);
    console.log('🔍 Debug: takeawayInfo =', takeawayInfo);
    console.log('🔍 Debug: customerInfo =', customerInfo);

    // Skip ALL validation for takeaway orders (customer info already collected)
    if (isTakeawayOrder) {
      console.log('✅ Takeaway order detected - skipping all validation');
    } else {
      // Validate customer info for delivery orders only
      if (!isAuthenticated && (!customerInfo.email || !customerInfo.phone || !customerInfo.name)) {
        setMessage('❌ Please fill in all customer information fields.');
        setIsLoading(false);
        return;
      }
      
      // Validate phone for authenticated users doing delivery only
      if (isAuthenticated && !customerInfo.phone) {
        setMessage('❌ Please provide a phone number for delivery.');
        setIsLoading(false);
        return;
      }
    }

    try {
      console.log('🚀 Payment form submitted');
      console.log('✅ Starting payment process with customer info:', customerInfo);

      // Get address data from AddressElement before confirming payment
      const addressElement = elements.getElement('address');
      let addressData = null;
      
      if (addressElement && !isTakeawayOrder) {
        const addressResult = await addressElement.getValue();
        if (addressResult.complete) {
          addressData = addressResult.value;
          console.log('📍 Captured address data:', addressData);
        } else {
          // Address is incomplete
          setMessage('⚠️ Please complete your delivery address before proceeding.');
          setIsLoading(false);
          return;
        }
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/checkout/success',
        },
        redirect: 'if_required'
      });

      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setMessage(`❌ ${error.message}`);
        } else {
          setMessage('❌ An unexpected error occurred.');
        }
        console.error('❌ Stripe payment error:', error);
      } else {
        // Payment succeeded - get the payment intent
        const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
        console.log('🎉 Payment succeeded with Stripe:', paymentIntent);

        // SAVE PAYMENT AND ORDER TO DJANGO BACKEND
        console.log('💳 Payment successful - saving to backend and redirecting');
        
        // Check if this is a takeaway order
        const takeawayInfo = localStorage.getItem('takeawayInfo');
        
        if (takeawayInfo) {
          // Handle takeaway order with online payment
          const takeawayData = JSON.parse(takeawayInfo);
          console.log('Processing takeaway order payment completion:', takeawayData);
          
          try {
            // Create the takeaway order now that payment is confirmed
            const takeawayOrderData = {
              ...takeawayData.orderData,
              payment_intent_id: paymentIntent.id,
              payment_method: 'online',  // Ensure payment method is set to online
              payment_status: 'paid',    // Mark payment as completed
              status: 'confirmed'        // Mark order as confirmed
            };
            
            console.log('🚀 Sending takeaway order data to backend:', takeawayOrderData);
            
            const response = await fetch('http://localhost:8000/api/takeaway/create-order/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(takeawayOrderData)
            });
            
            if (response.ok) {
              const result = await response.json();
              console.log('✅ Takeaway order created after payment:', result);
              
              // Clean up takeaway info
              localStorage.removeItem('takeawayInfo');
              
              // Navigate to order confirmation page with takeaway details FIRST
              const confirmationUrl = `/order-confirmation?orderNumber=${result.order_number}&type=takeaway&total=${result.total || total}&customerName=${encodeURIComponent(takeawayData.name)}&pickupTime=${encodeURIComponent(takeawayData.pickupTime)}&paymentMethod=online`;
              
              // Store backup data
              sessionStorage.setItem('lastTakeawayOrder', JSON.stringify({
                orderNumber: result.order_number,
                type: 'takeaway',
                total: result.total || total,
                customerName: takeawayData.name,
                pickupTime: takeawayData.pickupTime,
                paymentMethod: 'online'
              }));
              
              navigate(confirmationUrl, { replace: true });
              
              // Clear cart after navigation
              setTimeout(() => {
                console.log('🧹 Clearing cart after takeaway navigation...');
                clearCart();
              }, 300);
              return;
            } else {
              const errorData = await response.json();
              console.error('⚠️ Takeaway order creation failed:', errorData);
            }
          } catch (error) {
            console.error('⚠️ Takeaway order processing error:', error);
          }
        }
        
        // Regular delivery order processing
        const finalCustomerInfo = isAuthenticated ? {
          name: user?.username || '',
          email: user?.email || '',
          phone: customerInfo.phone || '' // Still need phone for authenticated users
        } : customerInfo;

        const finalOrderData = {
          items,
          total,
          customerInfo: finalCustomerInfo,
          timestamp: new Date().toISOString(),
          paymentIntentId: paymentIntent.id,
          orderId: 'ORD-' + Date.now()
        };

        try {
          // Send order to Django backend
          console.log('🔄 Sending delivery order to Django backend...');
          const orderResponse = await fetch('http://localhost:8000/api/orders/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              customer_name: finalCustomerInfo.name,
              customer_email: finalCustomerInfo.email,
              customer_phone: finalCustomerInfo.phone,
              delivery_address: addressData, // Include captured address data
              items: items.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
              })),
              subtotal: getTotalPrice(),
              delivery_fee: deliveryFee,
              tax: tax,
              total: total,
              payment_intent_id: paymentIntent.id,
              status: 'confirmed',
              order_id: finalOrderData.orderId
            })
          });

          if (orderResponse.ok) {
            const backendOrder = await orderResponse.json();
            console.log('✅ Delivery order saved to Django backend:', backendOrder);
            finalOrderData.backendId = backendOrder.id;
            finalOrderData.orderId = backendOrder.order_id || finalOrderData.orderId;
          } else {
            const errorData = await orderResponse.json();
            console.error('⚠️ Backend save failed:', errorData);
            // Continue anyway - don't block user experience
          }
        } catch (backendError) {
          console.error('⚠️ Backend connection failed:', backendError);
          // Continue anyway - don't block user experience
        }

        // Save to localStorage for order history (backup)
        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        existingOrders.push(finalOrderData);
        localStorage.setItem('orders', JSON.stringify(existingOrders));

        console.log('✅ Order processing complete:', finalOrderData);
        
        // DON'T clear cart yet - wait until after successful navigation
        console.log('📋 Keeping cart data until after navigation...');
        
        // Navigate to order confirmation page with enhanced debugging
        console.log('🚀 Preparing to navigate to order confirmation page');
        console.log('📊 Final order data:', finalOrderData);
        console.log('💰 Total amount:', total);
        console.log('👤 Customer info:', finalCustomerInfo);
        
        try {
          // Validate required data before navigation
          if (!finalCustomerInfo.name) {
            throw new Error('Customer name is missing');
          }
          
          const orderNumber = finalOrderData.backendId ? 
            `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(finalOrderData.backendId).padStart(3, '0')}` :
            finalOrderData.orderId;
          
          if (!orderNumber) {
            throw new Error('Order number could not be generated');
          }
          
          const confirmationUrl = `/order-confirmation?orderNumber=${orderNumber}&type=delivery&total=${total}&customerName=${encodeURIComponent(finalCustomerInfo.name)}&paymentMethod=online`;
          
          console.log('🔗 Confirmation URL:', confirmationUrl);
          console.log('✅ Navigating to order confirmation...');
          
          // Store order data in sessionStorage as backup
          const backupData = {
            orderNumber,
            type: 'delivery',
            total,
            customerName: finalCustomerInfo.name,
            paymentMethod: 'online',
            timestamp: new Date().toISOString(),
            paymentIntentId: paymentIntent.id
          };
          
          sessionStorage.setItem('lastOrderData', JSON.stringify(backupData));
          console.log('💾 Stored backup data:', backupData);
          
          // Small delay to ensure state is updated
          setTimeout(() => {
            navigate(confirmationUrl, { replace: true });
            
            // Only clear cart after successful navigation
            setTimeout(() => {
              console.log('🧹 Clearing cart after successful navigation...');
              clearCart();
            }, 500);
          }, 100);
          
        } catch (navigationError) {
          console.error('❌ Navigation error:', navigationError);
          console.error('📊 Error context:', {
            finalOrderData,
            finalCustomerInfo,
            total,
            paymentIntent: paymentIntent?.id
          });
          
          // Show user-friendly error with order details
          const orderRef = finalOrderData.orderId || paymentIntent.id;
          alert(`✅ Payment Successful!\n\nYour order has been processed successfully.\nOrder Reference: ${orderRef}\n\nYou will receive a confirmation email shortly.`);
          
          // Fallback navigation to orders page
          navigate('/orders', { replace: true });
        }
      }
    } catch (generalError) {
      console.error('❌ General payment error:', generalError);
      setMessage('❌ Payment processing failed. Please try again.');
    }

    setIsLoading(false);
  };

  const handleInputChange = (field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <form id="payment-form" onSubmit={handleSubmit} className="space-y-8">
        <div className={`grid grid-cols-1 gap-8 ${isAuthenticated ? 'lg:grid-cols-5' : 'lg:grid-cols-3'}`}>
          {/* Left Column - Customer Information & Payment */}
          <div className={`space-y-6 ${isAuthenticated ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
            {/* Show Customer Information and Address only for guest users doing delivery */}
            {!isAuthenticated && !isTakeawayOrder && (
              <>
                {/* Customer Information */}
                <Card className="border-2 hover:border-primary/20 transition-colors">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <User className="h-5 w-5 text-primary" />
                      <span>Customer Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Full Name *
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter your full name"
                        value={customerInfo.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={customerInfo.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Phone Number *
                      </label>
                      <Input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={customerInfo.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Address Information */}
                <Card className="border-2 hover:border-primary/20 transition-colors">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span>Delivery Address</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AddressElement 
                      options={{
                        mode: 'shipping',
                        autocomplete: {
                          mode: 'automatic'
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              </>
            )}

            {/* Show welcome message and phone input for authenticated users doing delivery */}
            {isAuthenticated && !isTakeawayOrder && (
              <>
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <CheckCircle className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="font-semibold text-foreground">Welcome back, {user?.username}!</h3>
                        <p className="text-sm text-muted-foreground">
                          We'll use your saved account information for this order.
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1 mb-4">
                      <p><span className="font-medium">Email:</span> {user?.email}</p>
                      <p><span className="font-medium">Name:</span> {user?.username}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Phone Number for Delivery *
                      </label>
                      <Input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={customerInfo.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Delivery Address Form for Authenticated Users */}
                <Card className="border-2 hover:border-primary/20 transition-colors">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span>Delivery Address</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AddressElement 
                      options={{
                        mode: 'shipping',
                        autocomplete: {
                          mode: 'automatic'
                        },
                        defaultValues: {
                          name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username || '',
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              </>
            )}

            {/* Show simplified info for takeaway orders */}
            {isTakeawayOrder && (
              <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Package className="h-6 w-6 text-amber-700" />
                    <div>
                      <h3 className="font-semibold text-amber-800">Takeaway Order Confirmation</h3>
                      <p className="text-sm text-amber-700">
                        Your order details have been saved. Complete payment to confirm your pickup.
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-amber-700 space-y-1">
                    <p><span className="font-medium">Customer:</span> {takeawayInfo.name}</p>
                    <p><span className="font-medium">Phone:</span> {takeawayInfo.phone}</p>
                    {takeawayInfo.email && <p><span className="font-medium">Email:</span> {takeawayInfo.email}</p>}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Method */}
            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span>Payment Method</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentElement 
                  id="payment-element"
                  options={{
                    layout: 'tabs',
                    paymentMethodOrder: ['card'],
                    wallets: {
                      applePay: 'never',
                      googlePay: 'never'
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className={`space-y-6 ${isAuthenticated ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
            {/* Takeaway Info Card */}
            {isTakeawayOrder && (
              <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg text-amber-800">
                    <Package className="h-5 w-5" />
                    <span>Takeaway Order</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="font-medium text-amber-700">Customer:</span>
                      <p className="text-amber-800">{takeawayInfo.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-amber-700">Phone:</span>
                      <p className="text-amber-800">{takeawayInfo.phone}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-amber-700">Pickup Time:</span>
                      <p className="text-amber-800">{takeawayInfo.pickupTime}</p>
                    </div>
                    {takeawayInfo.specialInstructions && (
                      <div className="col-span-2">
                        <span className="font-medium text-amber-700">Special Instructions:</span>
                        <p className="text-amber-800">{takeawayInfo.specialInstructions}</p>
                      </div>
                    )}
                  </div>
                  <div className="bg-amber-100 p-3 rounded-lg text-center">
                    <p className="text-amber-800 font-medium">
                      📍 Pickup Location: Sweet Dessert Store
                    </p>
                    <p className="text-amber-700 text-xs mt-1">
                      123 Main Street, Downtown
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card className="border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-primary/10 sticky top-4 min-w-[350px]">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center justify-between text-xl">
                  <span>Order Summary</span>
                  <Badge variant="secondary" className="text-sm">
                    {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={`${item.id}-${JSON.stringify(item.customizations)}`} 
                         className="flex justify-between items-start p-4 rounded-lg bg-background/80 border border-border/50">
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="font-medium text-base text-foreground truncate">{item.name}</h4>
                        {item.customizations && Object.keys(item.customizations).length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1 space-y-1">
                            {Object.entries(item.customizations).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span> {value}
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-base">{formatPriceWithCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Cost Breakdown */}
                <div className="space-y-3 text-sm bg-background/50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPriceWithCurrency(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {isTakeawayOrder ? 'Pickup Fee' : 'Delivery Fee'}
                    </span>
                    <span className={deliveryFee === 0 ? "text-green-600 font-semibold" : "font-medium"}>
                      {deliveryFee === 0 ? 'FREE' : formatPriceWithCurrency(deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span className="font-medium">{formatPriceWithCurrency(tax)}</span>
                  </div>
                  {deliveryFee === 0 && (
                    <p className="text-xs text-green-600 font-medium flex items-center">
                      🎉 Free delivery on orders over RS 25!
                    </p>
                  )}
                  <Separator className="my-3" />
                  <div className="flex justify-between text-lg font-bold text-foreground bg-primary/5 p-3 rounded-md">
                    <span>Total</span>
                    <span>{formatPriceWithCurrency(total)}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <ShimmerButton
                  disabled={isLoading || !stripe || !elements}
                  type="submit"
                  variant="chocolate"
                  className="w-full h-14 text-base font-semibold mt-6 px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] rounded-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing Payment...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Complete Order - {formatPriceWithCurrency(total)}</span>
                    </div>
                  )}
                </ShimmerButton>

                {/* Status Messages */}
                {message && (
                  <div className={`mt-4 p-3 rounded-lg text-sm text-center ${
                    message.includes('❌') 
                      ? 'bg-red-50 text-red-600 border border-red-200' 
                      : message.includes('✅')
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                  }`}>
                    <AlertCircle className="inline h-4 w-4 mr-2" />
                    {message}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Powered by</span>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 rounded-sm flex items-center justify-center" style={{backgroundColor: '#993809'}}>
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Stripe</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;