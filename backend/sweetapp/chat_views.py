"""
Chat Assistant Views with multi-provider AI integration
Handles streaming chat responses, AI-powered intent detection, and cart management
"""
# cSpell:ignore OPENROUTER mistralai stepfun choco Dreamcake Referer cerebras csk

import json
import re
import logging
import requests
from django.http import StreamingHttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Q
import os
from dotenv import load_dotenv
from .vector_db import get_vector_db
from .models import DessertItem, FAQItem, FAQCategory

logger = logging.getLogger(__name__)

# OpenRouter API Configuration
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = "stepfun/step-3.5-flash:free"

# Model that supports structured outputs (GPT-4o, Gemini, etc.)
# Using Step-3.5 Flash (Free) for intent detection
OPENROUTER_INTENT_MODEL = "stepfun/step-3.5-flash:free"

# Cerebras API Configuration
CEREBRAS_API_URL = "https://api.cerebras.ai/v1/chat/completions"
CEREBRAS_MODEL = "gpt-oss-120b"


def _read_env_key(env_var_name: str) -> str:
    """
    Read key from backend/.env first, then process environment variables.
    """
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    key_value = ""

    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith(f"{env_var_name}="):
                        key_value = line.split("=", 1)[1].strip()
                        if key_value.startswith('"') and key_value.endswith('"'):
                            key_value = key_value[1:-1]
                        elif key_value.startswith("'") and key_value.endswith("'"):
                            key_value = key_value[1:-1]
                        break
        except Exception as e:
            logger.error(f"Error reading {env_var_name} from .env file: {e}")

    if not key_value:
        key_value = os.environ.get(env_var_name, "")

    return key_value


def detect_api_provider(frontend_key: str = "", requested_provider: str = "") -> str:
    """
    Detect provider from request and/or API key prefix.
    """
    provider = (requested_provider or "").strip().lower()
    if provider in {"openrouter", "cerebras"}:
        return provider

    key = (frontend_key or "").strip()
    if key.startswith("csk-"):
        return "cerebras"
    return "openrouter"


def get_provider_api_key(provider: str, frontend_key: str = None) -> str:
    """
    Resolve key for provider; frontend key has highest priority.
    """
    if frontend_key and frontend_key.strip():
        logger.info(
            "Using frontend-provided %s key: %s...%s",
            provider,
            frontend_key[:15],
            frontend_key[-5:],
        )
        return frontend_key.strip()

    env_var = "CEREBRAS_API_KEY" if provider == "cerebras" else "OPENROUTER_API_KEY"
    api_key = _read_env_key(env_var)
    if api_key:
        logger.info(f"Using {provider} API key from {env_var}")
    return api_key


def get_openrouter_api_key(frontend_key: str = None):
    """
    Get API key - prioritize frontend-provided key over environment variable.

    Args:
        frontend_key: API key provided from frontend (optional)

    Returns:
        API key string
    """
    return get_provider_api_key("openrouter", frontend_key)


# Global variable to store frontend API key for current request
_current_request_api_key = None


def set_request_api_key(api_key: str):
    """Set API key for current request context"""
    global _current_request_api_key
    _current_request_api_key = api_key


def get_current_api_key():
    """Get API key for current request (frontend key or env fallback)"""
    global _current_request_api_key
    return get_openrouter_api_key(_current_request_api_key)


def ai_analyze_intent(
    message: str,
    available_products: list = None,
    conversation_history: list = None,
    api_provider: str = "openrouter",
    api_key: str = None,
) -> dict:
    """
    Use AI with Structured Outputs to intelligently analyze the user's query intent.
    Uses JSON Schema enforcement for guaranteed valid responses.
    Short/simple messages skip the AI call and use the fast keyword fallback.

    Args:
        message: User's message
        available_products: List of available product names for context
        conversation_history: Recent chat history for context
        api_key: OpenRouter API key to use

    Returns:
        Dictionary with intent analysis results (guaranteed schema)
    """
    # Fast-path: skip AI call for trivial greetings/thanks
    # Do NOT fast-path messages that might contain order/product/list intents
    message_stripped = message.strip().lower()
    action_keywords = [
        "order",
        "buy",
        "add",
        "cart",
        "want",
        "get",
        "show",
        "list",
        "menu",
        "checkout",
        "pay",
        "deliver",
        "price",
        "cost",
    ]
    has_action_intent = any(kw in message_stripped for kw in action_keywords)

    simple_patterns = [
        "hi",
        "hello",
        "hey",
        "thanks",
        "thank you",
        "ok",
        "okay",
        "bye",
        "goodbye",
        "who are you",
        "what can you do",
    ]
    is_simple = len(message_stripped) < 15 or any(
        message_stripped == p or message_stripped == p + "!" for p in simple_patterns
    )

    if is_simple and not has_action_intent:
        logger.info("Fast-path intent detection (skipping AI call)")
        return _fallback_intent_detection(message)

    # Structured intent output is currently configured for OpenRouter.
    if api_provider != "openrouter":
        return _fallback_intent_detection(message)

    # Use passed api_key or fall back to getting current key
    if not api_key:
        api_key = get_current_api_key()
    if not api_key:
        logger.warning(
            "OpenRouter API key not configured, falling back to keyword detection"
        )
        return {"intent": "general_chat", "confidence": "low", "fallback": True}

    # Build product list for context
    product_names = []
    if available_products:
        product_names = [p.get("name", "") for p in available_products[:20]]

    # Get some products from database for context
    try:
        db_products = DessertItem.objects.filter(available=True).values_list(
            "name", flat=True
        )[:30]
        product_names.extend(list(db_products))
        product_names = list(set(product_names))  # Remove duplicates
    except Exception as e:
        logger.error(f"Error fetching products for intent analysis: {e}")

    product_list_str = (
        ", ".join(product_names[:25])
        if product_names
        else "various desserts, cakes, brownies, cookies"
    )

    history_lines = []
    if conversation_history:
        for msg in conversation_history[-6:]:
            role = msg.get("role", "user")
            content = (msg.get("content") or "").strip()
            if content:
                history_lines.append(f"{role}: {content}")
    history_text = (
        "\n".join(history_lines)
        if history_lines
        else "No previous conversation context available."
    )

    intent_prompt = f"""Analyze this user message for a dessert shop chatbot and classify the intent.

**Available Products:** {product_list_str}
**Recent Conversation Context:**
{history_text}

**User Message:** "{message}"

**Intent Categories:**
- order: User wants to ORDER/BUY a specific product (e.g., "I want chocolate cake", "add brownie to cart")
- list_products: User wants to SEE/LIST products (e.g., "show me cakes", "what do you have")
- checkout: User wants to PROCEED TO PAYMENT (e.g., "checkout", "proceed to payment")
- faq: Questions about POLICIES, DELIVERY, PAYMENT, HOURS (e.g., "delivery fee?", "do you accept cards")
- product_info: Wants DETAILS about a product (e.g., "what's in this cake", "is it vegan")
- greeting: Starting conversation (e.g., "hi", "hello")
- general_chat: Unclear intent or off-topic

Analyze the message and provide structured classification."""

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "Sweet Dessert Intent Analyzer",
    }

    # Define JSON Schema for structured output
    intent_schema = {
        "name": "intent_analysis",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "intent": {
                    "type": "string",
                    "enum": [
                        "order",
                        "list_products",
                        "checkout",
                        "faq",
                        "product_info",
                        "greeting",
                        "general_chat",
                    ],
                    "description": "The classified intent category",
                },
                "confidence": {
                    "type": "string",
                    "enum": ["high", "medium", "low"],
                    "description": "Confidence level of the classification",
                },
                "product_mentioned": {
                    "type": ["string", "null"],
                    "description": "Name of the product mentioned by user, or null if none",
                },
                "quantity": {
                    "type": "integer",
                    "description": "Quantity requested by user, default 1",
                },
                "category_filter": {
                    "type": ["string", "null"],
                    "description": "Product category user wants to filter by, or null",
                },
                "reason": {
                    "type": "string",
                    "description": "Brief explanation for the classification",
                },
            },
            "required": [
                "intent",
                "confidence",
                "product_mentioned",
                "quantity",
                "category_filter",
                "reason",
            ],
            "additionalProperties": False,
        },
    }

    payload = {
        "model": OPENROUTER_INTENT_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are a precise intent classifier for a dessert shop. Analyze user messages and classify their intent accurately.",
            },
            {"role": "user", "content": intent_prompt},
        ],
        "response_format": {"type": "json_schema", "json_schema": intent_schema},
        # Ensure we get a provider that supports structured outputs
        "provider": {"require_parameters": True},
        "temperature": 0.1,  # Low temperature for consistent classification
        "max_tokens": 150,
    }

    try:
        response = requests.post(
            OPENROUTER_API_URL, headers=headers, json=payload, timeout=8
        )
        response.raise_for_status()

        result = response.json()
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "{}")

        # Parse the guaranteed valid JSON response
        intent_data = json.loads(content)

        logger.info(
            f"AI Intent Analysis (Structured): {intent_data.get('intent')} (confidence: {intent_data.get('confidence')}) - {intent_data.get('reason', 'No reason')}"
        )

        return intent_data

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse structured intent response: {e}")
        return _fallback_intent_detection(message)
    except requests.exceptions.Timeout:
        logger.error("Intent analysis request timed out")
        return _fallback_intent_detection(message)
    except requests.exceptions.RequestException as e:
        logger.error(f"Intent analysis request failed: {e}")
        return _fallback_intent_detection(message)
    except Exception as e:
        logger.error(f"Error in AI intent analysis: {e}")
        return _fallback_intent_detection(message)


def _fallback_intent_detection(message: str) -> dict:
    """
    Fallback keyword-based intent detection when AI is unavailable.
    Also attempts to extract a product name from the database.

    Args:
        message: User's message

    Returns:
        Dictionary with basic intent detection
    """
    message_lower = message.lower().strip()

    # Simple keyword-based fallback
    order_keywords = [
        "order",
        "buy",
        "want",
        "add",
        "get",
        "take",
        "give me",
        "i'll have",
    ]
    list_keywords = ["show", "list", "what do you have", "menu", "available", "all"]
    checkout_keywords = ["checkout", "payment", "pay now", "proceed", "done ordering"]
    faq_keywords = [
        "delivery",
        "hours",
        "open",
        "payment method",
        "accept",
        "policy",
        "refund",
        "cancel",
    ]
    greeting_keywords = [
        "hi",
        "hello",
        "hey",
        "good morning",
        "good afternoon",
        "good evening",
    ]

    intent = "general_chat"

    if any(kw in message_lower for kw in greeting_keywords) and len(message_lower) < 20:
        intent = "greeting"
    elif any(kw in message_lower for kw in checkout_keywords):
        intent = "checkout"
    elif any(kw in message_lower for kw in order_keywords):
        intent = "order"
    elif any(kw in message_lower for kw in list_keywords):
        intent = "list_products"
    elif any(kw in message_lower for kw in faq_keywords):
        intent = "faq"

    # Extract product name from database when intent is order
    product_mentioned = None
    if intent == "order":
        try:
            # Remove common action words to isolate the product reference
            # Use word-boundary-aware removal to avoid corrupting product names
            noise_words = {
                "add",
                "order",
                "buy",
                "want",
                "get",
                "give",
                "me",
                "have",
                "to",
                "cart",
                "my",
                "please",
                "i",
                "a",
                "the",
                "some",
                "can",
                "you",
                "put",
                "in",
            }
            words = message_lower.replace("-", " ").split()
            stripped_words = [w for w in words if w not in noise_words and len(w) > 1]
            normalized = " ".join(stripped_words)

            best_score = 0
            best_product = None

            for product in DessertItem.objects.filter(available=True):
                pname = product.name.lower()
                pname_norm = pname.replace("-", " ")

                # Exact full-name match in original message
                if pname_norm in message_lower or pname in message_lower:
                    best_product = product.name
                    break

                # Score: how many user words appear in the product name
                user_words = [w for w in normalized.split() if len(w) > 2]
                if not user_words:
                    continue
                fwd = sum(1 for w in user_words if w in pname_norm)
                fwd_score = fwd / len(user_words)

                # Reverse: product key words in user message
                prod_words = [w for w in pname_norm.split() if len(w) > 3]
                rev = sum(1 for w in prod_words if w in normalized)
                rev_score = rev / len(prod_words) if prod_words else 0

                combined = max(fwd_score, rev_score)
                if combined > best_score and combined >= 0.4:
                    best_score = combined
                    best_product = product.name

            product_mentioned = best_product
        except Exception as e:
            logger.error(f"Fallback product extraction error: {e}")

    logger.info(f"Fallback Intent Detection: {intent}, product: {product_mentioned}")

    return {
        "intent": intent,
        "confidence": "medium" if product_mentioned else "low",
        "product_mentioned": product_mentioned,
        "quantity": 1,
        "category_filter": None,
        "reason": "Fallback keyword-based detection with DB product matching",
        "fallback": True,
    }


