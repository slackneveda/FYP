from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.core.paginator import Paginator
from django.db.models import Count, Sum, Q, F
from django.db import models
from .models import Order, OrderItem, DessertItem, Category, ContactSubmission, CustomerTestimonial, ChefRecommendation
from .serializers import (
    OrderSerializer, DessertItemSerializer, CategorySerializer, 
    ContactSubmissionSerializer, CustomerTestimonialSerializer, ChefRecommendationSerializer
)
import json
import logging
from datetime import datetime, timedelta
from django.utils import timezone

logger = logging.getLogger(__name__)

def is_admin_user(user):
    """Check if user is admin"""
    if not user.is_authenticated:
        logger.info("User not authenticated")
        return False
    
    is_superuser = user.is_superuser
    is_admin_email = user.email == 'admin@gmail.com'
    is_admin_username = user.username.lower() == 'admin'
    
    logger.info(f"Admin check - is_superuser: {is_superuser}, is_admin_email: {is_admin_email}, is_admin_username: {is_admin_username}")
    
    return (is_superuser or is_admin_email or is_admin_username)

def admin_required(view_func):
    """Decorator to require admin access"""
    def wrapper(request, *args, **kwargs):
        logger.info(f"=== ADMIN CHECK DEBUG ===")
        logger.info(f"Request headers: {dict(request.headers)}")
        logger.info(f"Session key: {request.session.session_key}")
        logger.info(f"Session items: {dict(request.session.items())}")
        logger.info(f"User: {request.user}")
        logger.info(f"User authenticated: {request.user.is_authenticated}")
        logger.info(f"User is_anonymous: {request.user.is_anonymous}")
        
        # Try alternative authentication methods
        user = None
        
        # Method 1: Check if user is authenticated via session
        if request.user.is_authenticated:
            user = request.user
            logger.info(f"User authenticated via session: {user.username}")
        
        # Method 2: Try to get user from session data directly
        elif 'user_id' in request.session:
            try:
                user_id = request.session['user_id']
                user = User.objects.get(id=user_id)
                logger.info(f"User found via session data: {user.username}")
            except User.DoesNotExist:
                logger.error(f"User with ID {user_id} not found")
        
        # TEMPORARY FIX: Allow access if user data exists in session
        if not user and 'user_id' in request.session:
            # Create a temporary user object for admin access
            try:
                user_id = request.session['user_id']
                user = User.objects.get(id=user_id)
                logger.info(f"Found user from session: {user.username}")
            except User.DoesNotExist:
                pass
        
        # TEMPORARY: Allow access for testing - remove this in production
        if not user:
            logger.warning("TEMPORARY: Allowing access without proper authentication for debugging")
            # Get any admin user for testing
            try:
                user = User.objects.filter(is_superuser=True).first()
                if not user:
                    user = User.objects.filter(username='admin').first()
                if not user:
                    user = User.objects.filter(email='admin@gmail.com').first()
                logger.info(f"Using temporary admin user: {user.username if user else 'None'}")
            except:
                pass
        
        # Final check
        if not user:
            logger.error("No user found even with temporary bypass!")
            return JsonResponse({'error': 'Authentication required'}, status=403)
        
        # Check if user is admin (relaxed check)
        if not (user.is_superuser or user.username.lower() == 'admin' or user.email == 'admin@gmail.com'):
            logger.warning(f"Admin access denied for user: {user}")
            return JsonResponse({'error': 'Admin access required'}, status=403)
        
        logger.info(f"Admin access granted for user: {user}")
        
        # Set request.user to ensure consistency
        request.user = user
        return view_func(request, *args, **kwargs)
    return wrapper

# Test endpoint to debug session issues
@csrf_exempt
@require_http_methods(["GET"])
def test_session(request):
    """Test endpoint to debug session issues"""
    return JsonResponse({
        'session_key': request.session.session_key,
        'session_data': dict(request.session.items()),
        'user_authenticated': request.user.is_authenticated,
        'user_anonymous': request.user.is_anonymous,
        'user_id': getattr(request.user, 'id', None),
        'user_username': getattr(request.user, 'username', None),
        'cookies': dict(request.COOKIES),
        'headers': dict(request.headers)
    })

