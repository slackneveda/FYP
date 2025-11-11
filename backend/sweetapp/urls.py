from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views, auth_views, admin_views, chat_views

# Create DRF router
router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'desserts', views.DessertItemViewSet, basename='dessert')

# CMS routes
router.register(r'cms/about-us', views.AboutUsPageViewSet, basename='about-us-page')
router.register(r'cms/about-us-values', views.AboutUsValueViewSet, basename='about-us-value')
router.register(r'cms/about-us-team', views.AboutUsTeamMemberViewSet, basename='about-us-team')
router.register(r'cms/our-story', views.OurStoryPageViewSet, basename='our-story-page')
router.register(r'cms/story-timeline', views.StoryTimelineViewSet, basename='story-timeline')
router.register(r'cms/story-impact', views.StoryImpactViewSet, basename='story-impact')
router.register(r'cms/faq', views.FAQPageViewSet, basename='faq-page')
router.register(r'cms/faq-categories', views.FAQCategoryViewSet, basename='faq-category')
router.register(r'cms/faq-items', views.FAQItemViewSet, basename='faq-item')

urlpatterns = [
    # Include DRF router URLs
    path('', include(router.urls)),
    
    # Payment endpoints
    path('create-payment-intent/', views.create_payment_intent, name='create_payment_intent'),
    
    # Order endpoints
    path('orders/', views.orders_view, name='orders'),
    path('orders/<uuid:order_id>/', views.get_order, name='get_order'),
    
    # Product endpoints (legacy)
    path('categories/', views.get_categories, name='categories'),
    path('desserts/', views.get_desserts, name='desserts'),
    path('featured-desserts/', views.get_featured_desserts, name='featured_desserts'),
    
    # Content endpoints
    path('testimonials/', views.get_testimonials, name='testimonials'),
    path('chef-recommendations/', views.get_chef_recommendations, name='chef_recommendations'),
    
    # Contact endpoints
    path('contact/', views.submit_contact, name='contact'),
    path('contact/user-submissions/', views.get_user_contact_submissions, name='user_contact_submissions'),
    
    # Media endpoints
    path('hero-video/', views.get_hero_video, name='hero_video'),
    
    # Session test endpoint
    path('test-session/', views.test_session, name='test_session'),
    
    # Takeaway/Pickup order endpoints
    path('takeaway/create-order/', views.create_takeaway_order, name='create_takeaway_order'),
    path('takeaway/create-payment-intent/', views.create_takeaway_payment_intent, name='create_takeaway_payment_intent'),
    path('takeaway/orders/', views.get_takeaway_orders, name='get_takeaway_orders'),
    path('takeaway/orders/<uuid:order_id>/status/', views.update_takeaway_order_status, name='update_takeaway_order_status'),
    
    # Authentication endpoints
    path('auth/register/', auth_views.register_view, name='register'),
    path('auth/login/', auth_views.login_view, name='login'),
    path('auth/logout/', auth_views.logout_view, name='logout'),
    path('auth/user/', auth_views.user_info_view, name='user_info'),
    path('auth/check/', auth_views.check_auth_view, name='check_auth'),
    
    # Dashboard endpoint
    path('dashboard/', auth_views.dashboard_view, name='dashboard'),
    
    # Admin endpoints
    path('admin/test-session/', admin_views.test_session, name='test_session'),
    path('admin/dashboard/', admin_views.admin_dashboard_stats, name='admin_dashboard'),
    path('admin/users/', admin_views.admin_users_list, name='admin_users'),
    path('admin/users/create/', admin_views.admin_user_create, name='admin_user_create'),
    path('admin/users/<int:user_id>/', admin_views.admin_user_update, name='admin_user_update'),
    path('admin/users/<int:user_id>/delete/', admin_views.admin_user_delete, name='admin_user_delete'),
    path('admin/orders/', admin_views.admin_orders_list, name='admin_orders'),
    path('admin/orders/create/', admin_views.admin_order_create, name='admin_order_create'),
    path('admin/orders/<uuid:order_id>/', admin_views.admin_order_update, name='admin_order_update'),
    path('admin/orders/<uuid:order_id>/delete/', admin_views.admin_order_delete, name='admin_order_delete'),
    path('admin/order-items/', admin_views.admin_order_items_list, name='admin_order_items'),
    path('admin/order-items/<int:item_id>/delete/', admin_views.admin_order_item_delete, name='admin_order_item_delete'),
    path('admin/products/', admin_views.admin_products_list, name='admin_products'),
    path('admin/products/create/', admin_views.admin_product_create, name='admin_product_create'),
    path('admin/products/<int:product_id>/', admin_views.admin_product_update, name='admin_product_update'),
    path('admin/products/<int:product_id>/delete/', admin_views.admin_product_delete, name='admin_product_delete'),
    path('admin/categories/', admin_views.admin_categories_list, name='admin_categories'),
    path('admin/categories/create/', admin_views.admin_category_create, name='admin_category_create'),
    path('admin/categories/<int:category_id>/', admin_views.admin_category_update, name='admin_category_update'),
    path('admin/categories/<int:category_id>/delete/', admin_views.admin_category_delete, name='admin_category_delete'),
    path('admin/testimonials/', admin_views.admin_testimonials_list, name='admin_testimonials'),
    path('admin/testimonials/create/', admin_views.admin_testimonial_create, name='admin_testimonial_create'),
    path('admin/testimonials/<int:testimonial_id>/', admin_views.admin_testimonial_update, name='admin_testimonial_update'),
    path('admin/testimonials/<int:testimonial_id>/delete/', admin_views.admin_testimonial_delete, name='admin_testimonial_delete'),
    path('admin/chef-recommendations/', admin_views.admin_chef_recommendations_list, name='admin_chef_recommendations'),
    path('admin/chef-recommendations/create/', admin_views.admin_chef_recommendation_create, name='admin_chef_recommendation_create'),
    path('admin/chef-recommendations/<int:recommendation_id>/', admin_views.admin_chef_recommendation_update, name='admin_chef_recommendation_update'),
    path('admin/chef-recommendations/<int:recommendation_id>/delete/', admin_views.admin_chef_recommendation_delete, name='admin_chef_recommendation_delete'),
    path('admin/contacts/', admin_views.admin_contacts_list, name='admin_contacts'),
    path('admin/contacts/create/', admin_views.admin_contact_create, name='admin_contact_create'),
    path('admin/contacts/<int:contact_id>/', admin_views.admin_contact_update, name='admin_contact_update'),
    path('admin/contacts/<int:contact_id>/delete/', admin_views.admin_contact_delete, name='admin_contact_delete'),
    
    # Chat Assistant endpoints
    path('chat/stream/', chat_views.chat_stream, name='chat_stream'),
    path('chat/add-to-cart/', chat_views.add_to_cart, name='chat_add_to_cart'),
    path('chat/cart/', chat_views.get_cart, name='chat_get_cart'),
    path('chat/clear-cart/', chat_views.clear_cart, name='chat_clear_cart'),
    path('chat/stats/', chat_views.chat_stats, name='chat_stats'),
    path('chat/analytics/', chat_views.chat_analytics, name='chat_analytics'),
]