def _normalize_conversation_history(raw_history: list, limit: int = 12) -> list:
    """
    Normalize incoming chat history from frontend payload.

    Args:
        raw_history: Raw history array from frontend
        limit: Number of turns to keep

    Returns:
        List of {role, content} messages for LLM context
    """
    if not isinstance(raw_history, list):
        return []

    normalized = []
    for entry in raw_history[-limit:]:
        role = str(entry.get("role", "")).strip().lower()
        content = str(entry.get("content", "")).strip()
        if role not in {"user", "assistant"} or not content:
            continue
        normalized.append({"role": role, "content": content[:1000]})
    return normalized


def _is_reference_message(message: str) -> bool:
    """Detect context-dependent references (e.g., 'book that', 'add these')."""
    text = message.lower().strip()
    reference_patterns = [
        "that",
        "this",
        "these",
        "those",
        "it",
        "them",
        "book that",
        "add that",
        "add this",
        "add these",
        "add it",
        "yes add",
        "yes",
        "do it",
    ]
    return any(pattern in text for pattern in reference_patterns)


def _looks_like_order_request(message: str) -> bool:
    """Detect explicit ordering/adding intent from user text."""
    text = message.lower().strip()
    order_phrases = [
        "order",
        "book",
        "add to cart",
        "add this",
        "add that",
        "add these",
        "add it",
        "buy",
        "i want",
        "i'll take",
        "i will take",
        "yes add",
        "yes, add",
        "yes please add",
        "place order",
    ]
    return any(phrase in text for phrase in order_phrases)


def _get_chat_context(request) -> dict:
    """Get or initialize chat context from session."""
    chat_context = request.session.get("chat_context")
    if not isinstance(chat_context, dict):
        chat_context = {}
    chat_context.setdefault("last_product", None)
    chat_context.setdefault("last_products", [])
    chat_context.setdefault("last_intent", None)
    return chat_context


def _save_chat_context(request, chat_context: dict):
    """Persist chat context into session."""
    request.session["chat_context"] = chat_context
    request.session.modified = True


def find_product_by_name(product_name: str) -> dict:
    """
    Find a product in the database by name (fuzzy matching)

    Args:
        product_name: Product name to search for

    Returns:
        Product dict or None
    """
    if not product_name:
        return None

    product_name_lower = product_name.lower().strip()

    try:
        # Try exact match first
        product = DessertItem.objects.filter(
            available=True, name__iexact=product_name
        ).first()

        if product:
            return {
                "id": product.id,
                "name": product.name,
                "price": str(product.price),
                "category": product.category.name,
                "image": product.image,
                "description": product.description[:150],
            }

        # Try contains match
        product = DessertItem.objects.filter(
            available=True, name__icontains=product_name
        ).first()

        if product:
            return {
                "id": product.id,
                "name": product.name,
                "price": str(product.price),
                "category": product.category.name,
                "image": product.image,
                "description": product.description[:150],
            }

        # Try matching individual words
        words = [w for w in product_name_lower.split() if len(w) > 2]
        for word in words:
            product = DessertItem.objects.filter(
                available=True, name__icontains=word
            ).first()
            if product:
                return {
                    "id": product.id,
                    "name": product.name,
                    "price": str(product.price),
                    "category": product.category.name,
                    "image": product.image,
                    "description": product.description[:150],
                }

        return None

    except Exception as e:
        logger.error(f"Error finding product: {e}")
        return None


def get_products_by_category(category_filter: str = None, limit: int = 10) -> list:
    """
    Get products, optionally filtered by category

    Args:
        category_filter: Category name to filter by
        limit: Maximum number of products to return

    Returns:
        List of product dicts
    """
    try:
        queryset = DessertItem.objects.filter(available=True)

        if category_filter:
            category_lower = category_filter.lower()
            queryset = queryset.filter(
                Q(category__name__icontains=category_lower)
                | Q(name__icontains=category_lower)
            )

        products = []
        for product in queryset[:limit]:
            products.append(
                {
                    "id": product.id,
                    "name": product.name,
                    "price": str(product.price),
                    "category": product.category.name,
                    "image": product.image,
                    "description": product.description[:100] + "..."
                    if len(product.description) > 100
                    else product.description,
                }
            )

        return products

    except Exception as e:
        logger.error(f"Error getting products: {e}")
        return []


def get_relevant_faqs(message: str, limit: int = 3) -> list:
    """
    Get relevant FAQ items based on the user's message

    Args:
        message: User's message
        limit: Maximum FAQs to return

    Returns:
        List of FAQ dicts
    """
    message_lower = message.lower()

    try:
        faq_items = FAQItem.objects.filter(
            is_active=True, category__is_active=True
        ).select_related("category")

        scored_faqs = []
        message_words = set(message_lower.split())

        for faq in faq_items:
            question_lower = faq.question.lower()
            answer_lower = faq.answer.lower()
            score = 0

            # Word matching
            question_words = set(question_lower.split())
            common_words = message_words.intersection(question_words)
            score += len(common_words) * 2

            # Key phrase matching
            key_phrases = [
                "delivery",
                "payment",
                "order",
                "cancel",
                "refund",
                "hours",
                "pickup",
                "custom",
                "allergy",
                "vegan",
            ]
            for phrase in key_phrases:
                if phrase in message_lower and (
                    phrase in question_lower or phrase in answer_lower
                ):
                    score += 3

            if score > 0:
                scored_faqs.append(
                    {
                        "question": faq.question,
                        "answer": faq.answer,
                        "category": faq.category.name,
                        "score": score,
                    }
                )

        scored_faqs.sort(key=lambda x: x["score"], reverse=True)
        return scored_faqs[:limit]

    except Exception as e:
        logger.error(f"Error getting FAQs: {e}")
        return []


def detect_faq_intent(message: str) -> dict:
    """
    Detect if user is asking a general FAQ/help question and find matching answers

    Args:
        message: User's message

    Returns:
        Dictionary with FAQ detection results
    """
    message_lower = message.lower().strip()

    # FAQ trigger keywords - questions about the business, policies, etc.
    faq_keywords = [
        # Ordering & Delivery
        "how to order",
        "how do i order",
        "delivery",
        "deliver",
        "shipping",
        "delivery time",
        "how long",
        "delivery fee",
        "delivery charge",
        "minimum order",
        "free delivery",
        "delivery area",
        "where do you deliver",
        # Payment
        "payment",
        "pay",
        "payment method",
        "accept",
        "card",
        "cash",
        "stripe",
        "online payment",
        "pay at store",
        "pay on delivery",
        # Pickup/Takeaway
        "pickup",
        "pick up",
        "takeaway",
        "take away",
        "collect",
        "store pickup",
        "pickup time",
        "when can i pick",
        # Store Info
        "location",
        "address",
        "where are you",
        "store hours",
        "opening hours",
        "open",
        "close",
        "timing",
        "working hours",
        "contact",
        "phone",
        "email",
        # Products/Menu
        "allergen",
        "allergy",
        "allergies",
        "ingredients",
        "vegan",
        "vegetarian",
        "gluten",
        "gluten-free",
        "dairy",
        "dairy-free",
        "nut",
        "nut-free",
        "dietary",
        "customization",
        "customize",
        "custom cake",
        "custom order",
        # Policies
        "refund",
        "return",
        "cancel",
        "cancellation",
        "exchange",
        "policy",
        "terms",
        "conditions",
        # General Help
        "help",
        "faq",
        "question",
        "how does",
        "what is",
        "can i",
        "do you",
        "is there",
        "are there",
        "about",
        "tell me about",
    ]

    # Check if message contains FAQ-related keywords
    has_faq_intent = any(keyword in message_lower for keyword in faq_keywords)

    if not has_faq_intent:
        return {"has_intent": False, "faqs": [], "action": "none"}

    # Search for matching FAQs in database
    matching_faqs = []

    try:
        # Get all active FAQ items
        faq_items = FAQItem.objects.filter(
            is_active=True, category__is_active=True
        ).select_related("category")

        # Score each FAQ based on keyword matches
        scored_faqs = []
        message_words = set(message_lower.split())

        for faq in faq_items:
            question_lower = faq.question.lower()
            answer_lower = faq.answer.lower()

            # Calculate relevance score
            score = 0

            # Check for word matches in question
            question_words = set(question_lower.split())
            common_words = message_words.intersection(question_words)
            score += len(common_words) * 2  # Question matches worth more

            # Check for phrase matches
            for keyword in faq_keywords:
                if keyword in message_lower and keyword in question_lower:
                    score += 3
                if keyword in message_lower and keyword in answer_lower:
                    score += 1

            # Check for direct substring match
            if any(word in question_lower for word in message_words if len(word) > 3):
                score += 2

            if score > 0:
                scored_faqs.append(
                    {
                        "question": faq.question,
                        "answer": faq.answer,
                        "category": faq.category.name,
                        "category_icon": faq.category.icon,
                        "score": score,
                    }
                )

        # Sort by score and take top 3
        scored_faqs.sort(key=lambda x: x["score"], reverse=True)
        matching_faqs = scored_faqs[:3]

    except Exception as e:
        logger.error(f"Error searching FAQs: {e}")

    return {
        "has_intent": has_faq_intent,
        "faqs": matching_faqs,
        "action": "faq" if matching_faqs else "none",
    }


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
        "order",
        "buy",
        "purchase",
        "add to cart",
        "want",
        "get",
        "take",
        "need",
        "i'll have",
        "give me",
        "add",
        "checkout",
    ]

    list_keywords = ["list", "show", "all", "available", "what do you have"]
    checkout_keywords = [
        "yes proceed",
        "yes, proceed",
        "yes please",
        "yes to payment",
        "yes to checkout",
        "proceed to checkout",
        "proceed to payment",
        "take me to checkout",
        "take me to payment",
        "take me to the payment",
        "go to checkout",
        "go to payment",
        "checkout now",
        "pay now",
        "payment now",
        "complete order",
        "finalize order",
        "yes take me",
        "payment page",
        "checkout page",
        "yes, payment",
        "yes payment",
        "yes, checkout",
        "yes checkout",
    ]

    message_lower = message.lower()

    # Check for checkout intent FIRST (highest priority)
    has_checkout_intent = any(keyword in message_lower for keyword in checkout_keywords)
    if has_checkout_intent:
        return {"has_intent": False, "products": [], "action": "checkout"}

    # Check for order intent BEFORE list intent (to avoid false positives)
    has_order_intent = any(keyword in message_lower for keyword in order_keywords)

    # Check for list intent - but make sure it's not an order request
    # List requests should have phrases like "show all", "list all", "what do you have"
    list_phrases = [
        "list all",
        "show all",
        "list me",
        "show me all",
        "what do you have",
        "what are your",
    ]
    has_list_intent = any(phrase in message_lower for phrase in list_phrases)

    # If it's a list intent without order intent, return list action
    if has_list_intent and not has_order_intent:
        return {
            "has_intent": False,
            "products": [],
            "action": "list",
            "list_products": context_products,
        }

    # Now check for order intent
    if not has_order_intent:
        return {"has_intent": False, "products": [], "action": "none"}

    # Check if this is a generic order request without specific product
    generic_requests = [
        "order a dessert",
        "order dessert",
        "order something",
        "order anything",
        "buy a dessert",
        "buy dessert",
        "get a dessert",
        "get dessert",
        "want a dessert",
        "want dessert",
        "want something sweet",
    ]

    is_generic = any(generic in message_lower for generic in generic_requests)

    # If generic request, don't try to add to cart - let AI ask for specifics
    if is_generic:
        return {"has_intent": False, "products": [], "action": "none"}

    # Extract products from database instead of vector DB
    detected_products = []

    # Search database for matching products
    try:
        # Extract potential product names from message
        products_queryset = DessertItem.objects.filter(available=True)

        # Normalize message for better matching (remove hyphens, extra spaces)
        normalized_message = message_lower.replace("-", " ").replace("  ", " ")

        # Try to find products mentioned in the message
        for product in products_queryset:
            product_name_lower = product.name.lower()
            normalized_product_name = product_name_lower.replace("-", " ").replace(
                "  ", " "
            )

            # Check if product name is in message (exact match)
            if (
                normalized_product_name in normalized_message
                or product_name_lower in message_lower
            ):
                detected_products.append(
                    {
                        "name": product.name,
                        "price": str(product.price),
                        "category": product.category.name,
                        "id": product.id,
                        "image": product.image,  # Add product image
                    }
                )
                break  # Found exact match

            # Check for partial matches (key words from product name)
            # Extract significant words (longer than 3 chars, not common words)
            common_words = ["cake", "the", "and", "with"]
            product_words = [
                word
                for word in normalized_product_name.split()
                if len(word) > 3 and word not in common_words
            ]

            # If we have at least 2 significant words, check if they're all in the message
            if len(product_words) >= 2 and all(
                word in normalized_message for word in product_words
            ):
                detected_products.append(
                    {
                        "name": product.name,
                        "price": str(product.price),
                        "category": product.category.name,
                        "id": product.id,
                        "image": product.image,  # Add product image
                    }
                )
                break  # Found partial match

        # Limit to top 1 product to avoid over-adding
        detected_products = detected_products[:1]

    except Exception as e:
        logger.error(f"Error detecting products from database: {e}")

    return {
        "has_intent": True,
        "products": detected_products,
        "confidence": "high" if detected_products else "low",
        "action": "add_to_cart",
    }


