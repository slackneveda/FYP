from django.core.management.base import BaseCommand
from sweetapp.models import Category, DessertItem, ChefRecommendation
from decimal import Decimal
import random


class Command(BaseCommand):
    help = 'Populate database with featured desserts using actual asset images'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Populating featured desserts...'))

        # Seasonal Specials (Autumn theme)
        seasonal_desserts = [
            {
                'name': 'Pumpkin Spice Lava Cake',
                'slug': 'pumpkin-spice-lava-cake',
                'description': 'Warm autumn spices meet rich chocolate in this seasonal favorite with a molten pumpkin center',
                'price': Decimal('450.00'),
                'category': 'cakes',
                'image': '/src/assets/images/categories/cakes/Chocolate-Heaven.jpg',
                'rating': Decimal('4.7'),
                'reviews_count': 89,
                'seasonal': True,
                'featured': True,
            },
            {
                'name': 'Maple Pecan Brownies',
                'slug': 'maple-pecan-brownies',
                'description': 'Fudgy brownies infused with maple syrup and topped with crunchy pecans',
                'price': Decimal('320.00'),
                'category': 'brownies',
                'image': '/src/assets/images/categories/brownies/Nutella-Brownie-7.jpg',
                'rating': Decimal('4.6'),
                'reviews_count': 67,
                'seasonal': True,
                'featured': True,
            },
            {
                'name': 'Cinnamon Apple Cupcakes',
                'slug': 'cinnamon-apple-cupcakes',
                'description': 'Moist cupcakes with fresh apple chunks and warm cinnamon cream cheese frosting',
                'price': Decimal('280.00'),
                'category': 'cupcakes',
                'image': '/src/assets/images/categories/cupcakes/Red-Velvet-Cupcake.jpg',
                'rating': Decimal('4.8'),
                'reviews_count': 124,
                'seasonal': True,
                'featured': True,
            }
        ]

        # Chef's Picks (Premium items)
        chef_picks_data = [
            {
                'dessert': {
                    'name': 'Chef Maria\'s Signature Tiramisu',
                    'slug': 'chef-maria-signature-tiramisu',
                    'description': 'Our head chef\'s personal recipe with authentic mascarpone and premium espresso',
                    'price': Decimal('520.00'),
                    'category': 'desserts',
                    'image': '/src/assets/images/categories/desserts/Lotus-cheesecake-9.jpg',
                    'rating': Decimal('4.9'),
                    'reviews_count': 156,
                    'featured': True,
                },
                'reason': 'Made with authentic Italian mascarpone and our house-blend espresso. The perfect balance of flavors that took me years to perfect.'
            },
            {
                'dessert': {
                    'name': 'Belgian Chocolate Truffle Cake',
                    'slug': 'belgian-chocolate-truffle-cake',
                    'description': 'Decadent layers of Belgian chocolate with hand-rolled truffle centers',
                    'price': Decimal('680.00'),
                    'category': 'cakes',
                    'image': '/src/assets/images/categories/cakes/Belgian-Chocolate.jpg',
                    'rating': Decimal('4.9'),
                    'reviews_count': 203,
                    'featured': True,
                },
                'reason': 'Using genuine Belgian Callebaut chocolate, this cake represents the pinnacle of chocolate craftsmanship.'
            },
            {
                'dessert': {
                    'name': 'Artisan French Macarons',
                    'slug': 'artisan-french-macarons',
                    'description': 'Hand-piped macarons with delicate shells and premium fillings in seasonal flavors',
                    'price': Decimal('750.00'),
                    'category': 'cookies',
                    'image': '/src/assets/images/categories/cookies/Nutella.jpg',
                    'rating': Decimal('4.8'),
                    'reviews_count': 178,
                    'featured': True,
                },
                'reason': 'Each macaron is hand-piped using traditional French techniques. The shells achieve that perfect texture that melts on your tongue.'
            }
        ]

        # Best Sellers (Popular items)
        best_sellers = [
            {
                'name': 'Classic Chocolate Fudge Brownies',
                'slug': 'classic-chocolate-fudge-brownies',
                'description': 'Our most popular brownies with rich chocolate and perfect fudgy texture',
                'price': Decimal('350.00'),
                'category': 'brownies',
                'image': '/src/assets/images/categories/brownies/Chocolate-chunk-brownie.jpg',
                'rating': Decimal('4.8'),
                'reviews_count': 340,
                'best_seller': True,
                'featured': True,
            },
            {
                'name': 'Red Velvet Dream Cake',
                'slug': 'red-velvet-dream-cake',
                'description': 'Moist red velvet layers with cream cheese frosting - a customer favorite for years',
                'price': Decimal('480.00'),
                'category': 'cakes',
                'image': '/src/assets/images/categories/cakes/Red-Velvet.jpg',
                'rating': Decimal('4.7'),
                'reviews_count': 287,
                'best_seller': True,
                'featured': True,
            },
            {
                'name': 'Nutella Paradise Cupcakes',
                'slug': 'nutella-paradise-cupcakes',
                'description': 'Rich chocolate cupcakes filled and topped with premium Nutella',
                'price': Decimal('320.00'),
                'category': 'cupcakes',
                'image': '/src/assets/images/categories/cupcakes/Red-Velvet-Cupcake.jpg',
                'rating': Decimal('4.9'),
                'reviews_count': 412,
                'best_seller': True,
                'featured': True,
            },
            {
                'name': 'Galaxy Sundae Supreme',
                'slug': 'galaxy-sundae-supreme',
                'description': 'Our signature sundae with multiple ice cream flavors and magical galaxy decorations',
                'price': Decimal('420.00'),
                'category': 'sundae',
                'image': '/src/assets/images/categories/sundae/galaxy-sundae-1.jpg',
                'rating': Decimal('4.8'),
                'reviews_count': 198,
                'best_seller': True,
                'featured': True,
            }
        ]

        # Clear existing featured items
        DessertItem.objects.filter(featured=True).delete()
        ChefRecommendation.objects.all().delete()

        # Create or get categories
        categories_map = {}
        category_names = ['cakes', 'brownies', 'cupcakes', 'desserts', 'cookies', 'sundae']
        
        for cat_name in category_names:
            category, created = Category.objects.get_or_create(
                slug=cat_name,
                defaults={
                    'name': cat_name.replace('-', ' ').title(),
                    'description': f'Delicious {cat_name.replace("-", " ")} made fresh daily'
                }
            )
            categories_map[cat_name] = category

        # Create seasonal desserts
        seasonal_count = 0
        for dessert_data in seasonal_desserts:
            category = categories_map.get(dessert_data['category'])
            if category:
                dessert, created = DessertItem.objects.get_or_create(
                    slug=dessert_data['slug'],
                    defaults={
                        **dessert_data,
                        'category': category,
                        'preparation_time': random.randint(15, 45),
                        'dietary_info': ['vegetarian'],
                        'ingredients': ['flour', 'sugar', 'eggs', 'butter'],
                        'allergens': ['eggs', 'dairy', 'gluten'],
                        'available': True,
                    }
                )
                if created:
                    seasonal_count += 1
                    self.stdout.write(f'Created seasonal dessert: {dessert.name}')

        # Create chef's picks and recommendations
        chef_count = 0
        for item_data in chef_picks_data:
            dessert_data = item_data['dessert']
            category = categories_map.get(dessert_data['category'])
            if category:
                dessert, created = DessertItem.objects.get_or_create(
                    slug=dessert_data['slug'],
                    defaults={
                        **dessert_data,
                        'category': category,
                        'preparation_time': random.randint(20, 60),
                        'dietary_info': ['vegetarian'],
                        'ingredients': ['premium ingredients'],
                        'allergens': ['eggs', 'dairy', 'gluten'],
                        'available': True,
                    }
                )
                
                # Create chef recommendation
                chef_rec, rec_created = ChefRecommendation.objects.get_or_create(
                    dessert_item=dessert,
                    defaults={'reason': item_data['reason']}
                )
                
                if created:
                    chef_count += 1
                    self.stdout.write(f'Created chef pick: {dessert.name}')

        # Create best sellers
        bestseller_count = 0
        for dessert_data in best_sellers:
            category = categories_map.get(dessert_data['category'])
            if category:
                dessert, created = DessertItem.objects.get_or_create(
                    slug=dessert_data['slug'],
                    defaults={
                        **dessert_data,
                        'category': category,
                        'preparation_time': random.randint(15, 30),
                        'dietary_info': ['vegetarian'],
                        'ingredients': ['flour', 'sugar', 'eggs', 'butter'],
                        'allergens': ['eggs', 'dairy', 'gluten'],
                        'available': True,
                    }
                )
                if created:
                    bestseller_count += 1
                    self.stdout.write(f'Created best seller: {dessert.name}')

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully populated featured desserts!\n'
                f'- Seasonal: {seasonal_count} items\n'
                f'- Chef Picks: {chef_count} items\n'
                f'- Best Sellers: {bestseller_count} items'
            )
        )