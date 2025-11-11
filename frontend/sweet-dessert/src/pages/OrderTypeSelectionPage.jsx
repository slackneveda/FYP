// cspell:disable
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Truck, Store, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuroraText } from '@/components/ui/aurora-text';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { useCart } from '@/contexts/CartProvider';
import { formatPriceWithCurrency } from '@/utils/priceUtils';

const OrderTypeSelectionPage = () => {
  const navigate = useNavigate();
  const { getTotalPrice, getTotalItems } = useCart();
  
  console.log('OrderTypeSelectionPage loaded - Total items:', getTotalItems(), 'Total price:', getTotalPrice());

  const handleOrderTypeSelection = (type) => {
    console.log('Order type selected:', type);
    if (type === 'delivery') {
      console.log('Navigating to checkout');
      navigate('/checkout');
    } else if (type === 'takeaway') {
      console.log('Navigating to takeaway-info');
      navigate('/takeaway-info');
    }
  };

  // Calculate delivery fee
  const deliveryFee = getTotalPrice() > 2500 ? 0 : 499;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/cart')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              <AuroraText>Choose Your Order Type</AuroraText>
            </h1>
            <p className="text-muted-foreground">
              How would you like to receive your {getTotalItems()} delicious items?
            </p>
          </div>
        </div>

        {/* Order Type Selection Cards */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Delivery Option */}
            <Card className="relative group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Truck className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Home Delivery
                </CardTitle>
                <p className="text-muted-foreground">
                  Get your desserts delivered to your doorstep
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">30-45 minutes delivery</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">Delivered to your address</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Delivery Fee:</span>
                    {deliveryFee === 0 ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        FREE
                      </Badge>
                    ) : (
                      <span className="text-sm font-semibold">{formatPriceWithCurrency(deliveryFee)}</span>
                    )}
                  </div>
                  {deliveryFee > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <p className="text-xs text-green-700 dark:text-green-400">
                        💡 Add {formatPriceWithCurrency(2500 - getTotalPrice())} more for FREE delivery!
                      </p>
                    </div>
                  )}
                </div>
                
                <ShimmerButton 
                  className="w-full mt-6" 
                  size="lg"
                  onClick={() => handleOrderTypeSelection('delivery')}
                >
                  Choose Delivery
                </ShimmerButton>
              </CardContent>
            </Card>

            {/* Take Away Option */}
            <Card className="relative group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-orange-100 dark:bg-orange-900/30 rounded-full w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Store className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Store Pickup
                </CardTitle>
                <p className="text-muted-foreground">
                  Pick up your order from our store
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <span className="text-sm">Ready in 15-20 minutes</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-orange-600" />
                    <span className="text-sm">Pick up from store</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pickup Fee:</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      FREE
                    </Badge>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                    <p className="text-xs text-orange-700 dark:text-orange-400">
                      🎉 Save on delivery charges and get your order faster!
                    </p>
                  </div>
                </div>
                
                <ShimmerButton 
                  variant="caramel" 
                  className="w-full mt-6" 
                  size="lg"
                  onClick={() => {
                    console.log('Choose Pickup button clicked');
                    handleOrderTypeSelection('takeaway');
                  }}
                >
                  Choose Pickup
                </ShimmerButton>
              </CardContent>
            </Card>
            
          </div>

          {/* Store Information */}
          <Card className="mt-8 bg-muted/30">
            <CardHeader>
              <CardTitle className="text-center">
                <AuroraText>Our Store Location</AuroraText>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="space-y-2">
                <p className="font-semibold">Sweet Dessert Bakery</p>
                <p className="text-muted-foreground">123 Sweet Street, Dessert District</p>
                <p className="text-muted-foreground">City Center, Your City 12345</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-1">
                  <p className="font-medium text-sm">Store Hours</p>
                  <p className="text-sm text-muted-foreground">Mon-Sat: 8:00 AM - 10:00 PM</p>
                  <p className="text-sm text-muted-foreground">Sunday: 9:00 AM - 9:00 PM</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm">Contact</p>
                  <p className="text-sm text-muted-foreground">Phone: +92 300 1234567</p>
                  <p className="text-sm text-muted-foreground">Email: orders@sweetdessert.com</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderTypeSelectionPage;