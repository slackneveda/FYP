import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Clock, CreditCard } from 'lucide-react';
import { formatPriceWithCurrency } from '@/utils/priceUtils';

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state?.orderData;

  // Redirect if no order data
  React.useEffect(() => {
    if (!orderData) {
      console.log('❌ No order data found, redirecting to home');
      navigate('/', { replace: true });
    }
  }, [orderData, navigate]);

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Redirecting...</p>
        </div>
      </div>
    );
  }

  const confettiStyle = `
    @keyframes confetti-fall {
      0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
    }
    .confetti {
      position: absolute;
      width: 10px;
      height: 10px;
      animation: confetti-fall 3s linear infinite;
    }
    .confetti:nth-child(1) { left: 10%; animation-delay: 0s; background: #ff6b6b; }
    .confetti:nth-child(2) { left: 20%; animation-delay: 0.5s; background: #4ecdc4; }
    .confetti:nth-child(3) { left: 30%; animation-delay: 1s; background: #45b7d1; }
    .confetti:nth-child(4) { left: 40%; animation-delay: 1.5s; background: #f9ca24; }
    .confetti:nth-child(5) { left: 50%; animation-delay: 2s; background: #f0932b; }
    .confetti:nth-child(6) { left: 60%; animation-delay: 0.3s; background: #eb4d4b; }
    .confetti:nth-child(7) { left: 70%; animation-delay: 0.8s; background: #6c5ce7; }
    .confetti:nth-child(8) { left: 80%; animation-delay: 1.3s; background: #a29bfe; }
    .confetti:nth-child(9) { left: 90%; animation-delay: 1.8s; background: #fd79a8; }
    .confetti:nth-child(10) { left: 15%; animation-delay: 0.2s; background: #00b894; }
  `;

  return (
    <>
      <style>{confettiStyle}</style>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
        
        {/* Confetti Animation */}
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            
            {/* Success Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full mb-6 animate-bounce">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                🎉 Payment Successful!
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                Thank you for your order! Your delicious desserts are being prepared.
              </p>
            </div>

            {/* Order Summary Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8 border border-slate-200 dark:border-slate-700">
              
              {/* Order Details Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center">
                  <ShoppingBag className="w-6 h-6 mr-2 text-orange-500" />
                  Order Details
                </h2>
                <div className="text-right">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Order ID</p>
                  <p className="font-mono text-sm text-slate-700 dark:text-slate-300">
                    {orderData.paymentIntentId?.slice(-12).toUpperCase() || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Name:</span>
                    <span className="ml-2 text-slate-900 dark:text-white font-medium">
                      {orderData.customerInfo?.name || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Email:</span>
                    <span className="ml-2 text-slate-900 dark:text-white font-medium">
                      {orderData.customerInfo?.email || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Phone:</span>
                    <span className="ml-2 text-slate-900 dark:text-white font-medium">
                      {orderData.customerInfo?.phone || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Order Time:</span>
                    <span className="ml-2 text-slate-900 dark:text-white font-medium">
                      {new Date(orderData.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Items Ordered</h3>
                <div className="space-y-3">
                  {orderData.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-center">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover mr-3"
                        />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {formatPriceWithCurrency(item.price * item.quantity)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatPriceWithCurrency(item.price)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold text-slate-900 dark:text-white">Total Paid:</span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatPriceWithCurrency(orderData.total || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/orders')}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
              >
                <Clock className="w-5 h-5 mr-2" />
                Track Your Order
              </button>
              <button
                onClick={() => navigate('/menu')}
                className="flex-1 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500 font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Continue Shopping
              </button>
            </div>

            {/* Payment Method Info */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm">
                <CreditCard className="w-4 h-4 mr-2" />
                Payment processed securely by Stripe
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccessPage;