# cspell:disable
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
import stripe
import json
import logging
from decimal import Decimal
from .models import (
    Order, OrderItem, Category, DessertItem,
    CustomerTestimonial, ChefRecommendation, ContactSubmission,
    AboutUsPage, AboutUsValue, AboutUsTeamMember,
    OurStoryPage, StoryTimeline, StoryImpact,
    FAQPage, FAQCategory, FAQItem
)
from .serializers import (
    CategorySerializer, DessertItemSerializer, OrderSerializer,
    ContactSubmissionSerializer, CustomerTestimonialSerializer, ChefRecommendationSerializer,
    AboutUsPageSerializer, AboutUsValueSerializer, AboutUsTeamMemberSerializer,
    OurStoryPageSerializer, StoryTimelineSerializer, StoryImpactSerializer,
    FAQPageSerializer, FAQCategorySerializer, FAQItemSerializer
)

# Set up logging
logger = logging.getLogger(__name__)

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

@csrf_exempt
@require_http_methods(["POST"])
def create_payment_intent(request):
    """Create a payment intent for Stripe checkout"""
    try:
        data = json.loads(request.body)
        
        # Extract order details
        items = data.get('items', [])
        customer_info = data.get('customer_info', {})
        
        if not items:
            return JsonResponse({'error': 'No items in order'}, status=400)
        
        # Calculate totals
        subtotal = Decimal('0.00')
        for item in items:
            item_total = Decimal(str(item['price'])) * item['quantity']
            subtotal += item_total
        
        delivery_fee = Decimal('0.00') if subtotal > 25 else Decimal('4.99')
        tax = subtotal * Decimal('0.08')  # 8% tax
        total = subtotal + delivery_fee + tax
        
        # Convert to cents for Stripe
        amount_cents = int(total * 100)
        
        # Create payment intent - only allow card payments
        payment_intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency='usd',
            payment_method_types=['card'],  # Only allow card payments
            metadata={
                'customer_name': customer_info.get('name', ''),
                'customer_email': customer_info.get('email', ''),
                'customer_phone': customer_info.get('phone', ''),
                'subtotal': str(subtotal),
                'delivery_fee': str(delivery_fee),
                'tax': str(tax),
                'total': str(total),
                'item_count': len(items),
            }
        )
        
        return JsonResponse({
            'client_secret': payment_intent.client_secret,
            'payment_intent_id': payment_intent.id,
            'amount': amount_cents,
            'currency': 'usd'
        })
        
    except Exception as e:
        logger.error(f"Error creating payment intent: {str(e)}")
        return JsonResponse({'error': str(e)}, status=400)