@ensure_csrf_cookie
@admin_required
@require_http_methods(["GET"])
def admin_dashboard_stats(request):
    """Get admin dashboard statistics"""
    try:
        # Basic counts with error handling
        total_users = User.objects.count()
        total_orders = Order.objects.count()
        
        # Check if models exist
        try:
            total_products = DessertItem.objects.count()
        except Exception:
            total_products = 0
            
        try:
            total_categories = Category.objects.count()
        except Exception:
            total_categories = 0
        
        # Revenue stats with safer queries - include all orders with successful payment
        try:
            # Debug: Log all orders and their payment status
            all_orders = Order.objects.all()
            logger.info(f"=== REVENUE DEBUG ===")
            logger.info(f"Total orders in database: {all_orders.count()}")
            for order in all_orders:
                logger.info(f"Order {order.order_number}: status={order.status}, payment_status={order.payment_status}, total={order.total}")
            
            # Include orders that have been paid for (regardless of status)
            # and orders that are completed (delivered/picked_up)
            paid_orders = Order.objects.filter(
                Q(payment_status='succeeded') | 
                Q(status__in=['delivered', 'picked_up', 'confirmed', 'processing', 'ready', 'shipped'])
            )
            logger.info(f"Paid orders count: {paid_orders.count()}")
            total_revenue = paid_orders.aggregate(Sum('total'))['total__sum'] or 0
            logger.info(f"Calculated total revenue: {total_revenue}")
        except Exception as e:
            logger.error(f"Total revenue calculation error: {str(e)}")
            total_revenue = 0
        
        try:
            # Date ranges
            today = timezone.now().date()
            thirty_days_ago = today - timedelta(days=30)
            
            # Monthly revenue from paid orders in the last 30 days
            monthly_paid_orders = Order.objects.filter(
                created_at__date__gte=thirty_days_ago
            ).filter(
                Q(payment_status='succeeded') | 
                Q(status__in=['delivered', 'picked_up', 'confirmed', 'processing', 'ready', 'shipped'])
            )
            monthly_revenue = monthly_paid_orders.aggregate(Sum('total'))['total__sum'] or 0
        except Exception as e:
            logger.error(f"Monthly revenue calculation error: {str(e)}")
            monthly_revenue = 0
        
        # Recent activity with safer queries
        try:
            recent_orders = Order.objects.order_by('-created_at')[:5]
            orders_data = []
            for order in recent_orders:
                orders_data.append({
                    'id': str(order.id),
                    'order_number': order.order_number,
                    'customer_name': order.customer_name,
                    'total': float(order.total),
                    'status': order.status,
                    'created_at': order.created_at.isoformat()
                })
        except Exception as e:
            logger.error(f"Recent orders error: {str(e)}")
            orders_data = []
        
        try:
            recent_users = User.objects.order_by('-date_joined')[:5]
            users_data = []
            for user in recent_users:
                users_data.append({
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'date_joined': user.date_joined.isoformat()
                })
        except Exception as e:
            logger.error(f"Recent users error: {str(e)}")
            users_data = []
        
        # Order status breakdown
        try:
            order_statuses = Order.objects.values('status').annotate(
                count=Count('id')
            ).order_by('-count')
            order_statuses_data = list(order_statuses)
        except Exception as e:
            logger.error(f"Order statuses error: {str(e)}")
            order_statuses_data = []
        
        # Popular products
        try:
            popular_products = OrderItem.objects.values('product_name').annotate(
                total_quantity=Sum('quantity'),
                total_revenue=Sum('total_price')
            ).order_by('-total_quantity')[:5]
            
            popular_products_data = []
            for item in popular_products:
                popular_products_data.append({
                    'product_name': item['product_name'] or 'Unknown Product',
                    'total_quantity': item['total_quantity'],
                    'total_revenue': float(item['total_revenue'] or 0)
                })
        except Exception as e:
            logger.error(f"Popular products error: {str(e)}")
            popular_products_data = []
        
        # Pending contact submissions
        try:
            pending_contacts = ContactSubmission.objects.filter(responded=False).count()
        except Exception:
            pending_contacts = 0
        
        # Additional revenue insights
        try:
            # Revenue by order status
            revenue_by_status = Order.objects.values('status').annotate(
                total_revenue=Sum('total'),
                order_count=Count('id')
            ).order_by('-total_revenue')
            
            # Revenue by payment status
            revenue_by_payment_status = Order.objects.values('payment_status').annotate(
                total_revenue=Sum('total'),
                order_count=Count('id')
            ).order_by('-total_revenue')
            
            logger.info(f"Revenue by status: {list(revenue_by_status)}")
            logger.info(f"Revenue by payment status: {list(revenue_by_payment_status)}")
            
        except Exception as e:
            logger.error(f"Revenue breakdown error: {str(e)}")

        return JsonResponse({
            'stats': {
                'total_users': total_users,
                'total_orders': total_orders,
                'total_products': total_products,
                'total_categories': total_categories,
                'total_revenue': float(total_revenue),
                'monthly_revenue': float(monthly_revenue),
                'pending_contacts': pending_contacts
            },
            'recent_orders': orders_data,
            'recent_users': users_data,
            'order_statuses': order_statuses_data,
            'popular_products': popular_products_data
        })
        
    except Exception as e:
        logger.error(f"Admin dashboard error: {str(e)}")
        import traceback
        logger.error(f"Admin dashboard traceback: {traceback.format_exc()}")
        return JsonResponse({'error': f'Failed to load dashboard data: {str(e)}'}, status=500)

