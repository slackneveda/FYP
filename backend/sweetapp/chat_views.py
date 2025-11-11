"""
Chat Assistant Views with OpenRouter API Integration
Handles streaming chat responses, order intent detection, and cart management
"""
# cSpell:ignore OPENROUTER mistralai choco Dreamcake Referer

import json
import re
import logging
import requests
from django.http import StreamingHttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Q
from decouple import config
from .vector_db import get_vector_db
from .models import DessertItem

logger = logging.getLogger(__name__)

# OpenRouter API Configuration
OPENROUTER_API_KEY = config('OPENROUTER_API_KEY', default='')
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = "mistralai/mistral-7b-instruct"


def detect_order_intent(message: str, context_products: list) -> dict:
    """
    Detect if user wants to order products and extract product details
    
    Args:
        message: User's message
        context_products: List of products from ChromaDB search
        
    Returns:
        Dictionary with intent detection results
    """
    order_keywords = [
        'order', 'buy', 'purchase', 'add to cart', 'want', 'get', 
        'take', 'need', 'i\'ll have', 'give me', 'add', 'checkout'
    ]
    
    list_keywords = ['list', 'show', 'all', 'available', 'what do you have']
    checkout_keywords = [
        'yes proceed', 'yes, proceed', 'yes please', 'yes to payment', 'yes to checkout',
        'proceed to checkout', 'proceed to payment',
        'take me to checkout', 'take me to payment', 'take me to the payment', 
        'go to checkout', 'go to payment', 'checkout now', 'pay now', 'payment now',
        'complete order', 'finalize order', 'yes take me', 'payment page', 'checkout page',
        'yes, payment', 'yes payment', 'yes, checkout', 'yes checkout'
    ]
    
    message_lower = message.lower()
    
    # Check for checkout intent FIRST (highest priority)
    has_checkout_intent = any(keyword in message_lower for keyword in checkout_keywords)
    if has_checkout_intent:
        return {
            'has_intent': False,
            'products': [],
            'action': 'checkout'
        }
    
    # Check for order intent BEFORE list intent (to avoid false positives)
    has_order_intent = any(keyword in message_lower for keyword in order_keywords)
    
    # Check for list intent - but make sure it's not an order request
    # List requests should have phrases like "show all", "list all", "what do you have"
    list_phrases = ['list all', 'show all', 'list me', 'show me all', 'what do you have', 'what are your']
    has_list_intent = any(phrase in message_lower for phrase in list_phrases)
    
    # If it's a list intent without order intent, return list action
    if has_list_intent and not has_order_intent:
        return {
            'has_intent': False,
            'products': [],
            'action': 'list',
            'list_products': context_products
        }
    
    # Now check for order intent
    if not has_order_intent:
        return {'has_intent': False, 'products': [], 'action': 'none'}
    
    # Check if this is a generic order request without specific product
    generic_requests = [
        'order a dessert', 'order dessert', 'order something', 'order anything',
        'buy a dessert', 'buy dessert', 'get a dessert', 'get dessert',
        'want a dessert', 'want dessert', 'want something sweet'
    ]
    
    is_generic = any(generic in message_lower for generic in generic_requests)
    
    # If generic request, don't try to add to cart - let AI ask for specifics
    if is_generic:
        return {'has_intent': False, 'products': [], 'action': 'none'}
    
    # Extract products from database instead of vector DB
    detected_products = []
    
    # Search database for matching products
    try:
        # Extract potential product names from message
        products_queryset = DessertItem.objects.filter(available=True)
        
        # Normalize message for better matching (remove hyphens, extra spaces)
        normalized_message = message_lower.replace('-', ' ').replace('  ', ' ')
        
        # Try to find products mentioned in the message
        for product in products_queryset:
            product_name_lower = product.name.lower()
            normalized_product_name = product_name_lower.replace('-', ' ').replace('  ', ' ')
            
            # Check if product name is in message (exact match)
            if normalized_product_name in normalized_message or product_name_lower in message_lower:
                detected_products.append({
                    'name': product.name,
                    'price': str(product.price),
                    'category': product.category.name,
                    'id': product.id,
                    'image': product.image  # Add product image
                })
                break  # Found exact match
            
            # Check for partial matches (key words from product name)
            # Extract significant words (longer than 3 chars, not common words)
            common_words = ['cake', 'the', 'and', 'with']
            product_words = [
                word for word in normalized_product_name.split() 
                if len(word) > 3 and word not in common_words
            ]
            
            # If we have at least 2 significant words, check if they're all in the message
            if len(product_words) >= 2 and all(word in normalized_message for word in product_words):
                detected_products.append({
                    'name': product.name,
                    'price': str(product.price),
                    'category': product.category.name,
                    'id': product.id,
                    'image': product.image  # Add product image
                })
                break  # Found partial match
        
        # Limit to top 1 product to avoid over-adding
        detected_products = detected_products[:1]
        
    except Exception as e:
        logger.error(f"Error detecting products from database: {e}")
    
    return {
        'has_intent': True,
        'products': detected_products,
        'confidence': 'high' if detected_products else 'low',
        'action': 'add_to_cart'
    }