def build_system_prompt(
    context_chunks: list,
    user_authenticated: bool = False,
    username: str = None,
    faq_context: list = None,
) -> str:
    """
    Build system prompt with context from ChromaDB and FAQs

    Args:
        context_chunks: List of relevant product chunks from vector search
        user_authenticated: Whether user is logged in
        username: Username if authenticated
        faq_context: List of relevant FAQ items for general queries

    Returns:
        Formatted system prompt string
    """
    # Build context from ChromaDB results
    context_items = []

    for chunk in context_chunks:
        metadata = chunk.get("metadata", {})
        product_name = metadata.get("product_name", "Product")
        price = metadata.get("price", "N/A")
        category = metadata.get("category", "Dessert")

        # Get a snippet of the description (first 300 chars)
        description = chunk.get("text", "")[:300]

        context_items.append(
            f"**{product_name}** (Category: {category}, Price: Rs. {price})\n{description}..."
        )

    context_text = (
        "\n\n".join(context_items) if context_items else "No specific products found."
    )

    # Build FAQ context if available
    faq_text = ""
    if faq_context:
        faq_items = []
        for faq in faq_context:
            faq_items.append(f"Q: {faq['question']}\nA: {faq['answer']}")
        faq_text = "\n\n**Relevant FAQ Information:**\n" + "\n\n".join(faq_items)

    auth_status = (
        f"User is logged in as **{username}**"
        if user_authenticated
        else "User is NOT logged in"
    )

    system_prompt = f"""You are a friendly and helpful AI assistant for Sweet Dessert, a premium dessert shop.

**Your Role:**
- Help customers discover and learn about our delicious desserts
- Provide information about products, ingredients, pricing, and ordering
- Answer general questions about our store, policies, delivery, and services
- Guide users through the ordering process
- Be warm, enthusiastic, and professional
- Use emojis sparingly but appropriately 🍰

**Current User Status:** {auth_status}

**Available Menu Items (based on current query):**

{context_text}
{faq_text}

**Guidelines:**
1. Use the product information above to answer questions accurately
2. Always mention prices in PKR (Pakistani Rupees) as "Rs. [amount]"
3. If asked about products not in the context, politely mention what we do have available
4. When user asks to "list" or "show all" products in a category, provide a formatted list
5. Encourage customers to explore our full menu and special offers
6. Be concise but informative - aim for 2-3 sentences unless more detail is requested
7. **For general questions (delivery, payment, policies, store info):** Use the FAQ information provided above to give accurate answers
8. If the user asks about something not in FAQs, provide helpful general information about Sweet Dessert

**General Store Information (use for FAQ-type questions):**
- **Delivery:** We deliver to most areas. Free delivery on orders above Rs. 2500. Standard delivery fee is Rs. 150-250 depending on location.
- **Delivery Time:** Usually 45-60 minutes for local areas, up to 90 minutes for distant areas.
- **Payment Methods:** We accept all major credit/debit cards via Stripe, and cash on delivery for takeaway orders.
- **Store Pickup:** Available! Order online and pick up from our store. Pay online or at store.
- **Store Hours:** Open daily 10 AM - 10 PM
- **Custom Orders:** We accept custom cake orders with 24-48 hours advance notice. Contact us for details.
- **Allergens:** All product pages list ingredients and allergens. We can accommodate most dietary requirements.
- **Cancellation:** Orders can be cancelled within 30 minutes of placing. Contact us immediately.
- **Refunds:** If unsatisfied, contact us within 24 hours for refund or replacement.

**Ordering Process:**
- **YOU HAVE THE ABILITY TO ADD ITEMS TO THE CART.** When a user asks to order a specific product, assume the system has already added it to the cart for you.
- If customer says they want to order but doesn't specify WHICH product (e.g., "I want to order a dessert"), ask them which specific dessert they'd like from the menu
- If customer wants to order a SPECIFIC product:
  * **DO NOT say you cannot process orders.**
  * ALWAYS give a HAPPY, ENTHUSIASTIC confirmation message assuming the action succeeded.
  * Example: "Great choice! 🎉 I've added [Exact Product Name] to your cart!"
  * Then IMMEDIATELY ask: "Would you like to order more items, or shall we proceed to checkout?"
  * NEVER skip asking this question - it's mandatory after every order
- Guest users can add items to cart; login may be required later at checkout
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
- General questions about delivery/payment/policies → Answer using FAQ information above

**Sweet Dessert Information:**
- We offer cakes, brownies, cookies, cupcakes, donuts, ice cream, and more
- Both delivery and takeaway options available
- Customization options available for many items
- Secure online ordering through our website
- Payment via Stripe (all major cards accepted)

Respond naturally and helpfully to the customer's query!"""

    return system_prompt


