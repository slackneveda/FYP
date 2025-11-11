import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Truck, Clock, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatPriceWithCurrency } from '@/utils/priceUtils';

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    console.log('🔍 OrderConfirmationPage: Loading...');
    console.log('📋 Search params:', Object.fromEntries(searchParams.entries()));
    
    // Get order data from URL params
    const orderNumber = searchParams.get('orderNumber');
    const orderType = searchParams.get('type') || 'delivery';
    const total = searchParams.get('total');
    const customerName = searchParams.get('customerName');
    const pickupTime = searchParams.get('pickupTime');
    const paymentMethod = searchParams.get('paymentMethod');

    console.log('📊 Extracted data:', {
      orderNumber,
      orderType,
      total,
      customerName,
      pickupTime,
      paymentMethod
    });

    if (orderNumber && customerName) {
      const orderData = {
        orderNumber,
        orderType,
        total: parseFloat(total) || 0,
        customerName: decodeURIComponent(customerName),
        pickupTime: pickupTime ? decodeURIComponent(pickupTime) : null,
        paymentMethod
      };
      
      console.log('✅ Setting order data:', orderData);
      setOrderData(orderData);
    } else {
      // Try to get from sessionStorage as fallback
      console.log('⚠️ Missing URL params, checking sessionStorage...');
      const backupData = sessionStorage.getItem('lastOrderData');
      
      if (backupData) {
        try {
          const parsedData = JSON.parse(backupData);
          console.log('🔄 Using backup data:', parsedData);
          setOrderData(parsedData);
          // Clean up
          sessionStorage.removeItem('lastOrderData');
        } catch (error) {
          console.error('❌ Error parsing backup data:', error);
          console.log('🏠 Redirecting to home - no valid order data found');
          navigate('/');
        }
      } else {
        console.log('🏠 No backup data found, redirecting to home');
        navigate('/');
      }
    }
  }, [searchParams, navigate]);

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Loading your order confirmation...</h3>
            <p className="text-muted-foreground">Please wait while we prepare your order details.</p>
          </div>
          {/* Debug info in development */}
          {import.meta.env.DEV && (
            <div className="mt-8 p-4 bg-muted/50 rounded-lg text-left max-w-md">
              <p className="text-sm font-mono">Debug: Waiting for order data</p>
              <p className="text-xs text-muted-foreground">URL: {window.location.href}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const isTakeaway = orderData.orderType === 'takeaway';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Order Confirmed Title */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">
              Order Confirmed!
            </h1>
            <p className="text-2xl font-semibold text-muted-foreground">
              Order #{orderData.orderNumber}
            </p>
          </div>

          {/* Thank You Message */}
          <p className="text-lg text-muted-foreground">
            Thank you, {orderData.customerName}! Your {isTakeaway ? 'takeaway' : 'delivery'} order has been confirmed.
          </p>

          {/* Order Details Card */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
            <CardContent className="p-8">
              <div className="flex items-center justify-center space-x-3 mb-6">
                {isTakeaway ? (
                  <Package className="w-6 h-6 text-amber-700" />
                ) : (
                  <Truck className="w-6 h-6 text-amber-700" />
                )}
                <h3 className="text-xl font-semibold text-amber-800">
                  {isTakeaway ? 'Pickup Details' : 'Delivery Details'}
                </h3>
              </div>

              <div className="space-y-4 text-amber-800">
                {isTakeaway ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">Time:</span>
                      </span>
                      <span>{orderData.pickupTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4" />
                        <span className="font-medium">Payment:</span>
                      </span>
                      <span>
                        {orderData.paymentMethod === 'store' 
                          ? 'Pay at store (Cash/Card accepted)' 
                          : 'Paid online'
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total:</span>
                      <span className="text-lg font-bold">{formatPriceWithCurrency(orderData.total)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">Delivery:</span>
                      </span>
                      <span>To your address</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">Time:</span>
                      </span>
                      <span>30-45 minutes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4" />
                        <span className="font-medium">Payment:</span>
                      </span>
                      <span>Paid online</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total:</span>
                      <span className="text-lg font-bold">{formatPriceWithCurrency(orderData.total)}</span>
                    </div>
                  </>
                )}
              </div>

              {isTakeaway && (
                <div className="mt-6 p-4 bg-amber-100 rounded-lg text-center">
                  <MapPin className="w-5 h-5 text-amber-700 mx-auto mb-2" />
                  <p className="font-medium text-amber-800">Pickup Location</p>
                  <p className="text-sm text-amber-700">Sweet Dessert Store</p>
                  <p className="text-sm text-amber-700">123 Main Street, Downtown</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="space-y-4 text-muted-foreground">
            {isTakeaway ? (
              <>
                <p>We'll have your order ready by the pickup time.</p>
                <p>Please bring this order number: <span className="font-semibold text-foreground">{orderData.orderNumber}</span></p>
              </>
            ) : (
              <>
                <p>We're preparing your order and will deliver it soon!</p>
                <p>You'll receive updates about your delivery status.</p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-semibold"
            >
              Continue Shopping
            </Button>
            <Button
              onClick={() => navigate('/menu')}
              variant="outline"
              className="px-8 py-3 rounded-lg font-semibold"
            >
              View Menu
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;