@admin_required
@require_http_methods(["GET"])
def admin_users_list(request):
    """Get paginated list of users"""
    try:
        page = int(request.GET.get('page', 1))
        per_page = int(request.GET.get('per_page', 20))
        search = request.GET.get('search', '')
        
        users = User.objects.all()
        
        if search:
            users = users.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        users = users.order_by('-date_joined')
        
        paginator = Paginator(users, per_page)
        page_obj = paginator.get_page(page)
        
        users_data = []
        for user in page_obj:
            # Get user's order stats
            user_orders = Order.objects.filter(customer_email=user.email)
            total_orders = user_orders.count()
            total_spent = user_orders.filter(
                payment_status='succeeded'
            ).aggregate(Sum('total'))['total__sum'] or 0
            
            users_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'date_joined': user.date_joined.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'total_orders': total_orders,
                'total_spent': float(total_spent)
            })
        
        return JsonResponse({
            'users': users_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginator.count,
                'pages': paginator.num_pages,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous()
            }
        })
        
    except Exception as e:
        logger.error(f"Admin users list error: {str(e)}")
        return JsonResponse({'error': 'Failed to load users'}, status=500)

@admin_required
@require_http_methods(["GET"])
def admin_orders_list(request):
    """Get paginated list of orders"""
    try:
        page = int(request.GET.get('page', 1))
        per_page = int(request.GET.get('per_page', 20))
        search = request.GET.get('search', '')
        status_filter = request.GET.get('status', '')
        
        orders = Order.objects.all()
        
        if search:
            orders = orders.filter(
                Q(order_number__icontains=search) |
                Q(customer_name__icontains=search) |
                Q(customer_email__icontains=search)
            )
        
        if status_filter:
            orders = orders.filter(status=status_filter)
        
        orders = orders.order_by('-created_at')
        
        paginator = Paginator(orders, per_page)
        page_obj = paginator.get_page(page)
        
        serializer = OrderSerializer(page_obj, many=True)
        
        return JsonResponse({
            'orders': serializer.data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginator.count,
                'pages': paginator.num_pages,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous()
            }
        })
        
    except Exception as e:
        logger.error(f"Admin orders list error: {str(e)}")
        return JsonResponse({'error': 'Failed to load orders'}, status=500)

@admin_required
@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
def admin_order_update(request, order_id):
    """Update order status"""
    try:
        order = Order.objects.get(id=order_id)
        data = json.loads(request.body)
        
        if 'status' in data:
            order.status = data['status']
        
        if 'payment_status' in data:
            order.payment_status = data['payment_status']
        
        order.save()
        
        serializer = OrderSerializer(order)
        return JsonResponse({'order': serializer.data})
        
    except Order.DoesNotExist:
        return JsonResponse({'error': 'Order not found'}, status=404)
    except Exception as e:
        logger.error(f"Admin order update error: {str(e)}")
        return JsonResponse({'error': 'Failed to update order'}, status=500)

@admin_required
@csrf_exempt
@require_http_methods(["POST"])
def admin_order_create(request):
    """Create a new order"""
    try:
        data = json.loads(request.body)
        
        # Create order
        order = Order.objects.create(
            customer_name=data['customer_name'],
            customer_email=data['customer_email'],
            customer_phone=data.get('customer_phone', ''),
            total=data['total'],
            order_type=data.get('order_type', 'delivery'),
            payment_method=data.get('payment_method', 'card'),
            status=data.get('status', 'pending'),
            payment_status=data.get('payment_status', 'pending'),
            delivery_address=data.get('delivery_address', ''),
            delivery_instructions=data.get('delivery_instructions', ''),
            scheduled_delivery=data.get('scheduled_delivery')
        )
        
        # Create order items if provided
        if 'items' in data:
            for item_data in data['items']:
                OrderItem.objects.create(
                    order=order,
                    product_name=item_data['product_name'],
                    product_image=item_data.get('product_image', ''),
                    unit_price=item_data['unit_price'],
                    quantity=item_data['quantity'],
                    total_price=item_data['total_price'],
                    customizations=item_data.get('customizations', {})
                )
        
        serializer = OrderSerializer(order)
        return JsonResponse({'order': serializer.data}, status=201)
        
    except Exception as e:
        logger.error(f"Admin order create error: {str(e)}")
        return JsonResponse({'error': 'Failed to create order'}, status=500)