def build_system_prompt(context_chunks: list, user_authenticated: bool = False, username: str = None) -> str:
    """
    Build system prompt with context from ChromaDB
    
    Args:
        context_chunks: List of relevant product chunks from vector search
        user_authenticated: Whether user is logged in
        username: Username if authenticated
        
    Returns:
        Formatted system prompt string
    """
    # Build context from ChromaDB results
    context_items = []
    
    for chunk in context_chunks:
        metadata = chunk.get('metadata', {})
        product_name = metadata.get('product_name', 'Product')
        price = metadata.get('price', 'N/A')
        category = metadata.get('category', 'Dessert')
        
        # Get a snippet of the description (first 300 chars)
        description = chunk.get('text', '')[:300]
        
        context_items.append(
            f"**{product_name}** (Category: {category}, Price: Rs. {price})\n{description}..."
        )
    
    context_text = "\n\n".join(context_items) if context_items else "No specific products found."
    
    auth_status = f"User is logged in as **{username}**" if user_authenticated else "User is NOT logged in"
    
    system_prompt = f"""You are a friendly and helpful AI assistant for Sweet Dessert, a premium dessert shop.

**Your Role:**
- Help customers discover and learn about our delicious desserts
- Provide information about products, ingredients, pricing, and ordering
- Guide users through the ordering process
- Be warm, enthusiastic, and professional
- Use emojis sparingly but appropriately 🍰

**Current User Status:** {auth_status}

**Available Menu Items (based on current query):**

{context_text}

**Guidelines:**
1. Use the product information above to answer questions accurately
2. Always mention prices in PKR (Pakistani Rupees) as "Rs. [amount]"
3. If asked about products not in the context, politely mention what we do have available
4. When user asks to "list" or "show all" products in a category, provide a formatted list
5. Encourage customers to explore our full menu and special offers
6. Be concise but informative - aim for 2-3 sentences unless more detail is requested

**Ordering Process:**
- If customer says they want to order but doesn't specify WHICH product (e.g., "I want to order a dessert"), ask them which specific dessert they'd like from the menu
- If customer wants to order a SPECIFIC product and is LOGGED IN: 
  * ALWAYS give a HAPPY, ENTHUSIASTIC confirmation message
  * Example: "Great choice! 🎉 I've added [Exact Product Name] to your cart!"
  * Then IMMEDIATELY ask: "Would you like to order more items, or shall we proceed to checkout?"
  * NEVER skip asking this question - it's mandatory after every order
- If customer wants to order but is NOT LOGGED IN: Politely inform them they need to sign up/login first
- Always confirm the EXACT product name when adding to cart
- Be excited and positive about their order
- After confirming, you MUST ask if they want to order more - this is required!
- If they say "no" or "I'm done" or "proceed", ask: "Should I take you to the payment page to complete your order?"
- ONLY after they confirm (yes/proceed/checkout) should you indicate they will be redirected
- Never automatically redirect - always get user confirmation first

**Important Commands:**
- "List [category]" or "Show all [category]" → Provide formatted list of products in that category
- "Order [product]" or "I want [product]" → Add to cart if logged in, confirm with happy message, ask if they want more
- "Proceed to payment" or "Checkout" or "Yes, proceed" → Confirm and indicate they will be taken to payment page

**Sweet Dessert Information:**
- We offer cakes, brownies, cookies, cupcakes, donuts, ice cream, and more
- Both delivery and takeaway options available
- Customization options available for many items
- Secure online ordering through our website
- Payment via Stripe (all major cards accepted)

Respond naturally and helpfully to the customer's query!"""
    
    return system_prompt