def generate_chat_stream(
    message: str,
    context_chunks: list,
    user_authenticated: bool = False,
    username: str = None,
    faq_context: list = None,
    conversation_history: list = None,
    api_provider: str = "openrouter",
    api_key: str = None,
):
    """
    Generate streaming response from selected AI provider.

    Args:
        message: User's message
        context_chunks: Relevant context from ChromaDB
        user_authenticated: Whether user is logged in
        username: Username if authenticated
        faq_context: Relevant FAQ items for general queries
        conversation_history: Recent conversation turns
        api_provider: Provider name (openrouter/cerebras)
        api_key: Provider API key to use

    Yields:
        Server-Sent Events formatted chunks
    """
    # Build system prompt with context
    system_prompt = build_system_prompt(
        context_chunks, user_authenticated, username, faq_context
    )

    # Use passed api_key or fall back to provider-specific key
    if not api_key:
        api_key = get_provider_api_key(api_provider, _current_request_api_key)

    if api_key and len(api_key) > 20:
        logger.info(f"Streaming with API key: {api_key[:15]}...{api_key[-5:]}")
    else:
        logger.error(
            f"Invalid or missing API key! Length: {len(api_key) if api_key else 0}"
        )
        yield f"data: {json.dumps({'content': 'API key not configured. Please check your settings.'})}\n\n"
        yield "data: [DONE]\n\n"
        return

    # Prepare API request headers
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    if api_provider == "openrouter":
        headers["HTTP-Referer"] = "http://localhost:8000"
        headers["X-Title"] = "Sweet Dessert Chat Assistant"

    # Prepare request payload
    llm_messages = [{"role": "system", "content": system_prompt}]
    if conversation_history:
        llm_messages.extend(conversation_history[-10:])
    llm_messages.append({"role": "user", "content": message})

    model_name = CEREBRAS_MODEL if api_provider == "cerebras" else OPENROUTER_MODEL
    api_url = CEREBRAS_API_URL if api_provider == "cerebras" else OPENROUTER_API_URL

    payload = {
        "model": model_name,
        "messages": llm_messages,
        "stream": True,
        "temperature": 0.7,
        "max_tokens": 400,
        "top_p": 0.9,
    }

    try:
        # Make streaming request to selected provider
        logger.info(
            f"Making streaming request to {api_provider} with model: {model_name}"
        )

        content_received = False
        buffer = ""

        with requests.post(
            api_url, headers=headers, json=payload, stream=True, timeout=30
        ) as response:
            response.raise_for_status()
            # Force UTF-8 encoding to handle emojis correctly
            response.encoding = "utf-8"
            logger.info(f"{api_provider} response status: {response.status_code}")

            # Use iter_content with SSE-style parsing
            for chunk in response.iter_content(chunk_size=512, decode_unicode=True):
                if not chunk:
                    continue

                buffer += chunk

                while True:
                    try:
                        # Find the next complete SSE line
                        line_end = buffer.find("\n")
                        if line_end == -1:
                            break

                        line = buffer[:line_end].strip()
                        buffer = buffer[line_end + 1 :]

                        # Skip empty lines and processing messages
                        if not line or line.startswith(":"):
                            continue

                        if line.startswith("data: "):
                            data = line[6:]
                            if data == "[DONE]":
                                if not content_received:
                                    logger.warning(
                                        "No content received from AI, sending fallback"
                                    )
                                    yield f"data: {json.dumps({'content': 'I can help you with our desserts! What would you like to know?'})}\n\n"
                                yield "data: [DONE]\n\n"
                                return

                            try:
                                data_obj = json.loads(data)
                                content = (
                                    data_obj.get("choices", [{}])[0]
                                    .get("delta", {})
                                    .get("content")
                                )
                                if content:
                                    content_received = True
                                    # logger.info(f"AI content chunk: {content[:50]}...")
                                    # Use ensure_ascii=False to send actual UTF-8 characters (emojis) instead of \u escape sequences
                                    yield f"data: {json.dumps({'content': content}, ensure_ascii=False)}\n\n"
                            except json.JSONDecodeError:
                                pass
                    except Exception as e:
                        logger.warning(f"Buffer parsing error: {e}")
                        break

        # Ensure we send DONE if not already sent
        if not content_received:
            logger.warning("Stream ended without content")
            yield f"data: {json.dumps({'content': 'I can help you with our desserts! What would you like to know?'})}\n\n"
        yield "data: [DONE]\n\n"

    except requests.exceptions.Timeout:
        logger.error("%s API request timed out", api_provider)
        yield f"data: {json.dumps({'content': 'The AI service timed out. Please try again in a moment.'})}\n\n"
        yield "data: [DONE]\n\n"
    except requests.exceptions.HTTPError as e:
        status_code = e.response.status_code if e.response is not None else None
        logger.error("%s HTTP error (%s): %s", api_provider, status_code, e)

        if status_code == 429:
            message_text = (
                f"{api_provider.title()} rate limit reached (429). Please wait a bit and try again, "
                "or switch to another API key/model."
            )
        elif status_code in (401, 403):
            message_text = f"{api_provider.title()} API key is invalid or unauthorized. Please update your API key in chat settings."
        else:
            message_text = (
                f"AI service returned an error ({status_code}). Please try again."
                if status_code
                else "AI service returned an error. Please try again."
            )

        yield f"data: {json.dumps({'content': message_text})}\n\n"
        yield "data: [DONE]\n\n"
    except requests.exceptions.RequestException as e:
        logger.error("%s API request failed: %s", api_provider, e)
        yield f"data: {json.dumps({'content': 'Failed to connect to AI service. Please check your network and try again.'})}\n\n"
        yield "data: [DONE]\n\n"
    except Exception as e:
        logger.error(f"Unexpected error in chat generation: {e}")
        yield f"data: {json.dumps({'content': 'An unexpected error occurred while generating the response. Please try again.'})}\n\n"
        yield "data: [DONE]\n\n"