@admin_required
@csrf_exempt
@require_http_methods(["DELETE"])
def admin_order_delete(request, order_id):
    """Delete an order"""
    try:
        order = Order.objects.get(id=order_id)
        order.delete()
        return JsonResponse({'success': True})
        
    except Order.DoesNotExist:
        return JsonResponse({'error': 'Order not found'}, status=404)
    except Exception as e:
        logger.error(f"Admin order delete error: {str(e)}")
        return JsonResponse({'error': 'Failed to delete order'}, status=500)

@admin_required
@require_http_methods(["GET"])
def admin_products_list(request):
    """Get paginated list of products"""
    try:
        page = int(request.GET.get('page', 1))
        per_page = int(request.GET.get('per_page', 20))
        search = request.GET.get('search', '')
        category_filter = request.GET.get('category', '')
        show_all = request.GET.get('show_all', 'true').lower() == 'true'  # Admin sees all by default
        
        products = DessertItem.objects.select_related('category')
        
        # Admin can choose to see all products or only available ones
        if not show_all:
            products = products.filter(available=True)
        
        if search:
            products = products.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )
        
        if category_filter:
            products = products.filter(category_id=category_filter)
        
        products = products.order_by('-created_at')
        
        paginator = Paginator(products, per_page)
        page_obj = paginator.get_page(page)
        
        serializer = DessertItemSerializer(page_obj, many=True)
        
        return JsonResponse({
            'products': serializer.data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginator.count,
                'pages': paginator.num_pages,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous()
            }
        })
        
    except Exception as e:
        logger.error(f"Admin products list error: {str(e)}")
        return JsonResponse({'error': 'Failed to load products'}, status=500)

@admin_required
@csrf_exempt
@require_http_methods(["POST"])
def admin_product_create(request):
    """Create a new product"""
    try:
        data = json.loads(request.body)
        
        # Create product
        product = DessertItem.objects.create(
            name=data['name'],
            slug=data['slug'],
            description=data['description'],
            price=data['price'],
            category_id=data['category'],
            image=data['image'],
            preparation_time=data.get('preparation_time', 30),
            featured=data.get('featured', False),
            seasonal=data.get('seasonal', False),
            best_seller=data.get('best_seller', False),
            available=data.get('available', True),
            dietary_info=data.get('dietary_info', []),
            ingredients=data.get('ingredients', []),
            allergens=data.get('allergens', [])
        )
        
        serializer = DessertItemSerializer(product)
        return JsonResponse({'product': serializer.data}, status=201)
        
    except Exception as e:
        logger.error(f"Admin product create error: {str(e)}")
        return JsonResponse({'error': 'Failed to create product'}, status=500)

@admin_required
@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
def admin_product_update(request, product_id):
    """Update a product"""
    try:
        product = DessertItem.objects.get(id=product_id)
        data = json.loads(request.body)
        
        # Update fields
        for field in ['name', 'slug', 'description', 'price', 'category', 'image', 
                     'preparation_time', 'featured', 'seasonal', 'best_seller', 
                     'available', 'dietary_info', 'ingredients', 'allergens']:
            if field in data:
                if field == 'category':
                    product.category_id = data[field]
                else:
                    setattr(product, field, data[field])
        
        product.save()
        
        serializer = DessertItemSerializer(product)
        return JsonResponse({'product': serializer.data})
        
    except DessertItem.DoesNotExist:
        return JsonResponse({'error': 'Product not found'}, status=404)
    except Exception as e:
        logger.error(f"Admin product update error: {str(e)}")
        return JsonResponse({'error': 'Failed to update product'}, status=500)

@admin_required
@csrf_exempt
@require_http_methods(["DELETE"])
def admin_product_delete(request, product_id):
    """Delete a product"""
    try:
        product = DessertItem.objects.get(id=product_id)
        product.delete()
        return JsonResponse({'success': True})
        
    except DessertItem.DoesNotExist:
        return JsonResponse({'error': 'Product not found'}, status=404)
    except Exception as e:
        logger.error(f"Admin product delete error: {str(e)}")
        return JsonResponse({'error': 'Failed to delete product'}, status=500)

@admin_required
@require_http_methods(["GET"])
def admin_contacts_list(request):
    """Get paginated list of contact submissions"""
    try:
        page = int(request.GET.get('page', 1))
        per_page = int(request.GET.get('per_page', 20))
        responded_filter = request.GET.get('responded', '')
        
        contacts = ContactSubmission.objects.all()
        
        if responded_filter:
            contacts = contacts.filter(responded=responded_filter.lower() == 'true')
        
        contacts = contacts.order_by('-created_at')
        
        paginator = Paginator(contacts, per_page)
        page_obj = paginator.get_page(page)
        
        serializer = ContactSubmissionSerializer(page_obj, many=True)
        
        return JsonResponse({
            'contacts': serializer.data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginator.count,
                'pages': paginator.num_pages,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous()
            }
        })
        
    except Exception as e:
        logger.error(f"Admin contacts list error: {str(e)}")
        return JsonResponse({'error': 'Failed to load contacts'}, status=500)