def generate_chat_stream(message: str, context_chunks: list, user_authenticated: bool = False, username: str = None):
    """
    Generate streaming response from OpenRouter API
    
    Args:
        message: User's message
        context_chunks: Relevant context from ChromaDB
        user_authenticated: Whether user is logged in
        username: Username if authenticated
        
    Yields:
        Server-Sent Events formatted chunks
    """
    # Build system prompt with context
    system_prompt = build_system_prompt(context_chunks, user_authenticated, username)
    
    # Prepare API request headers
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "Sweet Dessert Chat Assistant"
    }
    
    # Prepare request payload
    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message}
        ],
        "stream": True,
        "temperature": 0.7,
        "max_tokens": 600,
        "top_p": 0.9
    }
    
    try:
        # Make streaming request to OpenRouter
        response = requests.post(
            OPENROUTER_API_URL,
            headers=headers,
            json=payload,
            stream=True,
            timeout=30
        )
        
        response.raise_for_status()
        
        # Stream the response
        for line in response.iter_lines():
            if not line:
                continue
            
            line_text = line.decode('utf-8')
            
            # OpenRouter uses SSE format: "data: {json}"
            if line_text.startswith('data: '):
                data_str = line_text[6:].strip()
                
                # Check for completion
                if data_str == '[DONE]':
                    yield 'data: [DONE]\n\n'
                    break
                
                try:
                    chunk_data = json.loads(data_str)
                    
                    # Extract content from response
                    if 'choices' in chunk_data and chunk_data['choices']:
                        delta = chunk_data['choices'][0].get('delta', {})
                        content = delta.get('content', '')
                        
                        if content:
                            yield f'data: {json.dumps({"content": content})}\n\n'
                            
                except json.JSONDecodeError as e:
                    logger.warning(f"JSON decode error: {e}")
                    continue
                    
    except requests.exceptions.Timeout:
        logger.error("OpenRouter API request timed out")
        yield f'data: {json.dumps({"error": "Request timed out. Please try again."})}\n\n'
    except requests.exceptions.RequestException as e:
        logger.error(f"OpenRouter API request failed: {e}")
        yield f'data: {json.dumps({"error": "Failed to connect to AI service. Please try again."})}\n\n'
    except Exception as e:
        logger.error(f"Unexpected error in chat generation: {e}")
        yield f'data: {json.dumps({"error": "An unexpected error occurred."})}\n\n'


