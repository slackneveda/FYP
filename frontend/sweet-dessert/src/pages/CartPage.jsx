// cspell:disable
import React, { useEffect } from 'react';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { useCart } from '@/contexts/CartProvider';
import { formatPriceWithCurrency } from '@/utils/priceUtils';

const CartPage = () => {
  const { items, removeItem, updateQuantity, getTotalItems, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  // Debug logging
  console.log('CartPage items:', items);
  console.log('Total items:', getTotalItems());

  // Redirect to home if cart is empty on page load/refresh
  useEffect(() => {
    if (items.length === 0) {
      console.log('Cart is empty on page load, redirecting to home...');
      // Small delay to prevent immediate redirect on mount
      const timer = setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [items.length, navigate]);

  const handleQuantityChange = (cartId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateQuantity(cartId, newQuantity);
    }
  };

  const deliveryFee = getTotalPrice() > 2500 ? 0 : 499;
  const tax = getTotalPrice() * 0.08;
  const total = getTotalPrice() + deliveryFee + tax;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="text-6xl">🛒</div>
          <h1 className="text-3xl font-bold text-foreground">Your cart is empty</h1>
          <p className="text-muted-foreground">
            Looks like you haven't added any desserts to your cart yet.
          </p>
          <ShimmerButton asChild size="lg">
            <Link to="/menu">Start Shopping</Link>
          </ShimmerButton>
        </div>
      </div>
    );
  }

  try {
    return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="ghost" asChild>
          <Link to="/menu">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
          <p className="text-muted-foreground">{getTotalItems()} items in your cart</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.cartId}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image || '/placeholder.jpg'}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      console.error('Image failed to load:', item.image);
                      e.target.src = '/placeholder.jpg';
                    }}
                  />
                  
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatPriceWithCurrency(item.price)} each
                    </p>
                    {item.customizations && Object.keys(item.customizations).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(item.customizations).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key}: {value}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.cartId, item.quantity, -1)}
                      className="h-8 w-8"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.cartId, item.quantity, 1)}
                      className="h-8 w-8"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Item Total & Remove */}
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-lg">
                      {formatPriceWithCurrency((typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.cartId)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Clear Cart */}
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({getTotalItems()} items)</span>
                  <span>{formatPriceWithCurrency(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatPriceWithCurrency(deliveryFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatPriceWithCurrency(tax)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPriceWithCurrency(total)}</span>
                </div>
              </div>

              {deliveryFee > 0 && (
                <div className="bg-muted/50 p-3 rounded-lg text-sm">
                  <p className="text-muted-foreground">
                    Add {formatPriceWithCurrency(2500 - getTotalPrice())} more for FREE delivery!
                  </p>
                </div>
              )}

              <ShimmerButton className="w-full" size="lg" asChild>
                <Link to="/order-type">Proceed to Checkout</Link>
              </ShimmerButton>

              <div className="text-xs text-muted-foreground text-center">
                Secure checkout powered by Stripe
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error('CartPage rendering error:', error);
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="text-6xl">⚠️</div>
          <h1 className="text-3xl font-bold text-foreground">Cart Error</h1>
          <p className="text-muted-foreground">
            There was an error loading your cart. Please try refreshing the page.
          </p>
          <ShimmerButton 
            size="lg" 
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </ShimmerButton>
        </div>
      </div>
    );
  }
};

export default CartPage;