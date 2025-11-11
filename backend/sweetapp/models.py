from django.db import models
from django.contrib.auth.models import User
import uuid


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    image = models.CharField(max_length=500, blank=True)  # Path to category image
    product_count = models.IntegerField(default=0)  # Number of products in category
    order = models.IntegerField(default=0)  # For ordering categories
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name


class DessertItem(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='desserts')
    image = models.CharField(max_length=500)  # Path to product image (changed from URLField)
    
    # Ratings and reviews
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    reviews_count = models.PositiveIntegerField(default=0)
    
    # Dietary information
    dietary_info = models.JSONField(default=list, blank=True)  # ["vegetarian", "vegan", etc.]
    ingredients = models.JSONField(default=list, blank=True)
    allergens = models.JSONField(default=list, blank=True)
    
    # Additional info
    preparation_time = models.PositiveIntegerField(help_text="Preparation time in minutes")
    featured = models.BooleanField(default=False)
    seasonal = models.BooleanField(default=False)
    best_seller = models.BooleanField(default=False)
    available = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-featured', '-best_seller', 'name']
    
    def __str__(self):
        return self.name


class CustomerTestimonial(models.Model):
    name = models.CharField(max_length=100)
    avatar = models.URLField(blank=True)
    rating = models.PositiveIntegerField(choices=[(i, i) for i in range(1, 6)])
    text = models.TextField()
    dessert_item = models.ForeignKey(DessertItem, on_delete=models.CASCADE, null=True, blank=True)
    approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.rating}★"


class ChefRecommendation(models.Model):
    # Chef information
    chef_name = models.CharField(max_length=100)
    chef_title = models.CharField(max_length=100, blank=True)
    chef_image = models.URLField(blank=True)
    
    # Recommendation details
    recommendation_text = models.TextField()
    dessert_item = models.ForeignKey(DessertItem, on_delete=models.CASCADE, null=True, blank=True)
    
    # Status and metadata
    is_featured = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.chef_name}: {self.recommendation_text[:50]}..."


class ContactSubmission(models.Model):
    ORDER_TYPE_CHOICES = [
        ('general', 'General Inquiry'),
        ('custom-cake', 'Custom Cake Order'),
        ('catering', 'Catering Request'),
        ('corporate', 'Corporate Event'),
        ('wedding', 'Wedding Desserts'),
        ('complaint', 'Issue/Complaint'),
    ]
    
    PREFERRED_CONTACT_CHOICES = [
        ('email', 'Email'),
        ('phone', 'Phone'),
    ]
    
    # User relationship - null=True to support non-authenticated users
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='contact_submissions')
    
    # Contact details
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    
    # Message details
    subject = models.CharField(max_length=200)
    message = models.TextField()
    order_type = models.CharField(max_length=20, choices=ORDER_TYPE_CHOICES, default='general')
    preferred_contact = models.CharField(max_length=10, choices=PREFERRED_CONTACT_CHOICES, default='email')
    
    # Admin fields
    responded = models.BooleanField(default=False)
    admin_notes = models.TextField(blank=True, help_text="Internal notes for admin use")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Contact Submission"
        verbose_name_plural = "Contact Submissions"
    
    def __str__(self):
        user_info = f"User: {self.user.username}" if self.user else f"Guest: {self.name}"
        return f"{user_info} - {self.subject} ({self.get_order_type_display()})"
    
    @property
    def is_from_authenticated_user(self):
        return self.user is not None