@require_http_methods(["GET"])
def get_order(request, order_id):
    """Get order details by order ID"""
    try:
        order = Order.objects.get(id=order_id)
        
        order_data = {
            'id': str(order.id),
            'order_number': order.order_number,
            'customer_name': order.customer_name,
            'customer_email': order.customer_email,
            'customer_phone': order.customer_phone,
            'delivery_address': order.delivery_address,
            'subtotal': str(order.subtotal),
            'delivery_fee': str(order.delivery_fee),
            'tax': str(order.tax),
            'total': str(order.total),
            'status': order.status,
            'payment_status': order.payment_status,
            'created_at': order.created_at.isoformat(),
            'items': []
        }
        
        for item in order.items.all():
            order_data['items'].append({
                'product_name': item.product_name,
                'product_image': item.product_image,
                'unit_price': str(item.unit_price),
                'quantity': item.quantity,
                'customizations': item.customizations,
                'total_price': str(item.total_price)
            })
        
        return JsonResponse(order_data)
        
    except Order.DoesNotExist:
        return JsonResponse({'error': 'Order not found'}, status=404)
    except Exception as e:
        logger.error(f"Error retrieving order: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt  
@require_http_methods(["GET", "POST"])
def orders_view(request):
    """Handle both GET (list orders) and POST (create order) requests"""
    if request.method == 'GET':
        return get_orders_list(request)
    elif request.method == 'POST':
        return create_order(request)

def create_order(request):
    """Create a new order from frontend data"""
    try:
        data = json.loads(request.body)
        
        # Extract data from frontend
        customer_name = data.get('customer_name', '')
        customer_email = data.get('customer_email', '')
        customer_phone = data.get('customer_phone', '')
        delivery_address = data.get('delivery_address', {})  # Capture address data
        items = data.get('items', [])
        subtotal = Decimal(str(data.get('subtotal', 0)))
        delivery_fee = Decimal(str(data.get('delivery_fee', 0)))
        tax = Decimal(str(data.get('tax', 0)))
        total = Decimal(str(data.get('total', 0)))
        payment_intent_id = data.get('payment_intent_id', '')
        status = data.get('status', 'pending')
        order_id = data.get('order_id', '')
        
        # Debug: Log the delivery address
        logger.info(f"Received delivery address: {delivery_address}")
        
        if not payment_intent_id:
            return JsonResponse({'error': 'Payment intent ID required'}, status=400)
        
        if not items:
            return JsonResponse({'error': 'No items in order'}, status=400)
        
        # Create order record
        order = Order.objects.create(
            customer_name=customer_name,
            customer_email=customer_email,
            customer_phone=customer_phone,
            delivery_address=delivery_address,  # Store the actual address data
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            tax=tax,
            total=total,
            order_type='delivery',  # Explicitly set order type as delivery
            payment_method='online',  # Set payment method as online for Stripe payments
            stripe_payment_intent_id=payment_intent_id,
            payment_status='succeeded',
            status=status
        )
        
        # Create order items
        for item in items:
            OrderItem.objects.create(
                order=order,
                product_name=item.get('name', ''),
                product_image=item.get('image', ''),
                unit_price=Decimal(str(item.get('price', 0))),
                quantity=item.get('quantity', 1),
                customizations={},
            )
        
        return JsonResponse({
            'success': True,
            'id': str(order.id),
            'order_id': order.order_number,
            'order_number': order.order_number,
            'total': str(order.total),
            'status': order.status,
            'created_at': order.created_at.isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error creating order: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

def get_orders_list(request):
    """Get all orders (for admin/dashboard)"""
    try:
        orders = Order.objects.all()[:50]  # Limit to latest 50 orders
        
        orders_data = []
        for order in orders:
            orders_data.append({
                'id': str(order.id),
                'order_number': order.order_number,
                'customer_name': order.customer_name,
                'customer_email': order.customer_email,
                'total': str(order.total),
                'status': order.status,
                'payment_status': order.payment_status,
                'created_at': order.created_at.isoformat(),
                'item_count': order.items.count()
            })
        
        return JsonResponse({
            'orders': orders_data,
            'count': len(orders_data)
        })
        
    except Exception as e:
        logger.error(f"Error retrieving orders: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


# ===== NEW API ENDPOINTS FOR FRONTEND INTEGRATION =====

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """API ViewSet for categories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'


class DessertItemViewSet(viewsets.ReadOnlyModelViewSet):
    """API ViewSet for dessert items"""
    queryset = DessertItem.objects.filter(available=True)
    serializer_class = DessertItemSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        category_slug = self.request.query_params.get('category', None)
        featured = self.request.query_params.get('featured', None)
        
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        
        if featured and featured.lower() == 'true':
            queryset = queryset.filter(featured=True)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured desserts"""
        featured_items = self.get_queryset().filter(featured=True)[:8]
        serializer = self.get_serializer(featured_items, many=True)
        return Response(serializer.data)


@require_http_methods(["GET"])
def get_categories(request):
    """Get all dessert categories (legacy endpoint)"""
    try:
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        
        return JsonResponse(serializer.data, safe=False)
        
    except Exception as e:
        logger.error(f"Error retrieving categories: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_desserts(request):
    """Get desserts with filtering options (legacy endpoint)"""
    try:
        # Get query parameters
        category = request.GET.get('category', None)
        featured = request.GET.get('featured', None)
        best_seller = request.GET.get('best_seller', None)
        seasonal = request.GET.get('seasonal', None)
        dietary = request.GET.get('dietary', None)
        search = request.GET.get('search', None)
        
        # Start with all available desserts
        desserts = DessertItem.objects.filter(available=True)
        
        # Apply filters
        if category and category != 'All':
            desserts = desserts.filter(category__slug=category.lower())
        
        if featured and featured.lower() == 'true':
            desserts = desserts.filter(featured=True)
            
        if best_seller and best_seller.lower() == 'true':
            desserts = desserts.filter(best_seller=True)
            
        if seasonal and seasonal.lower() == 'true':
            desserts = desserts.filter(seasonal=True)
            
        if dietary:
            desserts = desserts.filter(dietary_info__contains=[dietary])
            
        if search:
            from django.db.models import Q
            desserts = desserts.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) |
                Q(ingredients__contains=[search])
            )
        
        # Serialize desserts using serializer
        serializer = DessertItemSerializer(desserts, many=True)
        
        return JsonResponse(serializer.data, safe=False)
        
    except Exception as e:
        logger.error(f"Error retrieving desserts: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_featured_desserts(request):
    """Get featured desserts for homepage"""
    try:
        desserts = DessertItem.objects.filter(featured=True, available=True)[:8]
        serializer = DessertItemSerializer(desserts, many=True)
        
        return JsonResponse(serializer.data, safe=False)
        
    except Exception as e:
        logger.error(f"Error retrieving featured desserts: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_testimonials(request):
    """Get approved customer testimonials"""
    try:
        testimonials = CustomerTestimonial.objects.filter(approved=True)[:10]
        
        testimonials_data = []
        for testimonial in testimonials:
            testimonials_data.append({
                'id': testimonial.id,
                'name': testimonial.name,
                'avatar': testimonial.avatar,
                'rating': testimonial.rating,
                'text': testimonial.text,
                'date': testimonial.created_at.strftime('%Y-%m-%d'),
                'dessert': testimonial.dessert_item.name if testimonial.dessert_item else None
            })
        
        return JsonResponse({
            'testimonials': testimonials_data,
            'count': len(testimonials_data)
        })
        
    except Exception as e:
        logger.error(f"Error retrieving testimonials: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_chef_recommendations(request):
    """Get chef recommendations"""
    try:
        recommendations = ChefRecommendation.objects.filter(active=True)
        
        recommendations_data = []
        for rec in recommendations:
            if rec.dessert_item:  # Ensure dessert_item exists
                recommendations_data.append({
                    'id': rec.dessert_item.id,
                    'name': rec.dessert_item.name,
                    'price': float(rec.dessert_item.price),
                    'image': rec.dessert_item.image,
                    'reason': rec.recommendation_text,
                    'chef_name': rec.chef_name,
                    'chef_title': rec.chef_title,
                })
        
        return JsonResponse({
            'recommendations': recommendations_data,
            'count': len(recommendations_data)
        })
        
    except Exception as e:
        logger.error(f"Error retrieving chef recommendations: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def submit_contact(request):
    """Submit contact form with support for authenticated and guest users"""
    try:
        data = json.loads(request.body)
        
        # Extract form data
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        subject = data.get('subject', '').strip()
        message = data.get('message', '').strip()
        order_type = data.get('orderType', 'general')  # Frontend sends 'orderType'
        preferred_contact = data.get('preferredContact', 'email')  # Frontend sends 'preferredContact'
        
        # Validate required fields
        if not all([name, email, subject, message]):
            return JsonResponse({
                'error': 'All required fields must be filled (name, email, subject, message)'
            }, status=400)
        
        # Check if user is authenticated (optional)
        user = None
        if request.user.is_authenticated:
            user = request.user
            logger.info(f"Contact form submitted by authenticated user: {user.username}")
        else:
            logger.info(f"Contact form submitted by guest: {name} ({email})")
        
        # Create contact submission
        contact = ContactSubmission.objects.create(
            user=user,
            name=name,
            email=email,
            phone=phone,
            subject=subject,
            message=message,
            order_type=order_type,
            preferred_contact=preferred_contact
        )
        
        # Log successful submission
        logger.info(f"Contact submission created: ID={contact.id}, User={'Authenticated' if user else 'Guest'}, Type={order_type}")
        
        return JsonResponse({
            'success': True,
            'message': 'Thank you for your message! We will get back to you within 24 hours.',
            'submission_id': contact.id,
            'order_type': contact.get_order_type_display(),
            'user_type': 'authenticated' if user else 'guest'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        logger.error(f"Error submitting contact form: {str(e)}")
        return JsonResponse({'error': 'An error occurred while submitting your message. Please try again.'}, status=500)


@require_http_methods(["GET"])
def get_user_contact_submissions(request):
    """Get contact submissions for the authenticated user"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        submissions = ContactSubmission.objects.filter(user=request.user).order_by('-created_at')[:10]
        
        submissions_data = []
        for submission in submissions:
            submissions_data.append({
                'id': submission.id,
                'subject': submission.subject,
                'order_type': submission.get_order_type_display(),
                'order_type_value': submission.order_type,
                'preferred_contact': submission.get_preferred_contact_display(),
                'responded': submission.responded,
                'created_at': submission.created_at.strftime('%B %d, %Y at %I:%M %p'),
                'message_preview': submission.message[:100] + '...' if len(submission.message) > 100 else submission.message
            })
        
        return JsonResponse({
            'submissions': submissions_data,
            'count': len(submissions_data)
        })
        
    except Exception as e:
        logger.error(f"Error retrieving user contact submissions: {str(e)}")
        return JsonResponse({'error': 'An error occurred while retrieving your contact history.'}, status=500)


@require_http_methods(["GET"])
def get_hero_video(request):
    """Get hero video information for homepage"""
    try:
        video_url = f"{request.build_absolute_uri(settings.MEDIA_URL)}videos/hero-video.mp4"
        
        return JsonResponse({
            'success': True,
            'video_url': video_url,
            'video_type': 'video/mp4',
            'description': 'Sweet Dessert hero background video',
        })
        
    except Exception as e:
        logger.error(f"Error getting hero video: {str(e)}")
        return JsonResponse({'error': 'Video not available'}, status=500)

@require_http_methods(["GET"])
def test_session(request):
    """Test session handling for debugging"""
    return JsonResponse({
        'authenticated': request.user.is_authenticated,
        'user': str(request.user),
        'user_id': request.user.id if request.user.is_authenticated else None,
        'session_key': request.session.session_key,
        'is_admin': request.user.is_superuser if request.user.is_authenticated else False,
        'admin_check': (request.user.is_superuser or 
                       request.user.email == 'admin@gmail.com' or 
                       request.user.username.lower() == 'admin') if request.user.is_authenticated else False
    })


# ===== TAKEAWAY/PICKUP ORDER ENDPOINTS =====

@csrf_exempt
@require_http_methods(["POST"])
def create_takeaway_order(request):
    """Create a takeaway/pickup order"""
    try:
        data = json.loads(request.body)
        
        # Debug: Log the received data
        logger.info(f"Received takeaway order data: {data}")
        
        # Extract customer information
        customer_name = data.get('customer_name', '').strip()
        customer_email = data.get('customer_email', '').strip()
        customer_phone = data.get('customer_phone', '').strip()
        pickup_time = data.get('pickup_time', '').strip()
        special_instructions = data.get('special_instructions', '').strip()
        
        # Debug: Log the extracted fields
        logger.info(f"Extracted - Name: '{customer_name}', Phone: '{customer_phone}', Pickup: '{pickup_time}', Instructions: '{special_instructions}'")
        payment_method = data.get('payment_method', 'store')  # 'online' or 'store'
        payment_status = data.get('payment_status', 'pending')  # Can be 'paid' if already processed
        order_status = data.get('status', 'pending')  # Can be 'confirmed' if payment completed
        payment_intent_id = data.get('payment_intent_id', None)  # Stripe payment intent ID
        
        # Extract order items
        items = data.get('items', [])
        
        # Validate required fields
        if not all([customer_name, customer_phone, pickup_time]):
            return JsonResponse({
                'error': 'Customer name, phone, and pickup time are required'
            }, status=400)
        
        if not items:
            return JsonResponse({'error': 'No items in order'}, status=400)
        
        # Calculate totals
        subtotal = Decimal('0.00')
        for item in items:
            item_total = Decimal(str(item['price'])) * item['quantity']
            subtotal += item_total
        
        # No delivery fee for takeaway orders
        delivery_fee = Decimal('0.00')
        tax = subtotal * Decimal('0.08')  # 8% tax
        total = subtotal + delivery_fee + tax
        
        # Create takeaway order
        order = Order.objects.create(
            customer_name=customer_name,
            customer_email=customer_email,
            customer_phone=customer_phone,
            order_type='takeaway',
            pickup_time=pickup_time,
            special_instructions=special_instructions,
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            tax=tax,
            total=total,
            payment_method=payment_method,
            payment_status=payment_status,  # Use the status from frontend
            status=order_status,            # Use the order status from frontend
            stripe_payment_intent_id=payment_intent_id
        )
        
        # Create order items
        for item in items:
            OrderItem.objects.create(
                order=order,
                product_name=item.get('name', ''),
                product_image=item.get('image', ''),
                unit_price=Decimal(str(item.get('price', 0))),
                quantity=item.get('quantity', 1),
                customizations=item.get('customizations', {}),
            )
        
        logger.info(f"Takeaway order created: {order.order_number} - {customer_name} - Payment: {payment_method}")
        
        return JsonResponse({
            'success': True,
            'order_id': str(order.id),
            'order_number': order.order_number,
            'customer_name': order.customer_name,
            'pickup_time': order.pickup_time,
            'payment_method': order.get_payment_method_display(),
            'payment_status': order.payment_status,
            'total': str(order.total),
            'status': order.get_status_display(),
            'created_at': order.created_at.isoformat(),
            'message': 'Takeaway order created successfully!'
        })
        
    except Exception as e:
        logger.error(f"Error creating takeaway order: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def create_takeaway_payment_intent(request):
    """Create payment intent for takeaway orders with online payment"""
    try:
        data = json.loads(request.body)
        
        # Extract takeaway order details
        items = data.get('items', [])
        customer_info = data.get('customer_info', {})
        takeaway_info = data.get('takeaway_info', {})
        
        if not items:
            return JsonResponse({'error': 'No items in order'}, status=400)
        
        # Calculate totals (no delivery fee for takeaway)
        subtotal = Decimal('0.00')
        for item in items:
            item_total = Decimal(str(item['price'])) * item['quantity']
            subtotal += item_total
        
        delivery_fee = Decimal('0.00')  # Free for takeaway
        tax = subtotal * Decimal('0.08')
        total = subtotal + delivery_fee + tax
        
        # Convert to cents for Stripe
        amount_cents = int(total * 100)
        
        # Create payment intent with takeaway metadata - only allow card payments
        payment_intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency='usd',
            payment_method_types=['card'],  # Only allow card payments
            metadata={
                'order_type': 'takeaway',
                'customer_name': customer_info.get('name', ''),
                'customer_email': customer_info.get('email', ''),
                'customer_phone': customer_info.get('phone', ''),
                'pickup_time': takeaway_info.get('pickup_time', ''),
                'special_instructions': takeaway_info.get('special_instructions', ''),
                'payment_method': 'online',
                'subtotal': str(subtotal),
                'delivery_fee': str(delivery_fee),
                'tax': str(tax),
                'total': str(total),
                'item_count': len(items),
            }
        )
        
        logger.info(f"Takeaway payment intent created: {payment_intent.id} - Amount: ${total}")
        
        return JsonResponse({
            'client_secret': payment_intent.client_secret,
            'payment_intent_id': payment_intent.id,
            'amount': amount_cents,
            'currency': 'usd',
            'order_type': 'takeaway'
        })
        
    except Exception as e:
        logger.error(f"Error creating takeaway payment intent: {str(e)}")
        return JsonResponse({'error': str(e)}, status=400)


@require_http_methods(["GET"])
def get_takeaway_orders(request):
    """Get all takeaway orders for admin dashboard"""
    try:
        # Get query parameters
        status_filter = request.GET.get('status', None)
        payment_filter = request.GET.get('payment', None)
        limit = int(request.GET.get('limit', 50))
        
        # Start with takeaway orders
        orders = Order.objects.filter(order_type='takeaway').order_by('-created_at')
        
        # Apply filters
        if status_filter:
            orders = orders.filter(status=status_filter)
        
        if payment_filter:
            if payment_filter == 'paid':
                orders = orders.filter(payment_status='succeeded')
            elif payment_filter == 'pending':
                orders = orders.filter(payment_status='pending')
        
        orders = orders[:limit]
        
        orders_data = []
        for order in orders:
            orders_data.append({
                'id': str(order.id),
                'order_number': order.order_number,
                'customer_name': order.customer_name,
                'customer_email': order.customer_email,
                'customer_phone': order.customer_phone,
                'pickup_time': order.pickup_time,
                'special_instructions': order.special_instructions,
                'payment_method': order.get_payment_method_display(),
                'payment_status': order.payment_status,
                'is_paid_online': order.is_paid_online,
                'is_pending_payment': order.is_pending_payment,
                'subtotal': str(order.subtotal),
                'tax': str(order.tax),
                'total': str(order.total),
                'status': order.status,
                'status_display': order.get_status_display_with_context(),
                'created_at': order.created_at.isoformat(),
                'created_at_display': order.created_at.strftime('%B %d, %Y at %I:%M %p'),
                'item_count': order.items.count(),
                'items': [
                    {
                        'name': item.product_name,
                        'quantity': item.quantity,
                        'unit_price': str(item.unit_price),
                        'total_price': str(item.total_price),
                        'customizations': item.customizations
                    }
                    for item in order.items.all()
                ]
            })
        
        return JsonResponse({
            'orders': orders_data,
            'count': len(orders_data),
            'total_takeaway_orders': Order.objects.filter(order_type='takeaway').count(),
            'pending_payment_count': Order.objects.filter(
                order_type='takeaway', 
                payment_status='pending'
            ).count(),
            'paid_online_count': Order.objects.filter(
                order_type='takeaway', 
                payment_status='succeeded'
            ).count(),
        })
        
    except Exception as e:
        logger.error(f"Error retrieving takeaway orders: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PATCH"])
def update_takeaway_order_status(request, order_id):
    """Update takeaway order status"""
    try:
        data = json.loads(request.body)
        new_status = data.get('status')
        
        if not new_status:
            return JsonResponse({'error': 'Status is required'}, status=400)
        
        order = Order.objects.get(id=order_id, order_type='takeaway')
        old_status = order.status
        order.status = new_status
        
        # If marking as picked up, ensure payment is complete for store payment orders
        if new_status == 'picked_up' and order.payment_method == 'store':
            order.payment_status = 'succeeded'
        
        order.save()
        
        logger.info(f"Takeaway order {order.order_number} status updated: {old_status} -> {new_status}")
        
        return JsonResponse({
            'success': True,
            'order_number': order.order_number,
            'old_status': old_status,
            'new_status': new_status,
            'status_display': order.get_status_display_with_context(),
            'payment_status': order.payment_status,
            'message': f'Order status updated to {order.get_status_display_with_context()}'
        })
        
    except Order.DoesNotExist:
        return JsonResponse({'error': 'Takeaway order not found'}, status=404)
    except Exception as e:
        logger.error(f"Error updating takeaway order status: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


# CMS ViewSets
class AboutUsPageViewSet(viewsets.ModelViewSet):
    """ViewSet for managing About Us page content"""
    queryset = AboutUsPage.objects.all()
    serializer_class = AboutUsPageSerializer
    
    def get_queryset(self):
        # Return only active pages for list view, but allow all for admin
        if self.action == 'list' and not self.request.user.is_staff:
            return AboutUsPage.objects.filter(is_active=True)
        return AboutUsPage.objects.all()
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get the active About Us page"""
        try:
            page = AboutUsPage.objects.filter(is_active=True).first()
            if page:
                serializer = self.get_serializer(page)
                return Response(serializer.data)
            else:
                return Response({'message': 'No active About Us page found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    def perform_create(self, serializer):
        serializer.save(updated_by=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class AboutUsValueViewSet(viewsets.ModelViewSet):
    """ViewSet for managing About Us values"""
    queryset = AboutUsValue.objects.all()
    serializer_class = AboutUsValueSerializer
    
    def get_queryset(self):
        queryset = AboutUsValue.objects.all()
        about_page_id = self.request.query_params.get('about_page_id', None)
        if about_page_id is not None:
            queryset = queryset.filter(about_page_id=about_page_id)
        return queryset.order_by('order', 'title')


class AboutUsTeamMemberViewSet(viewsets.ModelViewSet):
    """ViewSet for managing About Us team members"""
    queryset = AboutUsTeamMember.objects.all()
    serializer_class = AboutUsTeamMemberSerializer
    
    def get_queryset(self):
        queryset = AboutUsTeamMember.objects.all()
        about_page_id = self.request.query_params.get('about_page_id', None)
        if about_page_id is not None:
            queryset = queryset.filter(about_page_id=about_page_id)
        return queryset.order_by('order', 'name')


class OurStoryPageViewSet(viewsets.ModelViewSet):
    """ViewSet for managing Our Story page content"""
    queryset = OurStoryPage.objects.all()
    serializer_class = OurStoryPageSerializer
    
    def get_queryset(self):
        # Return only active pages for list view, but allow all for admin
        if self.action == 'list' and not self.request.user.is_staff:
            return OurStoryPage.objects.filter(is_active=True)
        return OurStoryPage.objects.all()
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get the active Our Story page"""
        try:
            page = OurStoryPage.objects.filter(is_active=True).first()
            if page:
                serializer = self.get_serializer(page)
                return Response(serializer.data)
            else:
                return Response({'message': 'No active Our Story page found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    def perform_create(self, serializer):
        serializer.save(updated_by=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class StoryTimelineViewSet(viewsets.ModelViewSet):
    """ViewSet for managing Our Story timeline events"""
    queryset = StoryTimeline.objects.all()
    serializer_class = StoryTimelineSerializer
    
    def get_queryset(self):
        queryset = StoryTimeline.objects.all()
        story_page_id = self.request.query_params.get('story_page_id', None)
        if story_page_id is not None:
            queryset = queryset.filter(story_page_id=story_page_id)
        return queryset.order_by('order', 'year')


class StoryImpactViewSet(viewsets.ModelViewSet):
    """ViewSet for managing Our Story impact metrics"""
    queryset = StoryImpact.objects.all()
    serializer_class = StoryImpactSerializer
    
    def get_queryset(self):
        queryset = StoryImpact.objects.all()
        story_page_id = self.request.query_params.get('story_page_id', None)
        if story_page_id is not None:
            queryset = queryset.filter(story_page_id=story_page_id)
        return queryset.order_by('order', 'label')


# FAQ ViewSets
class FAQPageViewSet(viewsets.ModelViewSet):
    """ViewSet for managing FAQ page content"""
    queryset = FAQPage.objects.all()
    serializer_class = FAQPageSerializer
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get the active FAQ page with all categories and items"""
        try:
            faq_page = FAQPage.objects.prefetch_related(
                'categories__faq_items'
            ).first()
            
            if not faq_page:
                return Response({'error': 'FAQ page not found'}, status=status.HTTP_404_NOT_FOUND)
            
            serializer = self.get_serializer(faq_page)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FAQCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing FAQ categories"""
    queryset = FAQCategory.objects.all()
    serializer_class = FAQCategorySerializer
    
    def get_queryset(self):
        queryset = FAQCategory.objects.all()
        faq_page_id = self.request.query_params.get('faq_page_id', None)
        is_active = self.request.query_params.get('is_active', None)
        
        if faq_page_id is not None:
            queryset = queryset.filter(faq_page_id=faq_page_id)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
            
        return queryset.order_by('order', 'name')


class FAQItemViewSet(viewsets.ModelViewSet):
    """ViewSet for managing FAQ items"""
    queryset = FAQItem.objects.all()
    serializer_class = FAQItemSerializer
    
    def get_queryset(self):
        queryset = FAQItem.objects.all()
        category_id = self.request.query_params.get('category_id', None)
        is_active = self.request.query_params.get('is_active', None)
        
        if category_id is not None:
            queryset = queryset.filter(category_id=category_id)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
            
        return queryset.order_by('order', 'question')



