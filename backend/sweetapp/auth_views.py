from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from .models import Order, OrderItem
import json
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["POST"])
def register_view(request):
    """Register a new user"""
    try:
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        
        # Validation
        if not all([username, email, password, confirm_password]):
            return JsonResponse({'error': 'All fields are required'}, status=400)
        
        if password != confirm_password:
            return JsonResponse({'error': 'Passwords do not match'}, status=400)
        
        if len(password) < 8:
            return JsonResponse({'error': 'Password must be at least 8 characters long'}, status=400)
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists'}, status=400)
        
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already registered'}, status=400)
        
        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        
        # Log the user in
        login(request, user)
        
        return JsonResponse({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        })
        
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return JsonResponse({'error': 'Registration failed'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    """Login user"""
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return JsonResponse({'error': 'Username and password are required'}, status=400)
        
        # Authenticate user
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            
            # Force session save and set explicit data
            request.session['user_id'] = user.id
            request.session['is_authenticated'] = True
            request.session.save()
            
            # Check if user is admin
            is_admin = (user.is_superuser or 
                       user.email == 'admin@gmail.com' or 
                       user.username.lower() == 'admin')
            
            logger.info(f"=== LOGIN DEBUG ===")
            logger.info(f"User logged in: {user.username}")
            logger.info(f"Is admin: {is_admin}")
            logger.info(f"Session key: {request.session.session_key}")
            logger.info(f"Session data: {dict(request.session.items())}")
            logger.info(f"User authenticated after login: {request.user.is_authenticated}")
            
            return JsonResponse({
                'success': True,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_admin': is_admin,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser
                }
            })
        else:
            return JsonResponse({'error': 'Invalid username or password'}, status=401)
            
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return JsonResponse({'error': 'Login failed'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def logout_view(request):
    """Logout user"""
    logout(request)
    return JsonResponse({'success': True})

@login_required
@require_http_methods(["GET"])
def user_info_view(request):
    """Get current user info"""
    return JsonResponse({
        'user': {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email
        }
    })

@ensure_csrf_cookie
@require_http_methods(["GET"])
def check_auth_view(request):
    """Check if user is authenticated"""
    logger.info(f"Auth check - Session key: {request.session.session_key}")
    logger.info(f"Auth check - User: {request.user}, Is authenticated: {request.user.is_authenticated}")
    
    if request.user.is_authenticated:
        # Check if user is admin
        is_admin = (request.user.is_superuser or 
                   request.user.email == 'admin@gmail.com' or 
                   request.user.username.lower() == 'admin')
        
        logger.info(f"User {request.user.username} - is_admin: {is_admin}")
                   
        return JsonResponse({
            'authenticated': True,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'is_admin': is_admin,
                'is_staff': request.user.is_staff,
                'is_superuser': request.user.is_superuser
            }
        })
    else:
        return JsonResponse({'authenticated': False})

@login_required
@require_http_methods(["GET"])
def dashboard_view(request):
    """Get dashboard data for authenticated user"""
    try:
        # Get user's orders
        user_orders = Order.objects.filter(
            customer_email=request.user.email
        ).order_by('-created_at')[:10]  # Last 10 orders
        
        orders_data = []
        for order in user_orders:
            order_items = OrderItem.objects.filter(order=order)
            orders_data.append({
                'id': str(order.id),
                'order_number': order.order_number,
                'total': float(order.total),
                'status': order.status,
                'created_at': order.created_at.isoformat(),
                'items_count': order_items.count()
            })
        
        return JsonResponse({
            'user': {
                'username': request.user.username,
                'email': request.user.email,
                'date_joined': request.user.date_joined.isoformat()
            },
            'orders': orders_data,
            'stats': {
                'total_orders': user_orders.count(),
                'total_spent': float(sum(order.total for order in user_orders))
            }
        })
    except Exception as e:
        logger.error(f"Dashboard error: {str(e)}")
        return JsonResponse({'error': 'Failed to load dashboard data'}, status=500)