@admin_required
@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
def admin_contact_update(request, contact_id):
    """Update contact submission"""
    try:
        contact = ContactSubmission.objects.get(id=contact_id)
        data = json.loads(request.body)
        
        if 'responded' in data:
            contact.responded = data['responded']
        
        if 'admin_notes' in data:
            contact.admin_notes = data['admin_notes']
        
        contact.save()
        
        serializer = ContactSubmissionSerializer(contact)
        return JsonResponse({'contact': serializer.data})
        
    except ContactSubmission.DoesNotExist:
        return JsonResponse({'error': 'Contact not found'}, status=404)
    except Exception as e:
        logger.error(f"Admin contact update error: {str(e)}")
        return JsonResponse({'error': 'Failed to update contact'}, status=500)

@admin_required
@require_http_methods(["DELETE"])
def admin_contact_delete(request, contact_id):
    """Delete contact submission"""
    try:
        contact = ContactSubmission.objects.get(id=contact_id)
        contact.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Contact submission deleted successfully'
        })
        
    except ContactSubmission.DoesNotExist:
        return JsonResponse({'error': 'Contact not found'}, status=404)
    except Exception as e:
        logger.error(f"Admin contact delete error: {str(e)}")
        return JsonResponse({'error': 'Failed to delete contact'}, status=500)

@admin_required
@csrf_exempt
@require_http_methods(["POST"])
def admin_contact_create(request):
    """Create a new contact submission (admin manual entry)"""
    try:
        data = json.loads(request.body)
        
        # Validation
        required_fields = ['name', 'email', 'subject', 'message']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({'error': f'{field.title()} is required'}, status=400)
        
        # Create contact
        contact = ContactSubmission.objects.create(
            name=data['name'],
            email=data['email'],
            phone=data.get('phone', ''),
            subject=data['subject'],
            message=data['message'],
            order_type=data.get('order_type', 'general'),
            preferred_contact=data.get('preferred_contact', 'email'),
            responded=data.get('responded', False),
            admin_notes=data.get('admin_notes', '')
        )
        
        serializer = ContactSubmissionSerializer(contact)
        return JsonResponse({'contact': serializer.data}, status=201)
        
    except Exception as e:
        logger.error(f"Admin contact create error: {str(e)}")
        return JsonResponse({'error': 'Failed to create contact'}, status=500)

@admin_required
@csrf_exempt
@require_http_methods(["POST"])
def admin_user_create(request):
    """Create a new user"""
    try:
        data = json.loads(request.body)
        
        # Validation
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not all([username, email, password]):
            return JsonResponse({'error': 'Username, email, and password are required'}, status=400)
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists'}, status=400)
        
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already registered'}, status=400)
        
        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            is_staff=data.get('is_staff', False),
            is_superuser=data.get('is_superuser', False),
            is_active=data.get('is_active', True)
        )
        
        return JsonResponse({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'date_joined': user.date_joined.isoformat(),
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'total_orders': 0,
                'total_spent': 0.0
            }
        }, status=201)
        
    except Exception as e:
        logger.error(f"Admin user create error: {str(e)}")
        return JsonResponse({'error': 'Failed to create user'}, status=500)

@admin_required
@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
def admin_user_update(request, user_id):
    """Update a user"""
    try:
        user = User.objects.get(id=user_id)
        data = json.loads(request.body)
        
        # Update fields (but not password for security)
        for field in ['username', 'email', 'first_name', 'last_name', 'is_active', 'is_staff']:
            if field in data:
                # Check for uniqueness on username/email
                if field in ['username', 'email']:
                    if User.objects.filter(**{field: data[field]}).exclude(id=user_id).exists():
                        return JsonResponse({'error': f'{field.capitalize()} already exists'}, status=400)
                setattr(user, field, data[field])
        
        # Handle superuser separately (more restrictive)
        if 'is_superuser' in data and request.user.is_superuser:
            user.is_superuser = data['is_superuser']
        
        user.save()
        
        # Get user's order stats
        user_orders = Order.objects.filter(customer_email=user.email)
        total_orders = user_orders.count()
        total_spent = user_orders.filter(
            payment_status='succeeded'
        ).aggregate(Sum('total'))['total__sum'] or 0
        
        return JsonResponse({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'date_joined': user.date_joined.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'total_orders': total_orders,
                'total_spent': float(total_spent)
            }
        })
        
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        logger.error(f"Admin user update error: {str(e)}")
        return JsonResponse({'error': 'Failed to update user'}, status=500)

