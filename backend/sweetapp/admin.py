from django.contrib import admin
from .models import (
    Order, OrderItem, Category, DessertItem, 
    CustomerTestimonial, ChefRecommendation, ContactSubmission,
    AboutUsPage, AboutUsValue, AboutUsTeamMember,
    OurStoryPage, StoryTimeline, StoryImpact,
    FAQPage, FAQCategory, FAQItem
)

class UserTypeFilter(admin.SimpleListFilter):
    title = 'User Type'
    parameter_name = 'user_type'

    def lookups(self, request, model_admin):
        return (
            ('authenticated', 'Authenticated Users'),
            ('guest', 'Guest Users'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'authenticated':
            return queryset.filter(user__isnull=False)
        if self.value() == 'guest':
            return queryset.filter(user__isnull=True)

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    readonly_fields = ('total_price',)
    extra = 0



@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer_name', 'customer_email', 'order_type', 'pickup_time', 'get_delivery_address_summary', 'total', 'status', 'payment_status', 'created_at')
    list_filter = ('status', 'payment_status', 'order_type', 'payment_method', 'created_at')
    search_fields = ('order_number', 'customer_name', 'customer_email', 'stripe_payment_intent_id')
    readonly_fields = ('id', 'order_number', 'stripe_payment_intent_id', 'created_at', 'updated_at', 'get_formatted_delivery_address')
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Order Information', {
            'fields': ('id', 'order_number', 'order_type', 'status', 'created_at', 'updated_at')
        }),
        ('Customer Information', {
            'fields': ('customer_name', 'customer_email', 'customer_phone')
        }),
        ('Delivery Information', {
            'fields': ('delivery_address', 'get_formatted_delivery_address'),
            'classes': ('collapse',)
        }),
        ('Takeaway Information', {
            'fields': ('pickup_time', 'special_instructions'),
            'classes': ('collapse',)
        }),
        ('Pricing', {
            'fields': ('subtotal', 'delivery_fee', 'tax', 'total')
        }),
        ('Payment Information', {
            'fields': ('payment_method', 'payment_status', 'stripe_payment_intent_id'),
            'classes': ('collapse',)
        }),
    )
    
    def get_delivery_address_summary(self, obj):
        """Short summary of delivery address for list view"""
        if obj.order_type == 'takeaway' or not obj.delivery_address:
            return '-'
        
        address = obj.delivery_address
        if isinstance(address, dict) and address:
            # Extract key parts of the address
            parts = []
            if address.get('line1'):
                parts.append(address['line1'])
            if address.get('city'):
                parts.append(address['city'])
            if address.get('postal_code'):
                parts.append(address['postal_code'])
            
            if parts:
                return ', '.join(parts[:2])  # Show first 2 parts to keep it short
        
        return 'Address provided'
    get_delivery_address_summary.short_description = 'Delivery Address'
    
    def get_formatted_delivery_address(self, obj):
        """Formatted delivery address for detail view"""
        if obj.order_type == 'takeaway' or not obj.delivery_address:
            return 'N/A (Takeaway Order)'
        
        address = obj.delivery_address
        if isinstance(address, dict) and address:
            formatted_parts = []
            
            # Name
            if address.get('name'):
                formatted_parts.append(f"📝 Name: {address['name']}")
            
            # Address lines
            if address.get('line1'):
                formatted_parts.append(f"🏠 Street: {address['line1']}")
            if address.get('line2'):
                formatted_parts.append(f"📍 Line 2: {address['line2']}")
            
            # City, State, Postal Code
            location_parts = []
            if address.get('city'):
                location_parts.append(address['city'])
            if address.get('state'):
                location_parts.append(address['state'])
            if address.get('postal_code'):
                location_parts.append(address['postal_code'])
            
            if location_parts:
                formatted_parts.append(f"🌍 Location: {', '.join(location_parts)}")
            
            # Country
            if address.get('country'):
                formatted_parts.append(f"🌎 Country: {address['country']}")
            
            return '\n'.join(formatted_parts) if formatted_parts else 'No address details'
        
        return 'No address provided'
    get_formatted_delivery_address.short_description = 'Formatted Delivery Address'

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'order', 'quantity', 'unit_price', 'total_price')
    list_filter = ('order__created_at',)
    search_fields = ('product_name', 'order__order_number')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


