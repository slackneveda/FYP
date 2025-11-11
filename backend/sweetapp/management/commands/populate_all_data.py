from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify
from sweetapp.models import DessertItem, Category, CustomerTestimonial, ChefRecommendation, Order, OrderItem
from decimal import Decimal

class Command(BaseCommand):
    help = 'Populate database with comprehensive sample data for all models'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to populate database with sample data...'))
        
        # Clear existing data (optional - comment out if you want to keep existing data)
        self.stdout.write('Clearing existing data...')
        DessertItem.objects.all().delete()
        Category.objects.all().delete()
        CustomerTestimonial.objects.all().delete()
        ChefRecommendation.objects.all().delete()
        OrderItem.objects.all().delete()
        Order.objects.all().delete()
        
        # Create Categories
        self.stdout.write('Creating categories...')
        categories_data = [
            'Cakes',
            'Cupcakes', 
            'Cookies',
            'Pastries',
            'Ice Cream',
            'Macarons',
            'Seasonal',
            'Vegan',
            'Gluten-Free'
        ]
        
        categories = {}
        for cat_name in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_name,
                defaults={
                    'slug': slugify(cat_name),
                    'description': f'{cat_name} category with delicious dessert options.'
                }
            )
            categories[cat_name] = category
            if created:
                self.stdout.write(f'  Created category: {cat_name}')

        # Create Dessert Items
        self.stdout.write('Creating dessert items...')
        desserts_data = [
            {
                'name': 'Chocolate Lava Cake',
                'description': 'Rich chocolate cake with a molten chocolate center, served warm with vanilla ice cream.',
                'price': Decimal('12.99'),
                'category': 'Cakes',
                'image': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
                'is_featured': True,
                'is_bestseller': True,
                'is_seasonal': False,
                'dietary_info': ['Vegetarian'],
                'preparation_time': 25,
                'rating': Decimal('4.8'),
                'reviews_count': 127
            },
            {
                'name': 'Strawberry Cheesecake',
                'description': 'Creamy New York style cheesecake topped with fresh strawberries and strawberry sauce.',
                'price': Decimal('9.99'),
                'category': 'Cakes',
                'image': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',
                'is_featured': True,
                'is_bestseller': False,
                'is_seasonal': False,
                'dietary_info': ['Vegetarian'],
                'preparation_time': 15,
                'rating': Decimal('4.7'),
                'reviews_count': 89
            },
            {
                'name': 'Macarons Assorted Box',
                'description': 'Delicate French macarons in 6 flavors: vanilla, chocolate, raspberry, pistachio, lemon, and rose.',
                'price': Decimal('18.99'),
                'category': 'Macarons',
                'image': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop',
                'is_featured': True,
                'is_bestseller': True,
                'is_seasonal': False,
                'dietary_info': ['Vegetarian', 'Gluten-Free'],
                'preparation_time': 20,
                'rating': Decimal('4.9'),
                'reviews_count': 156
            },
            {
                'name': 'Classic Tiramisu',
                'description': 'Traditional Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream.',
                'price': Decimal('11.99'),
                'category': 'Pastries',
                'image': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
                'is_featured': False,
                'is_bestseller': True,
                'is_seasonal': False,
                'dietary_info': ['Vegetarian'],
                'preparation_time': 30,
                'rating': Decimal('4.6'),
                'reviews_count': 78
            },
            {
                'name': 'Chocolate Chip Cookies',
                'description': 'Freshly baked chocolate chip cookies with gooey centers and crispy edges.',
                'price': Decimal('2.99'),
                'category': 'Cookies',
                'image': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop',
                'is_featured': False,
                'is_bestseller': True,
                'is_seasonal': False,
                'dietary_info': ['Vegetarian'],
                'preparation_time': 10,
                'rating': Decimal('4.5'),
                'reviews_count': 203
            },
            {
                'name': 'Vegan Chocolate Mousse',
                'description': 'Rich and creamy chocolate mousse made with coconut cream and dark chocolate.',
                'price': Decimal('8.99'),
                'category': 'Vegan',
                'image': 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop',
                'is_featured': True,
                'is_bestseller': False,
                'is_seasonal': False,
                'dietary_info': ['Vegan', 'Dairy-Free'],
                'preparation_time': 20,
                'rating': Decimal('4.4'),
                'reviews_count': 67
            },
            {
                'name': 'Pumpkin Spice Cupcakes',
                'description': 'Moist pumpkin cupcakes with warm spices, topped with cinnamon cream cheese frosting.',
                'price': Decimal('4.99'),
                'category': 'Cupcakes',
                'image': 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=400&h=300&fit=crop',
                'is_featured': False,
                'is_bestseller': False,
                'is_seasonal': True,
                'dietary_info': ['Vegetarian'],
                'preparation_time': 15,
                'rating': Decimal('4.7'),
                'reviews_count': 45
            },
            {
                'name': 'Vanilla Bean Ice Cream Sundae',
                'description': 'Premium vanilla bean ice cream with hot fudge, whipped cream, and a cherry on top.',
                'price': Decimal('7.99'),
                'category': 'Ice Cream',
                'image': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
                'is_featured': False,
                'is_bestseller': True,
                'is_seasonal': False,
                'dietary_info': ['Vegetarian'],
                'preparation_time': 5,
                'rating': Decimal('4.3'),
                'reviews_count': 92
            },
            {
                'name': 'Red Velvet Cupcake',
                'description': 'Classic red velvet cupcake with tangy cream cheese frosting.',
                'price': Decimal('5.49'),
                'category': 'Cupcakes',
                'image': 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400&h=300&fit=crop',
                'is_featured': True,
                'is_bestseller': True,
                'is_seasonal': False,
                'dietary_info': ['Vegetarian'],
                'preparation_time': 12,
                'rating': Decimal('4.8'),
                'reviews_count': 134
            },
            {
                'name': 'Lemon Tart',
                'description': 'Tangy lemon curd in a buttery pastry shell, topped with meringue.',
                'price': Decimal('6.99'),
                'category': 'Pastries',
                'image': 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400&h=300&fit=crop',
                'is_featured': False,
                'is_bestseller': False,
                'is_seasonal': False,
                'dietary_info': ['Vegetarian'],
                'preparation_time': 18,
                'rating': Decimal('4.5'),
                'reviews_count': 56
            },
            {
                'name': 'Gluten-Free Brownies',
                'description': 'Fudgy chocolate brownies made with almond flour, completely gluten-free.',
                'price': Decimal('3.99'),
                'category': 'Gluten-Free',
                'image': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop',
                'is_featured': False,
                'is_bestseller': False,
                'is_seasonal': False,
                'dietary_info': ['Vegetarian', 'Gluten-Free'],
                'preparation_time': 22,
                'rating': Decimal('4.6'),
                'reviews_count': 41
            },
            {
                'name': 'Cinnamon Apple Pie',
                'description': 'Traditional apple pie with cinnamon-spiced apples in a flaky pastry crust.',
                'price': Decimal('13.99'),
                'category': 'Seasonal',
                'image': 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=300&fit=crop',
                'is_featured': True,
                'is_bestseller': False,
                'is_seasonal': True,
                'dietary_info': ['Vegetarian'],
                'preparation_time': 35,
                'rating': Decimal('4.7'),
                'reviews_count': 73
            }
        ]

        dessert_objects = []
        for dessert_data in desserts_data:
            category_name = dessert_data.pop('category')
            dessert_data['category'] = categories[category_name]
            dessert_data['slug'] = slugify(dessert_data['name'])
            # Map frontend fields to backend fields
            if 'is_featured' in dessert_data:
                dessert_data['featured'] = dessert_data.pop('is_featured')
            if 'is_bestseller' in dessert_data:
                dessert_data['best_seller'] = dessert_data.pop('is_bestseller')
            if 'is_seasonal' in dessert_data:
                dessert_data['seasonal'] = dessert_data.pop('is_seasonal')
            
            dessert, created = DessertItem.objects.get_or_create(
                name=dessert_data['name'],
                defaults=dessert_data
            )
            dessert_objects.append(dessert)
            if created:
                self.stdout.write(f'  Created dessert: {dessert.name}')

        # Create Customer Testimonials
        self.stdout.write('Creating customer testimonials...')
        testimonials_data = [
            {
                'name': 'Sarah Johnson',
                'rating': 5,
                'text': 'Absolutely incredible desserts! The chocolate lava cake was perfection. Will definitely be ordering again.',
                'approved': True
            },
            {
                'name': 'Mike Chen',
                'rating': 5,
                'text': 'Best macarons I\'ve ever had! The flavors were amazing and they arrived perfectly packaged.',
                'approved': True
            },
            {
                'name': 'Emily Davis',
                'rating': 5,
                'text': 'The vegan chocolate mousse was so rich and delicious, I couldn\'t believe it was dairy-free!',
                'approved': True
            },
            {
                'name': 'James Wilson',
                'rating': 4,
                'text': 'Great selection of desserts. The tiramisu was authentic and delicious.',
                'approved': False
            },
            {
                'name': 'Lisa Rodriguez',
                'rating': 5,
                'text': 'Fast delivery and amazing quality. The red velvet cupcakes were a hit at our party!',
                'approved': True
            }
        ]

        for testimonial_data in testimonials_data:
            testimonial, created = CustomerTestimonial.objects.get_or_create(
                name=testimonial_data['name'],
                defaults=testimonial_data
            )
            if created:
                self.stdout.write(f'  Created testimonial from: {testimonial.name}')

        # Create Chef Recommendations
        self.stdout.write('Creating chef recommendations...')
        chef_recommendations_data = [
            {
                'dessert_item': dessert_objects[0],  # Chocolate Lava Cake
                'reason': 'This is my personal favorite - the perfect balance of rich chocolate and warm, gooey center makes it irresistible.',
                'active': True
            },
            {
                'dessert_item': dessert_objects[2],  # Macarons
                'reason': 'These macarons showcase the perfect technique - crispy shells with chewy centers and intense flavors.',
                'active': True
            },
            {
                'dessert_item': dessert_objects[5],  # Vegan Chocolate Mousse
                'reason': 'A testament to how amazing plant-based desserts can be. Rich, silky, and completely satisfying.',
                'active': True
            },
            {
                'dessert_item': dessert_objects[8],  # Red Velvet Cupcake
                'reason': 'The classic done right - moist cake with the perfect tang from cream cheese frosting.',
                'active': False
            }
        ]

        for chef_rec_data in chef_recommendations_data:
            chef_rec, created = ChefRecommendation.objects.get_or_create(
                dessert_item=chef_rec_data['dessert_item'],
                defaults=chef_rec_data
            )
            if created:
                self.stdout.write(f'  Created chef recommendation for: {chef_rec.dessert_item.name}')

        # Create Sample Orders (for OrdersPage)
        self.stdout.write('Creating sample orders...')
        
        orders_data = [
            {
                'customer_name': 'John Doe',
                'customer_email': 'john.doe@example.com',
                'customer_phone': '+1234567890',
                'delivery_address': {'street': '123 Sweet Avenue', 'city': 'Dessert City', 'state': 'DC', 'zip': '12345'},
                'status': 'delivered',
                'subtotal': Decimal('42.97'),
                'delivery_fee': Decimal('3.00'),
                'tax': Decimal('0.00'),
                'total': Decimal('45.97'),
                'stripe_payment_intent_id': 'pi_example_123',
                'payment_status': 'succeeded',
                'items': [
                    {'product_name': dessert_objects[0].name, 'unit_price': dessert_objects[0].price, 'quantity': 2, 'product_image': dessert_objects[0].image},
                    {'product_name': dessert_objects[1].name, 'unit_price': dessert_objects[1].price, 'quantity': 1, 'product_image': dessert_objects[1].image},
                    {'product_name': dessert_objects[2].name, 'unit_price': dessert_objects[2].price, 'quantity': 1, 'product_image': dessert_objects[2].image}
                ]
            },
            {
                'customer_name': 'Jane Smith',
                'customer_email': 'jane.smith@example.com',
                'customer_phone': '+1234567891',
                'delivery_address': {'street': '456 Baker Street', 'city': 'Sweet Town', 'state': 'ST', 'zip': '67890'},
                'status': 'processing',
                'subtotal': Decimal('23.95'),
                'delivery_fee': Decimal('3.00'),
                'tax': Decimal('2.02'),
                'total': Decimal('28.97'),
                'stripe_payment_intent_id': 'pi_example_456',
                'payment_status': 'succeeded',
                'items': [
                    {'product_name': dessert_objects[3].name, 'unit_price': dessert_objects[3].price, 'quantity': 1, 'product_image': dessert_objects[3].image},
                    {'product_name': dessert_objects[4].name, 'unit_price': dessert_objects[4].price, 'quantity': 4, 'product_image': dessert_objects[4].image}
                ]
            }
        ]

        for order_data in orders_data:
            items_data = order_data.pop('items')
            order = Order.objects.create(**order_data)
            self.stdout.write(f'  Created order: {order.order_number}')
            
            # Create order items
            for item_data in items_data:
                OrderItem.objects.create(
                    order=order,
                    **item_data
                )
                self.stdout.write(f'    Added item: {item_data["product_name"]} x{item_data["quantity"]}')

        self.stdout.write(self.style.SUCCESS('\n=== DATABASE POPULATION COMPLETE ==='))
        self.stdout.write(self.style.SUCCESS(f'✅ Categories: {Category.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'✅ Dessert Items: {DessertItem.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'✅ Customer Testimonials: {CustomerTestimonial.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'✅ Chef Recommendations: {ChefRecommendation.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'✅ Orders: {Order.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'✅ Order Items: {OrderItem.objects.count()}'))
        self.stdout.write(self.style.SUCCESS('\nYour Django admin and frontend should now have comprehensive sample data!'))