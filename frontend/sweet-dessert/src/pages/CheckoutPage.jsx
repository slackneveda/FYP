import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartProvider';
import { useTheme } from '@/contexts/ThemeProvider';
import ApiService from '@/services/api';


// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items } = useCart();
  const { theme } = useTheme();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);

  // Detect if we're in dark mode
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const createPaymentIntent = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if this is a takeaway order
      const takeawayInfo = localStorage.getItem('takeawayInfo');
      
      if (takeawayInfo) {
        // This is a takeaway order with online payment
        const takeawayData = JSON.parse(takeawayInfo);
        console.log('Creating payment intent for takeaway order:', takeawayData);
        
        // Use takeaway-specific payment intent
        const response = await fetch('http://localhost:8000/api/takeaway/create-payment-intent/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(takeawayData.orderData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create takeaway payment intent');
        }
        
        const data = await response.json();
        setClientSecret(data.client_secret);
        
      } else {
        // Regular delivery order
        const orderData = {
          items: items.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            customizations: item.customizations || {}
          })),
          customer_info: {
            name: '',
            email: '',
            phone: ''
          }
        };
        
        // Use API service to create payment intent
        const data = await ApiService.createPaymentIntent(orderData);
        setClientSecret(data.client_secret);
      }
      
    } catch (error) {
      console.error('Error creating payment intent:', error);
      // Show error message to user
      alert('Unable to setup payment. Please check if the Django backend is running on localhost:8000\n\nError: ' + error.message);
      setClientSecret('demo_client_secret'); // Fallback to demo mode
    } finally {
      setLoading(false);
    }
  }, [items]);

  useEffect(() => {
    // Redirect to cart if no items
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    // Create PaymentIntent (handles both delivery and takeaway)
    createPaymentIntent();
    
    // Cleanup function to remove takeaway info when component unmounts
    return () => {
      // Clean up takeaway info if checkout is successful
      // (This will be handled in the success callback)
    };
  }, [items.length, navigate, createPaymentIntent]);



  const appearance = {
    theme: 'stripe',
    variables: {
      // Primary theme colors
      colorPrimary: '#993809',
      colorPrimaryText: '#ffffff',
      
      // Background colors - adapting to theme
      colorBackground: isDarkMode ? '#1e293b' : '#ffffff',
      colorBackgroundSecondary: isDarkMode ? '#334155' : '#f8fafc',
      
      // Text colors - ensuring visibility in both light and dark modes
      colorText: isDarkMode ? '#ffffff' : '#1e293b',
      colorTextSecondary: isDarkMode ? '#e2e8f0' : '#64748b',
      colorTextPlaceholder: isDarkMode ? '#cbd5e1' : '#94a3b8',
      
      // Status colors
      colorDanger: '#ef4444',
      colorSuccess: '#22c55e',
      colorWarning: '#f59e0b',
      
      // Typography
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSizeBase: '16px',
      fontWeightNormal: '500',
      fontWeightMedium: '600',
      
      // Spacing and borders
      spacingUnit: '6px',
      borderRadius: '12px',
      
      // Icons
      colorIcon: '#993809',
      colorIconTab: '#64748b',
      colorIconTabSelected: '#993809',
      colorIconCardError: '#ef4444',
      colorIconCheckmark: '#22c55e',
      
      // Logo
      colorLogo: 'dark',
    },
    rules: {
      // Tab styling
      '.Tab': {
        border: isDarkMode ? '2px solid #475569' : '2px solid #e2e8f0',
        borderRadius: '12px',
        backgroundColor: isDarkMode ? '#334155' : '#ffffff',
        padding: '16px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease',
        color: isDarkMode ? '#ffffff' : '#1e293b',
        fontWeight: '500',
      },
      '.Tab:hover': {
        borderColor: '#993809',
        backgroundColor: isDarkMode ? '#475569' : '#f8fafc',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px -2px rgba(153, 56, 9, 0.2)',
      },
      '.Tab--selected': {
        borderColor: '#993809',
        backgroundColor: isDarkMode ? '#475569' : '#f3f4f6',
        color: '#993809',
        boxShadow: '0 4px 12px -2px rgba(153, 56, 9, 0.3)',
        fontWeight: '600',
      },
      
      // Input field styling
      '.Input': {
        borderRadius: '10px',
        border: isDarkMode ? '2px solid #475569' : '2px solid #e2e8f0',
        padding: '14px 16px',
        fontSize: '16px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        backgroundColor: isDarkMode ? '#334155' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#1e293b',
        minHeight: '48px',
      },
      '.Input:hover': {
        borderColor: isDarkMode ? '#64748b' : '#cbd5e1',
      },
      '.Input:focus': {
        borderColor: '#993809',
        boxShadow: '0 0 0 3px rgba(153, 56, 9, 0.1)',
        outline: 'none',
        backgroundColor: isDarkMode ? '#334155' : '#ffffff',
      },
      '.Input--invalid': {
        borderColor: '#ef4444',
        boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
      },
      
      // Label styling
      '.Label': {
        fontSize: '14px',
        fontWeight: '600',
        color: isDarkMode ? '#e2e8f0' : '#374151',
        marginBottom: '8px',
        display: 'block',
      },
      
      // Error message styling
      '.Error': {
        color: '#ef4444',
        fontSize: '14px',
        fontWeight: '500',
        marginTop: '6px',
      },
      
      // Container styling
      '.Container': {
        backgroundColor: 'transparent',
      },
      
      // Block styling for sections
      '.Block': {
        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
        borderRadius: '12px',
        padding: '4px',
        border: '1px solid transparent',
      },
      
      // Checkbox styling
      '.Checkbox': {
        backgroundColor: isDarkMode ? '#334155' : '#ffffff',
        borderColor: isDarkMode ? '#475569' : '#e2e8f0',
      },
      '.Checkbox:checked': {
        backgroundColor: '#993809',
        borderColor: '#993809',
      },
      
      // Text styling to ensure visibility
      '.Text': {
        color: isDarkMode ? '#ffffff' : '#1e293b',
        fontSize: '16px',
        fontWeight: '500',
      },
      '.Text--caption': {
        color: isDarkMode ? '#cbd5e1' : '#64748b',
        fontSize: '14px',
      }
    }
  };

  const options = {
    clientSecret,
    appearance,
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <h2 className="text-2xl font-semibold">Setting up your checkout...</h2>
          <p className="text-muted-foreground">Please wait while we prepare your payment.</p>
        </div>
      </div>
    );
  }



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
            <h1 className="text-3xl font-bold text-foreground">Secure Checkout</h1>
            <p className="text-muted-foreground">Complete your order securely</p>
          </div>
        </div>

        {/* Checkout Form */}
        {clientSecret && (
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm clientSecret={clientSecret} />
          </Elements>
        )}


      </div>
    </div>
  );
};

export default CheckoutPage;