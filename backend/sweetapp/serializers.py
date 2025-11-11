from rest_framework import serializers
from .models import (
    Category, DessertItem, Order, OrderItem, ContactSubmission, 
    CustomerTestimonial, ChefRecommendation, AboutUsPage, AboutUsValue, 
    AboutUsTeamMember, OurStoryPage, StoryTimeline, StoryImpact,
    FAQPage, FAQCategory, FAQItem
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'product_count', 'order']


class DessertItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    
    class Meta:
        model = DessertItem
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'image',
            'category', 'category_name', 'category_slug',
            'rating', 'reviews_count', 'dietary_info', 'ingredients', 'allergens',
            'preparation_time', 'featured', 'seasonal', 'best_seller', 'available'
        ]


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'product_image', 'unit_price', 'quantity', 'customizations', 'total_price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer_name', 'customer_email', 'customer_phone',
            'delivery_address', 'subtotal', 'delivery_fee', 'tax', 'total',
            'order_type', 'payment_method', 'pickup_time', 'special_instructions',
            'stripe_payment_intent_id', 'payment_status', 'status', 'created_at', 'items'
        ]


class ContactSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = [
            'id', 'name', 'email', 'phone', 'subject', 'message',
            'order_type', 'preferred_contact', 'responded', 'created_at'
        ]
        read_only_fields = ['id', 'responded', 'created_at']


class CustomerTestimonialSerializer(serializers.ModelSerializer):
    dessert_name = serializers.CharField(source='dessert_item.name', read_only=True)
    
    class Meta:
        model = CustomerTestimonial
        fields = ['id', 'name', 'avatar', 'rating', 'text', 'dessert_name', 'created_at']


class ChefRecommendationSerializer(serializers.ModelSerializer):
    dessert_item_name = serializers.CharField(source='dessert_item.name', read_only=True)
    dessert_item_id = serializers.IntegerField(source='dessert_item.id', read_only=True)
    
    class Meta:
        model = ChefRecommendation
        fields = [
            'id', 'chef_name', 'chef_title', 'chef_image', 'recommendation_text',
            'dessert_item', 'dessert_item_id', 'dessert_item_name', 
            'is_featured', 'active', 'created_at'
        ]


# CMS Serializers
class AboutUsValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutUsValue
        fields = ['id', 'title', 'description', 'icon', 'color_gradient', 'order']


class AboutUsTeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutUsTeamMember
        fields = ['id', 'name', 'role', 'description', 'image_emoji', 'order']


class AboutUsPageSerializer(serializers.ModelSerializer):
    values = AboutUsValueSerializer(many=True, read_only=True)
    team_members = AboutUsTeamMemberSerializer(many=True, read_only=True)
    
    class Meta:
        model = AboutUsPage
        fields = [
            'id', 'hero_title', 'hero_subtitle', 'hero_badge_text',
            'mission_title', 'mission_text', 'values_title', 'values_subtitle',
            'store_title', 'store_description', 'store_address', 'store_hours',
            'cta_title', 'cta_subtitle', 'is_active', 'created_at', 'updated_at',
            'values', 'team_members'
        ]


class StoryTimelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoryTimeline
        fields = ['id', 'year', 'title', 'description', 'icon', 'color_gradient', 'order']


class StoryImpactSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoryImpact
        fields = ['id', 'number', 'label', 'icon', 'order']


class OurStoryPageSerializer(serializers.ModelSerializer):
    timeline_events = StoryTimelineSerializer(many=True, read_only=True)
    impact_metrics = StoryImpactSerializer(many=True, read_only=True)
    
    class Meta:
        model = OurStoryPage
        fields = [
            'id', 'hero_title', 'hero_subtitle', 'hero_badge_text',
            'founder_name', 'founder_title', 'founder_image', 'founder_quote', 'founder_description',
            'journey_title', 'journey_subtitle', 'impact_title', 'impact_subtitle',
            'vision_title', 'vision_text', 'cta_title', 'cta_subtitle',
            'is_active', 'created_at', 'updated_at',
            'timeline_events', 'impact_metrics'
        ]


# FAQ Serializers
class FAQItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQItem
        fields = ['id', 'category', 'question', 'answer', 'order', 'is_active', 'created_at', 'updated_at']


class FAQCategorySerializer(serializers.ModelSerializer):
    faq_items = FAQItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = FAQCategory
        fields = [
            'id', 'name', 'description', 'icon', 'color', 'order', 'is_active',
            'faq_items'
        ]


class FAQPageSerializer(serializers.ModelSerializer):
    categories = FAQCategorySerializer(many=True, read_only=True)
    
    class Meta:
        model = FAQPage
        fields = [
            'id', 'title', 'subtitle', 'hero_background_color',
            'created_at', 'updated_at', 'categories'
        ]