@admin.register(DessertItem)
class DessertItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'get_short_description', 'category', 'price', 'rating', 'featured', 'best_seller', 'available')
    list_filter = ('category', 'featured', 'best_seller', 'seasonal', 'available')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('featured', 'best_seller', 'available')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description', 'category', 'price', 'image')
        }),
        ('Product Details', {
            'fields': ('dietary_info', 'ingredients', 'allergens', 'preparation_time')
        }),
        ('Marketing', {
            'fields': ('featured', 'seasonal', 'best_seller', 'available')
        }),
        ('Reviews', {
            'fields': ('rating', 'reviews_count'),
            'classes': ('collapse',)
        }),
    )
    
    def get_short_description(self, obj):
        """Show first 60 characters of description in list view"""
        if obj.description:
            return (obj.description[:60] + '...' if len(obj.description) > 60 else obj.description)
        return 'No description'
    get_short_description.short_description = 'Description Preview'


@admin.register(CustomerTestimonial)
class CustomerTestimonialAdmin(admin.ModelAdmin):
    list_display = ('name', 'rating', 'dessert_item', 'approved', 'created_at')
    list_filter = ('rating', 'approved', 'created_at')
    search_fields = ('name', 'text')
    list_editable = ('approved',)


@admin.register(ChefRecommendation)
class ChefRecommendationAdmin(admin.ModelAdmin):
    list_display = ('dessert_item', 'active', 'created_at')
    list_filter = ('active', 'created_at')
    list_editable = ('active',)


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = (
        'get_user_info', 'subject', 'order_type', 'preferred_contact', 
        'responded', 'created_at'
    )
    list_filter = (
        'order_type', 'preferred_contact', 'responded', 'created_at', 
        UserTypeFilter  # Filter for authenticated vs guest users
    )
    search_fields = ('name', 'email', 'subject', 'message', 'user__username', 'user__email')
    list_editable = ('responded',)
    readonly_fields = ('created_at', 'updated_at', 'is_from_authenticated_user')
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('user', 'name', 'email', 'phone', 'is_from_authenticated_user')
        }),
        ('Message Details', {
            'fields': ('subject', 'message', 'order_type', 'preferred_contact')
        }),
        ('Admin Management', {
            'fields': ('responded', 'admin_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_user_info(self, obj):
        if obj.user:
            return f"👤 {obj.user.username} ({obj.name})"
        else:
            return f"👥 Guest: {obj.name}"
    get_user_info.short_description = 'User'
    get_user_info.admin_order_field = 'user'
    
    def get_queryset(self, request):
        # Optimize queries by selecting related user data
        return super().get_queryset(request).select_related('user')
    
    # Add custom actions
    actions = ['mark_as_responded', 'mark_as_not_responded']
    
    def mark_as_responded(self, request, queryset):
        updated = queryset.update(responded=True)
        self.message_user(request, f'{updated} contact submissions marked as responded.')
    mark_as_responded.short_description = "Mark selected submissions as responded"
    
    def mark_as_not_responded(self, request, queryset):
        updated = queryset.update(responded=False)
        self.message_user(request, f'{updated} contact submissions marked as not responded.')
    mark_as_not_responded.short_description = "Mark selected submissions as not responded"


# CMS Admin Classes
class AboutUsValueInline(admin.TabularInline):
    model = AboutUsValue
    extra = 1
    fields = ('title', 'description', 'icon', 'color_gradient', 'order')
    ordering = ['order']


class AboutUsTeamMemberInline(admin.TabularInline):
    model = AboutUsTeamMember
    extra = 1
    fields = ('name', 'role', 'description', 'image_emoji', 'order')
    ordering = ['order']


@admin.register(AboutUsPage)
class AboutUsPageAdmin(admin.ModelAdmin):
    list_display = ('hero_title', 'is_active', 'updated_at', 'updated_by')
    list_filter = ('is_active', 'created_at', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [AboutUsValueInline, AboutUsTeamMemberInline]
    
    fieldsets = (
        ('Hero Section', {
            'fields': ('hero_title', 'hero_subtitle', 'hero_badge_text')
        }),
        ('Mission Section', {
            'fields': ('mission_title', 'mission_text')
        }),
        ('Values Section', {
            'fields': ('values_title', 'values_subtitle')
        }),
        ('Store Information', {
            'fields': ('store_title', 'store_description', 'store_address', 'store_hours')
        }),
        ('Call to Action', {
            'fields': ('cta_title', 'cta_subtitle')
        }),
        ('Status & Metadata', {
            'fields': ('is_active', 'updated_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(AboutUsValue)
class AboutUsValueAdmin(admin.ModelAdmin):
    list_display = ('title', 'about_page', 'icon', 'order')
    list_filter = ('icon', 'about_page')
    list_editable = ('order',)
    ordering = ['about_page', 'order']


@admin.register(AboutUsTeamMember)
class AboutUsTeamMemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'about_page', 'order')
    list_filter = ('about_page',)
    list_editable = ('order',)
    ordering = ['about_page', 'order']


class StoryTimelineInline(admin.TabularInline):
    model = StoryTimeline
    extra = 1
    fields = ('year', 'title', 'description', 'icon', 'color_gradient', 'order')
    ordering = ['order']


class StoryImpactInline(admin.TabularInline):
    model = StoryImpact
    extra = 1
    fields = ('number', 'label', 'icon', 'order')
    ordering = ['order']


@admin.register(OurStoryPage)
class OurStoryPageAdmin(admin.ModelAdmin):
    list_display = ('hero_title', 'founder_name', 'is_active', 'updated_at', 'updated_by')
    list_filter = ('is_active', 'created_at', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [StoryTimelineInline, StoryImpactInline]
    
    fieldsets = (
        ('Hero Section', {
            'fields': ('hero_title', 'hero_subtitle', 'hero_badge_text')
        }),
        ('Founder Information', {
            'fields': ('founder_name', 'founder_title', 'founder_image', 'founder_quote', 'founder_description')
        }),
        ('Journey Section', {
            'fields': ('journey_title', 'journey_subtitle')
        }),
        ('Impact Section', {
            'fields': ('impact_title', 'impact_subtitle')
        }),
        ('Vision Section', {
            'fields': ('vision_title', 'vision_text')
        }),
        ('Call to Action', {
            'fields': ('cta_title', 'cta_subtitle')
        }),
        ('Status & Metadata', {
            'fields': ('is_active', 'updated_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(StoryTimeline)
class StoryTimelineAdmin(admin.ModelAdmin):
    list_display = ('year', 'title', 'story_page', 'icon', 'order')
    list_filter = ('story_page', 'icon')
    list_editable = ('order',)
    ordering = ['story_page', 'order']


@admin.register(StoryImpact)
class StoryImpactAdmin(admin.ModelAdmin):
    list_display = ('number', 'label', 'story_page', 'icon', 'order')
    list_filter = ('story_page', 'icon')
    list_editable = ('order',)
    ordering = ['story_page', 'order']


# FAQ Admin Classes
class FAQCategoryInline(admin.TabularInline):
    model = FAQCategory
    extra = 1
    fields = ('name', 'description', 'icon', 'color', 'order', 'is_active')
    ordering = ['order']


class FAQItemInline(admin.TabularInline):
    model = FAQItem
    extra = 1
    fields = ('question', 'answer', 'order', 'is_active')
    ordering = ['order']


@admin.register(FAQPage)
class FAQPageAdmin(admin.ModelAdmin):
    list_display = ('title', 'updated_at', 'created_at')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [FAQCategoryInline]
    
    fieldsets = (
        ('Page Content', {
            'fields': ('title', 'subtitle', 'hero_background_color')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(FAQCategory)
class FAQCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'faq_page', 'icon', 'color', 'order', 'is_active')
    list_filter = ('faq_page', 'icon', 'color', 'is_active')
    list_editable = ('order', 'is_active')
    ordering = ['faq_page', 'order']
    inlines = [FAQItemInline]
    
    fieldsets = (
        ('Category Information', {
            'fields': ('faq_page', 'name', 'description')
        }),
        ('Display Settings', {
            'fields': ('icon', 'color', 'order', 'is_active')
        }),
    )


@admin.register(FAQItem)
class FAQItemAdmin(admin.ModelAdmin):
    list_display = ('question', 'category', 'order', 'is_active', 'updated_at')
    list_filter = ('category__faq_page', 'category', 'is_active', 'created_at')
    search_fields = ('question', 'answer')
    list_editable = ('order', 'is_active')
    ordering = ['category', 'order']
    
    fieldsets = (
        ('FAQ Content', {
            'fields': ('category', 'question', 'answer')
        }),
        ('Settings', {
            'fields': ('order', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
