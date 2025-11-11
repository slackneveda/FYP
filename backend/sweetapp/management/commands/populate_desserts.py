from django.core.management.base import BaseCommand
from django.utils.text import slugify
from sweetapp.models import Category, DessertItem, CustomerTestimonial, ChefRecommendation
from decimal import Decimal


class Command(BaseCommand):
    help = 'Populate database with initial dessert data'

    def handle(self, *args, **options):
        self.stdout.write('🍰 Starting to populate database with dessert data...')
        
        # Create categories
        categories_data = [
            {"name": "Cakes", "description": "Rich and decadent cakes for special occasions"},
            {"name": "Pastries", "description": "Delicate French-inspired pastries and tarts"},
            {"name": "Cookies", "description": "Fresh baked cookies and brownies"},
            {"name": "Cupcakes", "description": "Individual sized cupcakes with creative flavors"},
            {"name": "Ice Cream", "description": "Premium ice cream and frozen desserts"},
            {"name": "Healthy Options", "description": "Guilt-free desserts for health-conscious customers"},
        ]
        
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data["name"],
                defaults={
                    'slug': slugify(cat_data["name"]),
                    'description': cat_data["description"]
                }
            )
            if created:
                self.stdout.write(f'✅ Created category: {category.name}')
        
        # Create desserts
        desserts_data = [
            {
                "name": "Chocolate Lava Cake",
                "description": "Decadent chocolate cake with a molten chocolate center, served warm with vanilla ice cream",
                "price": 12.99,
                "category": "Cakes",
                "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop",
                "rating": 4.8,
                "reviews_count": 127,
                "dietary_info": ["vegetarian"],
                "ingredients": ["chocolate", "eggs", "butter", "flour", "sugar"],
                "allergens": ["eggs", "gluten", "dairy"],
                "preparation_time": 25,
                "featured": True,
                "seasonal": False,
                "best_seller": True,
            },
            {
                "name": "Strawberry Cheesecake",
                "description": "Creamy New York style cheesecake topped with fresh strawberries and strawberry glaze",
                "price": 9.99,
                "category": "Cakes",
                "image": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop",
                "rating": 4.6,
                "reviews_count": 89,
                "dietary_info": ["vegetarian"],
                "ingredients": ["cream cheese", "strawberries", "graham crackers", "sugar"],
                "allergens": ["eggs", "gluten", "dairy"],
                "preparation_time": 45,
                "featured": True,
                "seasonal": False,
                "best_seller": False,
            },
            {
                "name": "Macarons Assorted",
                "description": "French macarons in various flavors: vanilla, chocolate, raspberry, and pistachio",
                "price": 18.99,
                "category": "Pastries",
                "image": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop",
                "rating": 4.9,
                "reviews_count": 203,
                "dietary_info": ["vegetarian", "gluten-free"],
                "ingredients": ["almond flour", "sugar", "eggs", "food coloring"],
                "allergens": ["eggs", "nuts"],
                "preparation_time": 60,
                "featured": False,
                "seasonal": False,
                "best_seller": True,
            },
            {
                "name": "Tiramisu",
                "description": "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream",
                "price": 11.99,
                "category": "Pastries",
                "image": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop",
                "rating": 4.7,
                "reviews_count": 156,
                "dietary_info": ["vegetarian"],
                "ingredients": ["mascarpone", "coffee", "ladyfingers", "cocoa", "eggs"],
                "allergens": ["eggs", "gluten", "dairy"],
                "preparation_time": 30,
                "featured": True,
                "seasonal": False,
                "best_seller": False,
            },
            {
                "name": "Chocolate Chip Cookies",
                "description": "Fresh baked chocolate chip cookies, soft and chewy with premium chocolate chips",
                "price": 2.99,
                "category": "Cookies",
                "image": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop",
                "rating": 4.5,
                "reviews_count": 342,
                "dietary_info": ["vegetarian"],
                "ingredients": ["flour", "chocolate chips", "butter", "sugar", "eggs"],
                "allergens": ["eggs", "gluten", "dairy"],
                "preparation_time": 15,
                "featured": False,
                "seasonal": False,
                "best_seller": True,
            },
            {
                "name": "Vegan Chocolate Mousse",
                "description": "Rich and creamy chocolate mousse made with avocado and cocoa, completely plant-based",
                "price": 8.99,
                "category": "Healthy Options",
                "image": "https://images.unsplash.com/photo-1541781408260-3c61143b63d5?w=400&h=400&fit=crop",
                "rating": 4.4,
                "reviews_count": 67,
                "dietary_info": ["vegan", "gluten-free", "dairy-free"],
                "ingredients": ["avocado", "cocoa powder", "maple syrup", "vanilla"],
                "allergens": [],
                "preparation_time": 20,
                "featured": False,
                "seasonal": False,
                "best_seller": False,
            },
            {
                "name": "Red Velvet Cupcakes",
                "description": "Classic red velvet cupcakes with rich cream cheese frosting and a hint of cocoa",
                "price": 5.49,
                "category": "Cupcakes",
                "image": "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400&h=400&fit=crop",
                "rating": 4.7,
                "reviews_count": 156,
                "dietary_info": ["vegetarian"],
                "ingredients": ["flour", "cocoa", "cream cheese", "butter", "food coloring"],
                "allergens": ["eggs", "gluten", "dairy"],
                "preparation_time": 30,
                "featured": True,
                "seasonal": False,
                "best_seller": True,
            },
            {
                "name": "Ice Cream Sundae",
                "description": "Premium vanilla ice cream with hot fudge, whipped cream, nuts, and a cherry on top",
                "price": 7.99,
                "category": "Ice Cream",
                "image": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=400&fit=crop",
                "rating": 4.3,
                "reviews_count": 145,
                "dietary_info": ["vegetarian"],
                "ingredients": ["vanilla ice cream", "hot fudge", "whipped cream", "nuts", "cherry"],
                "allergens": ["dairy", "nuts"],
                "preparation_time": 5,
                "featured": False,
                "seasonal": False,
                "best_seller": False,
            },
        ]
        
        for dessert_data in desserts_data:
            try:
                category = Category.objects.get(name=dessert_data["category"])
                
                dessert, created = DessertItem.objects.get_or_create(
                    name=dessert_data["name"],
                    defaults={
                        'slug': slugify(dessert_data["name"]),
                        'description': dessert_data["description"],
                        'price': Decimal(str(dessert_data["price"])),
                        'category': category,
                        'image': dessert_data["image"],
                        'rating': Decimal(str(dessert_data["rating"])),
                        'reviews_count': dessert_data["reviews_count"],
                        'dietary_info': dessert_data["dietary_info"],
                        'ingredients': dessert_data["ingredients"],
                        'allergens': dessert_data["allergens"],
                        'preparation_time': dessert_data["preparation_time"],
                        'featured': dessert_data["featured"],
                        'seasonal': dessert_data["seasonal"],
                        'best_seller': dessert_data["best_seller"],
                    }
                )
                if created:
                    self.stdout.write(f'✅ Created dessert: {dessert.name}')
            except Exception as e:
                self.stdout.write(f'❌ Error creating {dessert_data["name"]}: {str(e)}')
        
        # Create testimonials
        testimonials_data = [
            {
                "name": "Sarah Johnson",
                "avatar": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face",
                "rating": 5,
                "text": "The chocolate lava cake was absolutely divine! Best dessert I've ever had. Will definitely order again!",
                "approved": True
            },
            {
                "name": "Mike Chen",
                "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
                "rating": 5,
                "text": "Amazing variety and quality. The vegan options are surprisingly delicious. Great service too!",
                "approved": True
            },
            {
                "name": "Emily Rodriguez",
                "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face",
                "rating": 4,
                "text": "Beautiful presentation and taste to match. The macarons are works of art! Highly recommend.",
                "approved": True
            }
        ]
        
        for test_data in testimonials_data:
            testimonial, created = CustomerTestimonial.objects.get_or_create(
                name=test_data["name"],
                text=test_data["text"],
                defaults={
                    'avatar': test_data["avatar"],
                    'rating': test_data["rating"],
                    'approved': test_data["approved"]
                }
            )
            if created:
                self.stdout.write(f'✅ Created testimonial: {testimonial.name}')
        
        # Create chef recommendations
        try:
            macarons = DessertItem.objects.get(name="Macarons Assorted")
            lava_cake = DessertItem.objects.get(name="Chocolate Lava Cake")
            tiramisu = DessertItem.objects.get(name="Tiramisu")
            
            recommendations_data = [
                {
                    "dessert": macarons,
                    "reason": "Our signature French technique creates the perfect delicate shell with rich filling"
                },
                {
                    "dessert": lava_cake,
                    "reason": "The perfect balance of rich chocolate and warm, gooey center - a true masterpiece"
                },
                {
                    "dessert": tiramisu,
                    "reason": "Made with authentic Italian mascarpone and the finest espresso blend"
                }
            ]
            
            for rec_data in recommendations_data:
                rec, created = ChefRecommendation.objects.get_or_create(
                    dessert_item=rec_data["dessert"],
                    defaults={
                        'reason': rec_data["reason"],
                        'active': True
                    }
                )
                if created:
                    self.stdout.write(f'✅ Created chef recommendation: {rec.dessert_item.name}')
                    
        except Exception as e:
            self.stdout.write(f'❌ Error creating chef recommendations: {str(e)}')
        
        self.stdout.write('🎉 Database population completed!')