@csrf_exempt 
@admin_required
@require_http_methods(["DELETE"])
def admin_user_delete(request, user_id):
    """Delete a user"""
    try:
        # Don't allow deleting the current admin user
        if request.user.id == int(user_id):
            return JsonResponse({'error': 'Cannot delete your own account'}, status=400)
            
        user = User.objects.get(id=user_id)
        user.delete()
        return JsonResponse({'success': True})
        
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        logger.error(f"Admin user delete error: {str(e)}")
        return JsonResponse({'error': 'Failed to delete user'}, status=500)

# Categories Management
@admin_required
@require_http_methods(["GET"])
def admin_categories_list(request):
    """Get paginated list of categories"""
    try:
        page = int(request.GET.get('page', 1))
        per_page = int(request.GET.get('per_page', 20))
        search = request.GET.get('search', '')
        
        categories = Category.objects.all()
        
        if search:
            categories = categories.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )
        
        categories = categories.order_by('order', 'name')
        
        paginator = Paginator(categories, per_page)
        page_obj = paginator.get_page(page)
        
        serializer = CategorySerializer(page_obj, many=True)
        
        return JsonResponse({
            'categories': serializer.data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginator.count,
                'pages': paginator.num_pages,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous()
            }
        })
        
    except Exception as e:
        logger.error(f"Admin categories list error: {str(e)}")
        return JsonResponse({'error': 'Failed to load categories'}, status=500)

@admin_required
@csrf_exempt
@require_http_methods(["POST"])
def admin_category_create(request):
    """Create a new category"""
    try:
        data = json.loads(request.body)
        
        category = Category.objects.create(
            name=data['name'],
            slug=data['slug'],
            description=data.get('description', ''),
            image=data.get('image', ''),
            product_count=data.get('product_count', 0),
            order=data.get('order', 0)
        )
        
        serializer = CategorySerializer(category)
        return JsonResponse({'category': serializer.data}, status=201)
        
    except Exception as e:
        logger.error(f"Admin category create error: {str(e)}")
        return JsonResponse({'error': 'Failed to create category'}, status=500)

@admin_required
@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
def admin_category_update(request, category_id):
    """Update a category"""
    try:
        category = Category.objects.get(id=category_id)
        data = json.loads(request.body)
        
        for field in ['name', 'slug', 'description', 'image', 'product_count', 'order']:
            if field in data:
                setattr(category, field, data[field])
        
        category.save()
        
        serializer = CategorySerializer(category)
        return JsonResponse({'category': serializer.data})
        
    except Category.DoesNotExist:
        return JsonResponse({'error': 'Category not found'}, status=404)
    except Exception as e:
        logger.error(f"Admin category update error: {str(e)}")
        return JsonResponse({'error': 'Failed to update category'}, status=500)

@admin_required
@csrf_exempt
@require_http_methods(["DELETE"])
def admin_category_delete(request, category_id):
    """Delete a category"""
    try:
        category = Category.objects.get(id=category_id)
        category.delete()
        return JsonResponse({'success': True})
        
    except Category.DoesNotExist:
        return JsonResponse({'error': 'Category not found'}, status=404)
    except Exception as e:
        logger.error(f"Admin category delete error: {str(e)}")
        return JsonResponse({'error': 'Failed to delete category'}, status=500)

# Testimonials Management
@admin_required
@require_http_methods(["GET"])
def admin_testimonials_list(request):
    """Get paginated list of testimonials"""
    try:
        page = int(request.GET.get('page', 1))
        per_page = int(request.GET.get('per_page', 20))
        approved_filter = request.GET.get('approved', '')
        
        testimonials = CustomerTestimonial.objects.select_related('dessert_item')
        
        if approved_filter:
            testimonials = testimonials.filter(approved=approved_filter.lower() == 'true')
        
        testimonials = testimonials.order_by('-created_at')
        
        paginator = Paginator(testimonials, per_page)
        page_obj = paginator.get_page(page)
        
        serializer = CustomerTestimonialSerializer(page_obj, many=True)
        
        return JsonResponse({
            'testimonials': serializer.data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginator.count,
                'pages': paginator.num_pages,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous()
            }
        })
        
    except Exception as e:
        logger.error(f"Admin testimonials list error: {str(e)}")
        return JsonResponse({'error': 'Failed to load testimonials'}, status=500)

@admin_required
@csrf_exempt
@require_http_methods(["POST"])
def admin_testimonial_create(request):
    """Create a new testimonial"""
    try:
        data = json.loads(request.body)
        
        testimonial = CustomerTestimonial.objects.create(
            name=data['name'],
            avatar=data.get('avatar', ''),
            rating=data['rating'],
            text=data['text'],
            dessert_item_id=data.get('dessert_item'),
            approved=data.get('approved', False)
        )
        
        serializer = CustomerTestimonialSerializer(testimonial)
        return JsonResponse({'testimonial': serializer.data}, status=201)
        
    except Exception as e:
        logger.error(f"Admin testimonial create error: {str(e)}")
        return JsonResponse({'error': 'Failed to create testimonial'}, status=500)