class Order(models.Model):
    ORDER_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'), 
        ('confirmed', 'Confirmed'),
        ('ready', 'Ready for Pickup'),  # New status for takeaway orders
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('picked_up', 'Picked Up'),  # New status for completed takeaway orders
        ('cancelled', 'Cancelled'),
    ]
    
    ORDER_TYPE_CHOICES = [
        ('delivery', 'Home Delivery'),
        ('takeaway', 'Store Pickup'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('online', 'Paid Online'),
        ('store', 'Pay at Store'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=20, unique=True, blank=True)
    
    # Customer information
    customer_name = models.CharField(max_length=100)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20)
    
    # Order type and delivery information
    order_type = models.CharField(max_length=20, choices=ORDER_TYPE_CHOICES, default='delivery')
    delivery_address = models.JSONField(blank=True, null=True)  # Only for delivery orders
    
    # Pickup information (for takeaway orders)
    pickup_time = models.CharField(max_length=50, blank=True)  # Preferred pickup time
    special_instructions = models.TextField(blank=True)  # Customer instructions
    
    # Order details
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Payment information
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='online')
    stripe_payment_intent_id = models.CharField(max_length=200, blank=True, null=True)
    payment_status = models.CharField(max_length=50, default='pending')
    
    # Order status
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='pending')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generate order number with type prefix
            from datetime import datetime
            date_str = datetime.now().strftime('%Y%m%d')
            
            # Use different prefixes for different order types
            if self.order_type == 'takeaway':
                prefix = 'TA'  # TakeAway
            else:
                prefix = 'DL'  # DeLivery
            
            last_order = Order.objects.filter(
                order_number__startswith=f'{prefix}-{date_str}'
            ).order_by('order_number').last()
            
            if last_order:
                last_num = int(last_order.order_number.split('-')[-1])
                new_num = str(last_num + 1).zfill(3)
            else:
                new_num = '001'
            
            self.order_number = f'{prefix}-{date_str}-{new_num}'
        
        # Set payment status based on payment method
        if self.payment_method == 'store' and not self.payment_status:
            self.payment_status = 'pending'
        elif self.payment_method == 'online' and self.stripe_payment_intent_id and not self.payment_status:
            self.payment_status = 'succeeded'
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        order_type_display = "📦 Delivery" if self.order_type == 'delivery' else "🏪 Pickup"
        payment_status_icon = "✅" if self.payment_status == 'succeeded' else "⏳" if self.payment_method == 'store' else "❌"
        return f"{order_type_display} | {self.order_number} - {self.customer_name} {payment_status_icon}"
    
    @property
    def is_takeaway(self):
        return self.order_type == 'takeaway'
    
    @property
    def is_paid_online(self):
        return self.payment_method == 'online' and self.payment_status == 'succeeded'
    
    @property
    def is_pending_payment(self):
        return self.payment_method == 'store' and self.payment_status == 'pending'
    
    def get_status_display_with_context(self):
        """Get status display with order type context"""
        if self.is_takeaway:
            if self.status == 'ready':
                return 'Ready for Pickup'
            elif self.status == 'picked_up':
                return 'Completed (Picked Up)'
        return self.get_status_display()


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product_name = models.CharField(max_length=200)
    product_image = models.URLField(blank=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()
    customizations = models.JSONField(default=dict, blank=True)  # Store customizations
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def save(self, *args, **kwargs):
        self.total_price = self.unit_price * self.quantity
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.product_name} x {self.quantity} for {self.order.order_number}"


# CMS Models for Page Management
class AboutUsPage(models.Model):
    """Model for managing About Us page content"""
    
    # Hero Section
    hero_title = models.CharField(max_length=200, default="About Sweet Dessert")
    hero_subtitle = models.TextField(default="We create exquisite desserts with passion, artistry, and the finest ingredients")
    hero_badge_text = models.CharField(max_length=100, default="🏪 Our Sweet Story")
    
    # Mission Section
    mission_title = models.CharField(max_length=200, default="Our Mission")
    mission_text = models.TextField(default="To transform life's precious moments into unforgettable experiences through exceptional desserts.")
    
    # Values Section
    values_title = models.CharField(max_length=200, default="Our Values")
    values_subtitle = models.TextField(default="The principles that guide everything we do, from ingredient selection to customer service.")
    
    # Store Location Section
    store_title = models.CharField(max_length=200, default="Visit Our Store")
    store_description = models.TextField(default="Step into our warm, inviting space where the aroma of freshly baked goods fills the air.")
    store_address = models.CharField(max_length=300, default="123 Sweet Street, Dessert City, DC 12345")
    store_hours = models.CharField(max_length=200, default="Mon-Thu: 7AM-9PM | Fri-Sun: 7AM-10PM")
    
    # Call to Action Section
    cta_title = models.CharField(max_length=200, default="Ready to Experience Sweet Perfection?")
    cta_subtitle = models.TextField(default="Join thousands of satisfied customers who have made us their go-to destination for life's sweetest moments.")
    
    # Metadata
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        verbose_name = "About Us Page"
        verbose_name_plural = "About Us Pages"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"About Us Page - {self.updated_at.strftime('%Y-%m-%d %H:%M')}"


class AboutUsValue(models.Model):
    """Model for managing About Us page values"""
    ICON_CHOICES = [
        ('Heart', 'Heart'),
        ('Award', 'Award'),
        ('Users', 'Users'),
        ('ChefHat', 'Chef Hat'),
        ('Star', 'Star'),
        ('Coffee', 'Coffee'),
        ('Cake', 'Cake'),
        ('Utensils', 'Utensils'),
    ]
    
    COLOR_CHOICES = [
        ('from-red-500/20 to-pink-500/20', 'Red to Pink'),
        ('from-amber-500/20 to-yellow-500/20', 'Amber to Yellow'),
        ('from-blue-500/20 to-indigo-500/20', 'Blue to Indigo'),
        ('from-emerald-500/20 to-teal-500/20', 'Emerald to Teal'),
        ('from-purple-500/20 to-violet-500/20', 'Purple to Violet'),
        ('from-orange-500/20 to-red-500/20', 'Orange to Red'),
    ]
    
    about_page = models.ForeignKey(AboutUsPage, on_delete=models.CASCADE, related_name='values')
    title = models.CharField(max_length=200)
    description = models.TextField()
    icon = models.CharField(max_length=50, choices=ICON_CHOICES, default='Heart')
    color_gradient = models.CharField(max_length=100, choices=COLOR_CHOICES, default='from-red-500/20 to-pink-500/20')
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order', 'title']
        verbose_name = "About Us Value"
        verbose_name_plural = "About Us Values"
    
    def __str__(self):
        return self.title


class AboutUsTeamMember(models.Model):
    """Model for managing About Us page team members"""
    about_page = models.ForeignKey(AboutUsPage, on_delete=models.CASCADE, related_name='team_members')
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    description = models.TextField()
    image_emoji = models.CharField(max_length=10, default="👨‍🍳", help_text="Emoji to display as image")
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order', 'name']
        verbose_name = "Team Member"
        verbose_name_plural = "Team Members"
    
    def __str__(self):
        return f"{self.name} - {self.role}"


class OurStoryPage(models.Model):
    """Model for managing Our Story page content"""
    
    # Hero Section
    hero_title = models.CharField(max_length=200, default="Our Sweet Journey")
    hero_subtitle = models.TextField(default="From a passionate dream to your favorite dessert destination")
    hero_badge_text = models.CharField(max_length=100, default="✨ Our Story")
    
    # Founder Section
    founder_name = models.CharField(max_length=100, default="Noor Ahmed")
    founder_title = models.CharField(max_length=100, default="Founder & Head Pastry Chef")
    founder_image = models.CharField(max_length=500, blank=True, help_text="Path to founder image")
    founder_quote = models.TextField(default="Every dessert tells a story, and every story deserves the perfect sweet ending.")
    founder_description = models.TextField(default="With over a decade of experience in fine pastry arts, I founded Sweet Dessert to bring joy and sweetness to every celebration.")
    
    # Journey Section
    journey_title = models.CharField(max_length=200, default="The Journey")
    journey_subtitle = models.TextField(default="From humble beginnings to sweet success")
    
    # Impact Section
    impact_title = models.CharField(max_length=200, default="Our Sweet Impact")
    impact_subtitle = models.TextField(default="Celebrating the milestones we've achieved together")
    
    # Vision Section
    vision_title = models.CharField(max_length=200, default="Our Vision")
    vision_text = models.TextField(default="To become the world's most beloved dessert destination, spreading joy one sweet creation at a time.")
    
    # Call to Action Section
    cta_title = models.CharField(max_length=200, default="Be Part of Our Story")
    cta_subtitle = models.TextField(default="Every order, every smile, every celebration becomes part of our sweet journey.")
    
    # Metadata
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        verbose_name = "Our Story Page"
        verbose_name_plural = "Our Story Pages"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Our Story Page - {self.updated_at.strftime('%Y-%m-%d %H:%M')}"


