import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPriceWithCurrency } from '@/utils/priceUtils';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Package, 
  Clock,
  FileText
} from 'lucide-react';

const OrderDetailsModal = ({ isOpen, onClose, order }) => {
  if (!order) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      ready: 'bg-purple-100 text-purple-800 border-purple-200',
      shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      picked_up: 'bg-teal-100 text-teal-800 border-teal-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <div className="px-6 pt-6 pb-2">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Package className="h-6 w-6" />
          Order Details
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Complete information about order #{order.order_number}
        </p>
      </div>

      <div className="px-6 py-4 space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Order Status & Payment */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Order Status</p>
            <Badge className={`${getStatusColor(order.status)} border px-3 py-1`}>
              {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
            </Badge>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
            <Badge variant={order.payment_status === 'succeeded' || order.payment_status === 'paid' ? 'default' : 'secondary'} className="px-3 py-1">
              {order.payment_status === 'succeeded' || order.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
            <User className="h-5 w-5" />
            Customer Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <User className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="font-medium">{order.customer_email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="font-medium">{order.customer_phone || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                <p className="font-medium">{formatDate(order.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Order Type & Delivery/Pickup Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
            <Package className="h-5 w-5" />
            Order Type
          </h3>
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-sm">
                {order.order_type === 'takeaway' ? '🏪 Pickup' : '🚚 Delivery'}
              </Badge>
            </div>
            
            {order.order_type === 'takeaway' && order.pickup_time && (
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pickup Time</p>
                  <p className="font-medium">{order.pickup_time}</p>
                </div>
              </div>
            )}

            {order.order_type === 'delivery' && order.delivery_address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Delivery Address</p>
                  <p className="font-medium">
                    {typeof order.delivery_address === 'string' 
                      ? order.delivery_address 
                      : `${order.delivery_address?.address?.line1 || ''}, ${order.delivery_address?.address?.city || ''}, ${order.delivery_address?.address?.state || ''} ${order.delivery_address?.address?.postal_code || ''}`
                    }
                  </p>
                </div>
              </div>
            )}

            {order.special_instructions && (
              <div className="flex items-start gap-3 mt-3">
                <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Special Instructions</p>
                  <p className="font-medium">{order.special_instructions}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Payment Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </h3>
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-medium">
                {order.payment_method === 'online' ? '💳 Paid Online' : '🏪 Pay at Store'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Status</span>
              <span className="font-medium">
                {order.payment_status === 'succeeded' || order.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}
              </span>
            </div>
            {order.stripe_payment_intent_id && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Payment ID</span>
                <span className="font-mono">{order.stripe_payment_intent_id}</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Order Items */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Order Items ({order.items?.length || 0})</h3>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-start p-3 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  {item.customizations && Object.keys(item.customizations).length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {Object.entries(item.customizations).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPriceWithCurrency(item.unit_price)}</p>
                  {item.quantity > 1 && (
                    <p className="text-sm text-muted-foreground">
                      Total: {formatPriceWithCurrency(item.total_price)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Order Summary */}
        <div className="space-y-3 bg-primary/5 p-4 rounded-lg border-2 border-primary/20">
          <h3 className="text-lg font-semibold text-primary">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPriceWithCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {order.order_type === 'takeaway' ? 'Pickup Fee' : 'Delivery Fee'}
              </span>
              <span className="font-medium">
                {order.delivery_fee > 0 ? formatPriceWithCurrency(order.delivery_fee) : 'FREE'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (8%)</span>
              <span className="font-medium">{formatPriceWithCurrency(order.tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-primary">Total</span>
              <span className="text-primary">{formatPriceWithCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailsModal;