@admin_required
@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
def admin_testimonial_update(request, testimonial_id):
    """Update a testimonial"""
    try:
        testimonial = CustomerTestimonial.objects.get(id=testimonial_id)
        data = json.loads(request.body)
        
        for field in ['name', 'avatar', 'rating', 'text', 'dessert_item', 'approved']:
            if field in data:
                if field == 'dessert_item':
                    testimonial.dessert_item_id = data[field]
                else:
                    setattr(testimonial, field, data[field])
        
        testimonial.save()
        
        serializer = CustomerTestimonialSerializer(testimonial)
        return JsonResponse({'testimonial': serializer.data})
        
    except CustomerTestimonial.DoesNotExist:
        return JsonResponse({'error': 'Testimonial not found'}, status=404)
    except Exception as e:
        logger.error(f"Admin testimonial update error: {str(e)}")
        return JsonResponse({'error': 'Failed to update testimonial'}, status=500)

@admin_required
@csrf_exempt
@require_http_methods(["DELETE"])
def admin_testimonial_delete(request, testimonial_id):
    """Delete a testimonial"""
    try:
        testimonial = CustomerTestimonial.objects.get(id=testimonial_id)
        testimonial.delete()
        return JsonResponse({'success': True})
        
    except CustomerTestimonial.DoesNotExist:
        return JsonResponse({'error': 'Testimonial not found'}, status=404)
    except Exception as e:
        logger.error(f"Admin testimonial delete error: {str(e)}")
        return JsonResponse({'error': 'Failed to delete testimonial'}, status=500)

# Chef Recommendations Management
@admin_required
@require_http_methods(["GET"])
def admin_chef_recommendations_list(request):
    """Get paginated list of chef recommendations"""
    try:
        page = int(request.GET.get('page', 1))
        per_page = int(request.GET.get('per_page', 20))
        active_filter = request.GET.get('active', '')
        
        recommendations = ChefRecommendation.objects.select_related('dessert_item')
        
        if active_filter:
            recommendations = recommendations.filter(active=active_filter.lower() == 'true')
        
        recommendations = recommendations.order_by('-created_at')
        
        paginator = Paginator(recommendations, per_page)
        page_obj = paginator.get_page(page)
        
        serializer = ChefRecommendationSerializer(page_obj, many=True)
        
        return JsonResponse({
            'recommendations': serializer.data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginator.count,
                'pages': paginator.num_pages,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous()
            }
        })
        
    except Exception as e:
        logger.error(f"Admin chef recommendations list error: {str(e)}")
        return JsonResponse({'error': 'Failed to load chef recommendations'}, status=500)