class StoryTimeline(models.Model):
    """Model for managing Our Story page timeline events"""
    story_page = models.ForeignKey(OurStoryPage, on_delete=models.CASCADE, related_name='timeline_events')
    year = models.CharField(max_length=10)
    title = models.CharField(max_length=200)
    description = models.TextField()
    icon = models.CharField(max_length=50, choices=[
        ('Heart', 'Heart'),
        ('Award', 'Award'),
        ('Users', 'Users'),
        ('ChefHat', 'Chef Hat'),
        ('Star', 'Star'),
        ('Coffee', 'Coffee'),
        ('Cake', 'Cake'),
        ('Sparkles', 'Sparkles'),
        ('MapPin', 'Map Pin'),
    ], default='Heart')
    color_gradient = models.CharField(max_length=100, default='from-pink-500/20 to-red-500/20')
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order', 'year']
        verbose_name = "Timeline Event"
        verbose_name_plural = "Timeline Events"
    
    def __str__(self):
        return f"{self.year} - {self.title}"


class StoryImpact(models.Model):
    """Model for managing Our Story page impact metrics"""
    story_page = models.ForeignKey(OurStoryPage, on_delete=models.CASCADE, related_name='impact_metrics')
    number = models.CharField(max_length=20, help_text="e.g., 50,000+")
    label = models.CharField(max_length=100, help_text="e.g., Happy Customers")
    icon = models.CharField(max_length=50, choices=[
        ('Users', 'Users'),
        ('Heart', 'Heart'),
        ('Award', 'Award'),
        ('Star', 'Star'),
        ('Cake', 'Cake'),
        ('Coffee', 'Coffee'),
        ('ChefHat', 'Chef Hat'),
        ('MapPin', 'Map Pin'),
    ], default='Users')
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order', 'label']
        verbose_name = "Impact Metric"
        verbose_name_plural = "Impact Metrics"
    
    def __str__(self):
        return f"{self.number} {self.label}"


# FAQ CMS Models
class FAQPage(models.Model):
    """Model for managing FAQ page content"""
    title = models.CharField(max_length=200, default="Frequently Asked Questions")
    subtitle = models.TextField(default="Find answers to commonly asked questions about our desserts, ordering, and services.")
    hero_background_color = models.CharField(max_length=100, default='from-orange-50 to-pink-50')
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "FAQ Page"
        verbose_name_plural = "FAQ Pages"
    
    def __str__(self):
        return self.title


class FAQCategory(models.Model):
    """Model for organizing FAQ items into categories"""
    faq_page = models.ForeignKey(FAQPage, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, choices=[
        ('Package', 'Package'),
        ('CreditCard', 'Credit Card'),
        ('Truck', 'Truck'),
        ('Heart', 'Heart'),
        ('ChefHat', 'Chef Hat'),
        ('Clock', 'Clock'),
        ('MapPin', 'Map Pin'),
        ('Phone', 'Phone'),
        ('Mail', 'Mail'),
        ('Star', 'Star'),
        ('Users', 'Users'),
        ('Award', 'Award'),
        ('Coffee', 'Coffee'),
        ('Cake', 'Cake'),
        ('Sparkles', 'Sparkles'),
    ], default='Package')
    color = models.CharField(max_length=50, choices=[
        ('orange', 'Orange'),
        ('pink', 'Pink'),
        ('purple', 'Purple'),
        ('blue', 'Blue'),
        ('green', 'Green'),
        ('red', 'Red'),
        ('yellow', 'Yellow'),
        ('indigo', 'Indigo'),
    ], default='orange')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['order', 'name']
        verbose_name = "FAQ Category"
        verbose_name_plural = "FAQ Categories"
    
    def __str__(self):
        return self.name


class FAQItem(models.Model):
    """Model for individual FAQ questions and answers"""
    category = models.ForeignKey(FAQCategory, on_delete=models.CASCADE, related_name='faq_items')
    question = models.CharField(max_length=300)
    answer = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'question']
        verbose_name = "FAQ Item"
        verbose_name_plural = "FAQ Items"
    
    def __str__(self):
        return self.question