@csrf_exempt
@require_http_methods(["POST"])
def chat_stream(request):
    """
    Main streaming chat endpoint
    
    Handles:
    - Vector search for context
    - Order intent detection
    - Cart management
    - Streaming AI responses
    - Authentication checking
    """
    try:
        # Parse request body
        data = json.loads(request.body)
        message = data.get('message', '').strip()
        
        if not message:
            return JsonResponse({'error': 'No message provided'}, status=400)
        
        logger.info(f"Chat request: '{message[:100]}...'")
        
        # Check authentication status
        is_authenticated = request.user.is_authenticated
        username = request.user.username if is_authenticated else None
        
        # Get vector database instance
        vector_db = get_vector_db()
        
        # Search ChromaDB for relevant context
        search_results = vector_db.search(message, n_results=5)  # Get more results for listing
        
        logger.info(f"Found {len(search_results)} relevant products")
        
        # Detect order intent
        order_intent = detect_order_intent(message, search_results)
        
        def event_stream():
            """Generate Server-Sent Events stream"""
            
            # Handle different actions
            action = order_intent.get('action', 'none')
            
            # Handle list intent
            if action == 'list' and order_intent.get('list_products'):
                # Get products from database instead of vector search
                category_query = message.lower()
                
                # Start with all available products
                products_queryset = DessertItem.objects.filter(available=True)
                
                # Filter by category if mentioned
                if any(keyword in category_query for keyword in ['chocolate', 'choco']):
                    products_queryset = products_queryset.filter(
                        Q(name__icontains='chocolate') | 
                        Q(category__name__icontains='chocolate')
                    )
                elif any(keyword in category_query for keyword in ['cake', 'cakes']):
                    products_queryset = products_queryset.filter(
                        Q(category__name__icontains='cake')
                    )
                elif any(keyword in category_query for keyword in ['brownie', 'brownies']):
                    products_queryset = products_queryset.filter(
                        Q(name__icontains='brownie') | 
                        Q(category__name__icontains='brownie')
                    )
                elif any(keyword in category_query for keyword in ['cookie', 'cookies']):
                    products_queryset = products_queryset.filter(
                        Q(category__name__icontains='cookie')
                    )
                
                product_list = []
                
                for product in products_queryset[:10]:  # Limit to 10 products
                    product_list.append({
                        'name': product.name,
                        'price': str(product.price),  # Real PKR price from database
                        'category': product.category.name,
                        'description': product.description[:100] + '...' if len(product.description) > 100 else product.description
                    })
                
                # Send product list event
                list_event = {
                    'type': 'product_list',
                    'products': product_list
                }
                yield f'data: {json.dumps(list_event)}\n\n'
            
            # Handle checkout intent
            if action == 'checkout':
                if not is_authenticated:
                    # Send auth required event
                    auth_event = {
                        'type': 'auth_required',
                        'message': 'Please sign in to proceed to checkout'
                    }
                    yield f'data: {json.dumps(auth_event)}\n\n'
                else:
                    # Send checkout redirect event
                    checkout_event = {
                        'type': 'redirect_checkout'
                    }
                    yield f'data: {json.dumps(checkout_event)}\n\n'
            
            # Handle order intent - add to cart
            if action == 'add_to_cart' and order_intent['has_intent'] and order_intent['products']:
                if not is_authenticated:
                    # Send auth required event
                    auth_event = {
                        'type': 'auth_required',
                        'message': 'Please sign up or login to place an order'
                    }
                    yield f'data: {json.dumps(auth_event)}\n\n'
                else:
                    # Initialize cart in session if not exists
                    if 'cart' not in request.session:
                        request.session['cart'] = []
                    
                    # Add products to cart
                    added_products = []
                    for product in order_intent['products']:
                        # Check if product already in cart by name
                        existing = next((p for p in request.session['cart'] if p['name'] == product['name']), None)
                        if not existing:
                            request.session['cart'].append(product)
                            added_products.append(product)
                    
                    if added_products:
                        request.session.modified = True
                        
                        # Send cart update event
                        cart_event = {
                            'type': 'cart_update',
                            'cart': request.session['cart'],
                            'added_products': added_products,
                            'show_confirmation': True  # Flag to show AI confirmation
                        }
                        yield f'data: {json.dumps(cart_event)}\n\n'
                        
                        logger.info(f"Added {len(added_products)} products to cart for user {username}")
                    else:
                        logger.info(f"Products already in cart, skipping duplicate add")
            
            # ALWAYS generate and stream AI response (even if cart actions happened)
            try:
                for chunk in generate_chat_stream(message, search_results, is_authenticated, username):
                    yield chunk
            except Exception as e:
                logger.error(f"Error generating AI response: {e}", exc_info=True)
                error_event = {
                    'content': "I apologize, but I'm having trouble generating a response. Please try again."
                }
                yield f'data: {json.dumps(error_event)}\n\n'
                yield 'data: [DONE]\n\n'
        
        # Create streaming response
        response = StreamingHttpResponse(
            event_stream(),
            content_type='text/event-stream'
        )
        
        # Set headers for SSE (avoid hop-by-hop headers in WSGI)
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        # Note: Connection header removed - not allowed in WSGI
        
        return response
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
    except Exception as e:
        logger.error(f"Error in chat_stream: {e}", exc_info=True)
        return JsonResponse({'error': 'Internal server error'}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def add_to_cart(request):
    """
    Add product to cart by name/query
    
    Query Params:
        product: Product name or search query
    """
    try:
        product_query = request.GET.get('product', '').strip()
        
        if not product_query:
            return JsonResponse({'error': 'No product specified'}, status=400)
        
        # Get vector database
        vector_db = get_vector_db()
        
        # Search for product
        search_results = vector_db.search(product_query, n_results=1)
        
        if not search_results:
            return JsonResponse({'error': 'Product not found'}, status=404)
        
        # Extract product info
        result = search_results[0]
        metadata = result.get('metadata', {})
        
        product = {
            'name': metadata.get('product_name', product_query),
            'price': metadata.get('price', 'N/A'),
            'category': metadata.get('category', 'Dessert')
        }
        
        # Initialize cart if not exists
        if 'cart' not in request.session:
            request.session['cart'] = []
        
        # Add product to cart
        request.session['cart'].append(product)
        request.session.modified = True
        
        logger.info(f"Added product to cart: {product['name']}")
        
        return JsonResponse({
            'success': True,
            'cart': request.session['cart'],
            'added_product': product
        })
        
    except Exception as e:
        logger.error(f"Error in add_to_cart: {e}", exc_info=True)
        return JsonResponse({'error': 'Internal server error'}, status=500)


@require_http_methods(["GET"])
def get_cart(request):
    """Get current cart contents"""
    cart = request.session.get('cart', [])
    return JsonResponse({
        'cart': cart,
        'count': len(cart)
    })


@csrf_exempt
@require_http_methods(["POST"])
def clear_cart(request):
    """Clear all items from cart"""
    request.session['cart'] = []
    request.session.modified = True
    
    logger.info("Cart cleared")
    
    return JsonResponse({
        'success': True,
        'cart': []
    })


@require_http_methods(["GET"])
def chat_stats(request):
    """Get statistics about the chat system"""
    try:
        vector_db = get_vector_db()
        stats = vector_db.get_collection_stats()
        
        return JsonResponse({
            'success': True,
            'stats': stats,
            'api_configured': bool(OPENROUTER_API_KEY)
        })
    except Exception as e:
        logger.error(f"Error getting chat stats: {e}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def chat_analytics(request):
    """
    Get comprehensive chat assistant analytics for admin panel
    """
    try:
        from datetime import datetime, timedelta
        from django.db.models import Count, Q
        from collections import Counter
        
        time_range = request.GET.get('range', '7days')
        
        # Calculate date filter
        now = datetime.now()
        if time_range == '7days':
            start_date = now - timedelta(days=7)
        elif time_range == '30days':
            start_date = now - timedelta(days=30)
        else:
            start_date = datetime.min
        
        # Mock data for now - will be replaced with actual database queries when chat history model is created
        # In production, you'd have a ChatConversation model to store these
        
        # Get vector DB status with error handling
        vector_db_count = 0
        chroma_status = 'Unknown'
        try:
            vector_db = get_vector_db()
            chroma_collection = vector_db.collection  # Use the existing collection from vector_db instance
            vector_db_count = chroma_collection.count()
            chroma_status = 'Active' if vector_db_count > 0 else 'Empty'
            logger.info(f"ChromaDB status: {chroma_status}, Documents: {vector_db_count}")
        except Exception as e:
            logger.error(f"Error accessing ChromaDB: {e}")
            chroma_status = 'Error'
            vector_db_count = 0
        
        # Get popular products from recent orders
        from .models import Order, OrderItem
        
        # Orders in time range
        recent_orders = Order.objects.filter(created_at__gte=start_date) if time_range != 'all' else Order.objects.all()
        
        # Count orders that likely came from chat (could be enhanced with a 'source' field)
        total_conversations = recent_orders.count() * 2  # Approximate: each order might have 2-3 chat interactions
        orders_via_chat = recent_orders.filter(
            Q(customer_notes__icontains='chat') | Q(status='confirmed')
        ).count()
        
        # Get popular products
        popular_products_data = OrderItem.objects.filter(
            order__created_at__gte=start_date if time_range != 'all' else datetime.min
        ).values(
            'product__name', 
            'product__category__name'
        ).annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        popular_products = [
            {
                'name': item['product__name'],
                'category': item['product__category__name'] or 'Unknown',
                'count': item['count']
            }
            for item in popular_products_data
        ]
        
        # Calculate conversion rate
        successful_orders = orders_via_chat
        abandoned_carts = max(0, total_conversations - successful_orders)
        conversion_rate = round((successful_orders / total_conversations * 100), 2) if total_conversations > 0 else 0
        
        # Common queries (mock data - would come from ChatConversation model in production)
        common_queries = [
            {'query': 'Show me chocolate desserts', 'intent': 'list', 'count': 45},
            {'query': 'I want to order a cake', 'intent': 'order', 'count': 38},
            {'query': 'What desserts do you have?', 'intent': 'list', 'count': 32},
            {'query': 'Show me all products', 'intent': 'list', 'count': 28},
            {'query': 'I need a birthday cake', 'intent': 'order', 'count': 24},
            {'query': 'What are your prices?', 'intent': 'info', 'count': 19},
        ]
        
        # Recent conversations (mock data - would come from ChatConversation model)
        recent_conversations = [
            {
                'session_id': f'session_{i}',
                'message': f'Sample conversation {i}',
                'response': 'AI response',
                'action': 'add_to_cart' if i % 3 == 0 else 'list',
                'products': ['All-Chocolate Dreamcake'] if i % 3 == 0 else [],
                'timestamp': (now - timedelta(hours=i)).isoformat()
            }
            for i in range(1, 11)
        ]
        
        # Get unique users (based on orders for now)
        unique_users = recent_orders.values('customer_email').distinct().count()
        
        analytics_data = {
            'total_conversations': total_conversations,
            'orders_via_chat': orders_via_chat,
            'unique_users': max(unique_users, total_conversations // 3),  # Estimate
            'avg_response_time': 234,  # Mock - would be calculated from actual response times
            'conversion_rate': conversion_rate,
            'successful_orders': successful_orders,
            'abandoned_carts': abandoned_carts,
            'popular_products': popular_products,
            'common_queries': common_queries,
            'recent_conversations': recent_conversations,
            'chroma_status': chroma_status,
            'vector_db_count': vector_db_count,
            'time_range': time_range,
            'generated_at': now.isoformat()
        }
        
        return JsonResponse(analytics_data)
        
    except Exception as e:
        logger.error(f"Error getting chat analytics: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'error': str(e),
            'total_conversations': 0,
            'orders_via_chat': 0,
            'unique_users': 0,
            'avg_response_time': 0,
            'conversion_rate': 0,
            'successful_orders': 0,
            'abandoned_carts': 0,
            'popular_products': [],
            'common_queries': [],
            'recent_conversations': [],
            'chroma_status': 'Unknown',
            'vector_db_count': 0
        }, status=200)  # Return 200 with empty data instead of error