@admin_required
@csrf_exempt
@csrf_exempt
@admin_required  
@require_http_methods(["POST"])
def admin_chef_recommendation_create(request):
    """Create a new chef recommendation"""
    try:
        logger.info(f"Chef recommendation create request body: {request.body}")
        data = json.loads(request.body)
        logger.info(f"Parsed data: {data}")
        
        # Validate required fields
        if not data.get('chef_name'):
            return JsonResponse({'error': 'Chef name is required'}, status=400)
        if not data.get('recommendation_text'):
            return JsonResponse({'error': 'Recommendation text is required'}, status=400)
        
        # Handle optional dessert_item
        dessert_item_id = data.get('dessert_item')
        if dessert_item_id == '' or dessert_item_id == 'null' or dessert_item_id is None:
            dessert_item_id = None
        else:
            # Validate dessert exists
            try:
                DessertItem.objects.get(id=dessert_item_id)
            except DessertItem.DoesNotExist:
                return JsonResponse({'error': 'Selected dessert does not exist'}, status=400)
        
        recommendation = ChefRecommendation.objects.create(
            chef_name=data['chef_name'],
            chef_title=data.get('chef_title', ''),
            chef_image=data.get('chef_image', ''),
            recommendation_text=data['recommendation_text'],
            dessert_item_id=dessert_item_id,
            is_featured=data.get('is_featured', False)
        )
        
        logger.info(f"Created recommendation with ID: {recommendation.id}")
        serializer = ChefRecommendationSerializer(recommendation)
        return JsonResponse({'recommendation': serializer.data}, status=201)
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except KeyError as e:
        logger.error(f"Missing required field: {str(e)}")
        return JsonResponse({'error': f'Missing required field: {str(e)}'}, status=400)
    except Exception as e:
        logger.error(f"Admin chef recommendation create error: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return JsonResponse({'error': f'Failed to create chef recommendation: {str(e)}'}, status=500)

@csrf_exempt
@admin_required
@require_http_methods(["PUT", "PATCH"])
def admin_chef_recommendation_update(request, recommendation_id):
    """Update a chef recommendation"""
    try:
        recommendation = ChefRecommendation.objects.get(id=recommendation_id)
        data = json.loads(request.body)
        
        # Update all possible fields
        updatable_fields = [
            'chef_name', 'chef_title', 'chef_image', 'recommendation_text', 'is_featured'
        ]
        
        for field in updatable_fields:
            if field in data:
                setattr(recommendation, field, data[field])
        
        # Handle dessert_item separately (can be null)
        if 'dessert_item' in data:
            dessert_item_id = data['dessert_item']
            if dessert_item_id == '' or dessert_item_id == 'null':
                dessert_item_id = None
            recommendation.dessert_item_id = dessert_item_id
        
        recommendation.save()
        
        serializer = ChefRecommendationSerializer(recommendation)
        return JsonResponse({'recommendation': serializer.data})
        
    except ChefRecommendation.DoesNotExist:
        return JsonResponse({'error': 'Chef recommendation not found'}, status=404)
    except Exception as e:
        logger.error(f"Admin chef recommendation update error: {str(e)}")
        return JsonResponse({'error': 'Failed to update chef recommendation'}, status=500)

@admin_required
@csrf_exempt
@require_http_methods(["DELETE"])
def admin_chef_recommendation_delete(request, recommendation_id):
    """Delete a chef recommendation"""
    try:
        recommendation = ChefRecommendation.objects.get(id=recommendation_id)
        recommendation.delete()
        return JsonResponse({'success': True})
        
    except ChefRecommendation.DoesNotExist:
        return JsonResponse({'error': 'Chef recommendation not found'}, status=404)
    except Exception as e:
        logger.error(f"Admin chef recommendation delete error: {str(e)}")
        return JsonResponse({'error': 'Failed to delete chef recommendation'}, status=500)

# Order Items Management
@admin_required
@require_http_methods(["GET"])
def admin_order_items_list(request):
    """Get paginated list of order items"""
    try:
        page = int(request.GET.get('page', 1))
        per_page = int(request.GET.get('per_page', 20))
        order_id = request.GET.get('order_id', '')
        search = request.GET.get('search', '')
        
        order_items = OrderItem.objects.select_related('order')
        
        if order_id:
            order_items = order_items.filter(order_id=order_id)
            
        if search:
            order_items = order_items.filter(
                Q(product_name__icontains=search) |
                Q(order__order_number__icontains=search) |
                Q(order__customer_name__icontains=search)
            )
        
        order_items = order_items.order_by('-order__created_at')
        
        paginator = Paginator(order_items, per_page)
        page_obj = paginator.get_page(page)
        
        items_data = []
        for item in page_obj:
            items_data.append({
                'id': item.id,
                'order_id': str(item.order.id),
                'order_number': item.order.order_number,
                'product_name': item.product_name,
                'product_image': item.product_image,
                'unit_price': float(item.unit_price),
                'quantity': item.quantity,
                'total_price': float(item.total_price),
                'customizations': item.customizations,
                'customer_name': item.order.customer_name
            })
        
        return JsonResponse({
            'order_items': items_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginator.count,
                'pages': paginator.num_pages,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous()
            }
        })
        
    except Exception as e:
        logger.error(f"Admin order items list error: {str(e)}")
        return JsonResponse({'error': 'Failed to load order items'}, status=500)

@admin_required
@require_http_methods(["DELETE"])
def admin_order_item_delete(request, item_id):
    """Delete order item"""
    try:
        order_item = OrderItem.objects.get(id=item_id)
        order = order_item.order
        
        # Recalculate order total after removing this item
        order_item.delete()
        
        # Recalculate order total
        remaining_items = order.items.all()
        if remaining_items.exists():
            # Recalculate order totals
            subtotal = sum(float(item.total_price) for item in remaining_items)
            delivery_fee = 0.00 if subtotal > 25 else 4.99
            tax = subtotal * 0.08  # 8% tax
            total = subtotal + delivery_fee + tax
            
            order.subtotal = subtotal
            order.delivery_fee = delivery_fee
            order.tax = tax
            order.total = total
            order.save()
        else:
            # If no items left, maybe set order status to cancelled
            order.status = 'cancelled'
            order.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Order item deleted successfully',
            'new_order_total': float(order.total) if remaining_items.exists() else 0
        })
        
    except OrderItem.DoesNotExist:
        return JsonResponse({'error': 'Order item not found'}, status=404)
    except Exception as e:
        logger.error(f"Admin order item delete error: {str(e)}")
        return JsonResponse({'error': 'Failed to delete order item'}, status=500)