@csrf_exempt
@require_http_methods(["POST"])
def chat_stream(request):
    """
    Main streaming chat endpoint with AI-powered intent detection

    Handles:
    - AI-powered intent analysis (first pass)
    - Vector search for context
    - Smart action handling based on AI intent
    - Cart management
    - Streaming AI responses
    - Authentication checking
    """
    try:
        # Parse request body
        data = json.loads(request.body)
        message = data.get("message", "").strip()
        conversation_history = _normalize_conversation_history(data.get("history", []))
        frontend_api_key = data.get("api_key", "").strip()  # Get API key from frontend
        frontend_provider = data.get("api_provider", "").strip().lower()
        api_provider = detect_api_provider(frontend_api_key, frontend_provider)

        # Set the API key for this request context
        set_request_api_key(frontend_api_key)
        logger.info(
            "Frontend API key provided: %s, provider: %s",
            bool(frontend_api_key),
            api_provider,
        )

        if not message:
            return JsonResponse({"error": "No message provided"}, status=400)

        logger.info(
            f"Chat request: '{message[:100]}...' (history turns: {len(conversation_history)})"
        )

        # Check authentication status
        is_authenticated = request.user.is_authenticated
        username = request.user.username if is_authenticated else None

        # Get vector database instance
        vector_db = get_vector_db()
        chat_context = _get_chat_context(request)
        if not conversation_history:
            chat_context = {
                "last_product": None,
                "last_products": [],
                "last_intent": None,
            }
            _save_chat_context(request, chat_context)

        # Search ChromaDB for relevant context
        search_results = vector_db.search(message, n_results=5)

        logger.info(f"Found {len(search_results)} relevant products from vector search")

        # Get the API key to use (frontend key or env fallback)
        current_api_key = get_provider_api_key(api_provider, frontend_api_key)

        # ============================================
        # AI-POWERED INTENT ANALYSIS (First Pass)
        # ============================================
        ai_intent = ai_analyze_intent(
            message,
            search_results,
            conversation_history=conversation_history,
            api_provider=api_provider,
            api_key=current_api_key,
        )
        intent_type = ai_intent.get("intent", "general_chat")
        intent_confidence = ai_intent.get("confidence", "low")
        product_mentioned = ai_intent.get("product_mentioned")
        category_filter = ai_intent.get("category_filter")
        quantity = ai_intent.get("quantity", 1)

        logger.info(
            f"AI Intent: {intent_type} (confidence: {intent_confidence}), product: {product_mentioned}, category: {category_filter}"
        )

        # Get relevant FAQs if it's an FAQ intent
        faq_context = []
        if intent_type == "faq":
            faq_context = get_relevant_faqs(message, limit=3)
            logger.info(f"Found {len(faq_context)} relevant FAQs")

        # Find the specific product if mentioned
        matched_product = None
        if product_mentioned and intent_type in ["order", "product_info"]:
            matched_product = find_product_by_name(product_mentioned)
            if matched_product:
                logger.info(f"Matched product: {matched_product['name']}")

        # Resolve context references like "book that" / "add these to cart"
        if (
            intent_type in ["order", "product_info"]
            and not matched_product
            and _is_reference_message(message)
        ):
            last_product = chat_context.get("last_product")
            if last_product:
                matched_product = last_product
                logger.info(
                    "Resolved contextual reference to last product: %s",
                    matched_product.get("name"),
                )

        # Get product list if listing intent
        product_list = []
        if intent_type == "list_products":
            product_list = get_products_by_category(category_filter, limit=10)
            logger.info(f"Found {len(product_list)} products for listing")

        # Force order action when message clearly asks to add/order and we resolved a product.
        if matched_product and intent_type != "order":
            is_order_like = _looks_like_order_request(message)
            is_context_confirm = _is_reference_message(message) and (
                chat_context.get("last_intent")
                in ["order", "list_products", "product_info"]
            )
            if is_order_like or is_context_confirm:
                logger.info(
                    "Promoting intent to order for product '%s' (original intent: %s)",
                    matched_product.get("name"),
                    intent_type,
                )
                intent_type = "order"

        # Keep lightweight chat context in session for pronoun follow-ups
        if matched_product:
            chat_context["last_product"] = matched_product
        if product_list:
            chat_context["last_products"] = product_list[:5]
            chat_context["last_product"] = product_list[0]
        chat_context["last_intent"] = intent_type
        _save_chat_context(request, chat_context)

        def event_stream():
            """Generate Server-Sent Events stream"""

            # Send intent analysis result to frontend (for transparency/debugging)
            intent_event = {
                "type": "intent_detected",
                "intent": intent_type,
                "confidence": intent_confidence,
                "product_mentioned": product_mentioned,
                "category_filter": category_filter,
            }
            yield f"data: {json.dumps(intent_event)}\n\n"

            # ============================================
            # HANDLE DIFFERENT INTENTS
            # ============================================

            # Handle GREETING intent
            if intent_type == "greeting":
                # Just let AI respond naturally
                pass

            # Handle LIST_PRODUCTS intent
            elif intent_type == "list_products":
                if product_list:
                    list_event = {
                        "type": "product_list",
                        "products": product_list,
                        "category": category_filter,
                    }
                    yield f"data: {json.dumps(list_event)}\n\n"

            # Handle FAQ intent
            elif intent_type == "faq":
                if faq_context:
                    faq_event = {"type": "faq_suggestions", "faqs": faq_context}
                    yield f"data: {json.dumps(faq_event)}\n\n"

            # Handle CHECKOUT intent
            elif intent_type == "checkout":
                if not is_authenticated:
                    auth_event = {
                        "type": "auth_required",
                        "message": "Please sign in to proceed to checkout",
                    }
                    yield f"data: {json.dumps(auth_event)}\n\n"
                else:
                    checkout_event = {"type": "redirect_checkout"}
                    yield f"data: {json.dumps(checkout_event)}\n\n"

            # Handle ORDER intent - add to cart
            elif intent_type == "order" and matched_product:
                # Allow guest + authenticated users to add to cart in session.
                if "cart" not in request.session:
                    request.session["cart"] = []

                # Check if product already in cart
                existing = next(
                    (
                        p
                        for p in request.session["cart"]
                        if p["name"] == matched_product["name"]
                    ),
                    None,
                )

                if not existing:
                    # Add quantity to product
                    product_to_add = matched_product.copy()
                    product_to_add["quantity"] = quantity

                    request.session["cart"].append(product_to_add)
                    request.session.modified = True

                    cart_event = {
                        "type": "cart_update",
                        "cart": request.session["cart"],
                        "added_products": [product_to_add],
                        "show_confirmation": True,
                    }
                    yield f"data: {json.dumps(cart_event)}\n\n"

                    logger.info(
                        "Added %s (qty: %s) to cart for %s user",
                        matched_product["name"],
                        quantity,
                        "authenticated" if is_authenticated else "guest",
                    )
                else:
                    # Product already in cart, update quantity
                    for item in request.session["cart"]:
                        if item["name"] == matched_product["name"]:
                            item["quantity"] = item.get("quantity", 1) + quantity
                            break
                    request.session.modified = True

                    updated_product = matched_product.copy()
                    updated_product["quantity"] = quantity
                    cart_event = {
                        "type": "cart_update",
                        "cart": request.session["cart"],
                        "added_products": [updated_product],
                        "quantity_updated": True,
                    }
                    yield f"data: {json.dumps(cart_event)}\n\n"
                    logger.info(
                        "Updated quantity for %s in cart for %s user",
                        matched_product["name"],
                        "authenticated" if is_authenticated else "guest",
                    )

            # Handle PRODUCT_INFO intent
            elif intent_type == "product_info" and matched_product:
                product_info_event = {
                    "type": "product_info",
                    "product": matched_product,
                }
                yield f"data: {json.dumps(product_info_event)}\n\n"

            # ============================================
            # GENERATE AI RESPONSE
            # ============================================
            try:
                # Get the API key to use (frontend key or env fallback)
                current_api_key = get_provider_api_key(api_provider, frontend_api_key)
                for chunk in generate_chat_stream(
                    message,
                    search_results,
                    is_authenticated,
                    username,
                    faq_context,
                    conversation_history=conversation_history,
                    api_provider=api_provider,
                    api_key=current_api_key,
                ):
                    yield chunk
            except Exception as e:
                logger.error(f"Error generating AI response: {e}", exc_info=True)
                error_event = {
                    "content": "I apologize, but I'm having trouble generating a response. Please try again."
                }
                yield f"data: {json.dumps(error_event)}\n\n"
                yield "data: [DONE]\n\n"

        # Create streaming response
        response = StreamingHttpResponse(
            event_stream(), content_type="text/event-stream"
        )

        # Set headers for SSE (avoid hop-by-hop headers in WSGI)
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        # Note: Connection header removed - not allowed in WSGI

        return response

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON in request body"}, status=400)
    except Exception as e:
        logger.error(f"Error in chat_stream: {e}", exc_info=True)
        return JsonResponse({"error": "Internal server error"}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def add_to_cart(request):
    """
    Add product to cart by name/query

    Query Params:
        product: Product name or search query
    """
    try:
        product_query = request.GET.get("product", "").strip()

        if not product_query:
            return JsonResponse({"error": "No product specified"}, status=400)

        # Get vector database
        vector_db = get_vector_db()

        # Search for product
        search_results = vector_db.search(product_query, n_results=1)

        if not search_results:
            return JsonResponse({"error": "Product not found"}, status=404)

        # Extract product info
        result = search_results[0]
        metadata = result.get("metadata", {})

        product = {
            "name": metadata.get("product_name", product_query),
            "price": metadata.get("price", "N/A"),
            "category": metadata.get("category", "Dessert"),
        }

        # Initialize cart if not exists
        if "cart" not in request.session:
            request.session["cart"] = []

        # Add product to cart
        request.session["cart"].append(product)
        request.session.modified = True

        logger.info(f"Added product to cart: {product['name']}")

        return JsonResponse(
            {"success": True, "cart": request.session["cart"], "added_product": product}
        )

    except Exception as e:
        logger.error(f"Error in add_to_cart: {e}", exc_info=True)
        return JsonResponse({"error": "Internal server error"}, status=500)


@require_http_methods(["GET"])
def get_cart(request):
    """Get current cart contents"""
    cart = request.session.get("cart", [])
    return JsonResponse({"cart": cart, "count": len(cart)})


@csrf_exempt
@require_http_methods(["POST"])
def clear_cart(request):
    """Clear all items from cart"""
    request.session["cart"] = []
    request.session.modified = True

    logger.info("Cart cleared")

    return JsonResponse({"success": True, "cart": []})


@require_http_methods(["GET"])
def chat_stats(request):
    """Get statistics about the chat system"""
    try:
        vector_db = get_vector_db()
        stats = vector_db.get_collection_stats()

        return JsonResponse(
            {
                "success": True,
                "stats": stats,
                "api_configured": bool(
                    get_provider_api_key("openrouter")
                    or get_provider_api_key("cerebras")
                ),
            }
        )
    except Exception as e:
        logger.error(f"Error getting chat stats: {e}")
        return JsonResponse({"success": False, "error": str(e)}, status=500)


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

        time_range = request.GET.get("range", "7days")

        # Calculate date filter
        now = datetime.now()
        if time_range == "7days":
            start_date = now - timedelta(days=7)
        elif time_range == "30days":
            start_date = now - timedelta(days=30)
        else:
            start_date = datetime.min

        # Mock data for now - will be replaced with actual database queries when chat history model is created
        # In production, you'd have a ChatConversation model to store these

        # Get vector DB status with error handling
        vector_db_count = 0
        chroma_status = "Unknown"
        try:
            vector_db = get_vector_db()
            chroma_collection = (
                vector_db.collection
            )  # Use the existing collection from vector_db instance
            vector_db_count = chroma_collection.count()
            chroma_status = "Active" if vector_db_count > 0 else "Empty"
            logger.info(
                f"ChromaDB status: {chroma_status}, Documents: {vector_db_count}"
            )
        except Exception as e:
            logger.error(f"Error accessing ChromaDB: {e}")
            chroma_status = "Error"
            vector_db_count = 0

        # Get popular products from recent orders
        from .models import Order, OrderItem

        # Orders in time range
        recent_orders = (
            Order.objects.filter(created_at__gte=start_date)
            if time_range != "all"
            else Order.objects.all()
        )

        # Count orders that likely came from chat (could be enhanced with a 'source' field)
        total_conversations = (
            recent_orders.count() * 2
        )  # Approximate: each order might have 2-3 chat interactions
        orders_via_chat = recent_orders.filter(
            Q(customer_notes__icontains="chat") | Q(status="confirmed")
        ).count()

        # Get popular products
        popular_products_data = (
            OrderItem.objects.filter(
                order__created_at__gte=start_date
                if time_range != "all"
                else datetime.min
            )
            .values("product__name", "product__category__name")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )

        popular_products = [
            {
                "name": item["product__name"],
                "category": item["product__category__name"] or "Unknown",
                "count": item["count"],
            }
            for item in popular_products_data
        ]

        # Calculate conversion rate
        successful_orders = orders_via_chat
        abandoned_carts = max(0, total_conversations - successful_orders)
        conversion_rate = (
            round((successful_orders / total_conversations * 100), 2)
            if total_conversations > 0
            else 0
        )

        # Common queries (mock data - would come from ChatConversation model in production)
        common_queries = [
            {"query": "Show me chocolate desserts", "intent": "list", "count": 45},
            {"query": "I want to order a cake", "intent": "order", "count": 38},
            {"query": "What desserts do you have?", "intent": "list", "count": 32},
            {"query": "Show me all products", "intent": "list", "count": 28},
            {"query": "I need a birthday cake", "intent": "order", "count": 24},
            {"query": "What are your prices?", "intent": "info", "count": 19},
        ]

        # Recent conversations (mock data - would come from ChatConversation model)
        recent_conversations = [
            {
                "session_id": f"session_{i}",
                "message": f"Sample conversation {i}",
                "response": "AI response",
                "action": "add_to_cart" if i % 3 == 0 else "list",
                "products": ["All-Chocolate Dreamcake"] if i % 3 == 0 else [],
                "timestamp": (now - timedelta(hours=i)).isoformat(),
            }
            for i in range(1, 11)
        ]

        # Get unique users (based on orders for now)
        unique_users = recent_orders.values("customer_email").distinct().count()

        analytics_data = {
            "total_conversations": total_conversations,
            "orders_via_chat": orders_via_chat,
            "unique_users": max(unique_users, total_conversations // 3),  # Estimate
            "avg_response_time": 234,  # Mock - would be calculated from actual response times
            "conversion_rate": conversion_rate,
            "successful_orders": successful_orders,
            "abandoned_carts": abandoned_carts,
            "popular_products": popular_products,
            "common_queries": common_queries,
            "recent_conversations": recent_conversations,
            "chroma_status": chroma_status,
            "vector_db_count": vector_db_count,
            "time_range": time_range,
            "generated_at": now.isoformat(),
        }

        return JsonResponse(analytics_data)

    except Exception as e:
        logger.error(f"Error getting chat analytics: {e}")
        import traceback

        traceback.print_exc()
        return JsonResponse(
            {
                "error": str(e),
                "total_conversations": 0,
                "orders_via_chat": 0,
                "unique_users": 0,
                "avg_response_time": 0,
                "conversion_rate": 0,
                "successful_orders": 0,
                "abandoned_carts": 0,
                "popular_products": [],
                "common_queries": [],
                "recent_conversations": [],
                "chroma_status": "Unknown",
                "vector_db_count": 0,
            },
            status=200,
        )  # Return 200 with empty data instead of error
