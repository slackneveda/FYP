from django.core.management.base import BaseCommand
from django.utils.text import slugify
from sweetapp.models import Category, DessertItem
import random
from decimal import Decimal


class Command(BaseCommand):
    help = 'Populate database with Layers.pk style menu using existing images'

    def handle(self, *args, **kwargs):
        # Clear existing data
        self.stdout.write('Clearing existing dessert and category data...')
        DessertItem.objects.all().delete()
        Category.objects.all().delete()

        # Categories configuration matching Layers.pk with your image structure
        categories_config = {
            'cakes': {
                'name': 'Cakes',
                'order': 1,
                'description': 'Delicious handcrafted cakes for every occasion',
                'price_range': (1800, 3500),
                'featured_items': ['Chocolate-Heaven.jpg', 'Red-Velvet.jpg', 'Lotus.jpg'],
                'images': [
                    'All-Chocolate-Dreamcake.jpg', 'Belgian-Chocolate.jpg', 'Chocolate-Dreamcake.jpg',
                    'Chocolate-Heaven.jpg', 'Chocolate-Mousse.jpg', 'Coffee.jpg', 'Dairy-Milk.jpg',
                    'Ferrero-Classic.jpg', 'ferrero-square.jpg', 'German-Fudge.jpg',
                    'Hersheys-Chocolate-Cake.jpg', 'Honey-Cake.jpg', 'kit-kat-sqaure.jpg',
                    'Lotus-Three-Milk-Cake.jpeg', 'Lotus.jpg', 'Malteser.jpg', 'Milky-Malt.jpg',
                    'Nutella.jpg', 'Nuts-Fusion-Cake.jpg', 'Pistachio-Three-Milk-Cake.jpg',
                    'Pistachio.jpg', 'rafaelo.jpg', 'Red-Velvet.jpg', 'Salted-Caramel.jpg',
                    'Three-Milk-Cake.jpg', 'Turkish-Chocolate-Cake.jpeg'
                ]
            },
            'brownies': {
                'name': 'Brownies',
                'order': 2,
                'description': 'Rich and fudgy brownies made with premium ingredients',
                'price_range': (350, 450),
                'featured_items': ['Nutella-Brownie-7.jpg'],
                'images': [
                    'Belgian-Malt-2.jpg', 'Cadbury-brownie-3.jpg', 'Chocolate-chunk-brownie.jpg',
                    'Hersheys-Fudge.jpg', 'Mars-Brownie-6.jpg', 'Nutella-Brownie-7.jpg',
                    'Peanut-butter-8.jpg'
                ]
            },
            'desserts': {
                'name': 'Desserts',
                'order': 3,
                'description': 'Exquisite desserts crafted to perfection',
                'price_range': (400, 650),
                'featured_items': ['Lotus-cheesecake-9.jpg'],
                'images': [
                    'Apple-pie-1.jpg', 'Creme-brulee.jpg', 'Lotus-cheesecake-9.jpg',
                    'Mango-cheese-cake.jpg', 'Mini-Chocolate-Tarts-Feature-1.jpg',
                    'Pistachio-Kunafa.jpg', 'Strawberry-Cheesecake-1.jpg', 'Walnut-Cup-Pie.jpg'
                ]
            },
            'cupcakes': {
                'name': 'Cupcakes',
                'order': 4,
                'description': 'Individual cupcakes bursting with flavor',
                'price_range': (180, 280),
                'featured_items': ['Red-Velvet-Cupcake.jpg', 'Ferrero-Rocher-cupcake.jpg'],
                'images': [
                    'After-8-Mint.jpg', 'Belgian-Malt-Cupcake.jpg', 'Chocolate-Creme-Cheese.jpg',
                    'Chocolate-Hazelnut.jpg', 'Classic-Chocolate.jpg', 'cotton-candy.jpg',
                    'Ferrero-Rocher-cupcake.jpg', 'Keylime.jpg', 'Lite-Coffee-4.jpg',
                    'Lotus-biscoff-5.jpg', 'Milk-Chocolate.jpg', 'MM.jpg', 'Nuttla2.jpg',
                    'Oreo-Cookie.jpg', 'Original-Malt.jpg', 'Raffaello.jpg',
                    'Red-Velvet-Cupcake.jpg', 'Salted-Caramel-Cupcake.jpg',
                    'strawberry-cupcake.jpg', 'Swiss-dark-chocolate-9.jpg'
                ]
            },
            'cookies': {
                'name': 'Cookies',
                'order': 6,
                'description': 'Crispy and chewy cookies made with love',
                'price_range': (100, 180),
                'featured_items': ['Nutella.jpg'],
                'images': [
                    'Chunky-blend.jpg', 'Lotus2.jpg', 'Milk-Chocolate.jpg',
                    'Nutella-Filled2.jpg', 'Nutella.jpg', 'Red-Velvet2.jpg',
                    'Triple-chocolate2.jpg', 'White-Chocolate.jpg'
                ]
            },
            'mini-donuts': {
                'name': 'Mini Donuts',
                'order': 7,
                'description': 'Bite-sized donuts perfect for sharing',
                'price_range': (280, 380),
                'featured_items': ['Nutella-5.jpg'],
                'images': [
                    'Boston-Cream-3.jpg', 'Chocolate-Three-Milk.jpg', 'Cotton-Candy-9.jpg',
                    'Ferrero-Rocher-6.jpg', 'Kitkat-8.jpg', 'Lotus-2.jpg',
                    'Malt-Chocolate-7.jpg', 'Nutella-5.jpg', 'Orange-Creamsicle.jpg',
                    'Oreo-1-500x632.jpg', 'Peanut-Butter.jpg', 'Pistachio-Kunafa.jpg',
                    'Plain-Glaze-4.jpg', 'Red-Velvet.jpg'
                ]
            },
            'sundae': {
                'name': 'Sundae',
                'order': 5,
                'description': 'Ice cream sundaes topped with delicious toppings',
                'price_range': (380, 550),
                'featured_items': ['galaxy-sundae-1.jpg', 'nutella-sundae-1.jpg'],
                'images': [
                    'galaxy-sundae-1.jpg', 'Hazelnut-Parfait.jpg', 'lotus-sundae-1.jpg',
                    'Lotus-three-milk.jpg', 'nutella-sundae-1.jpg', 'Pistachio.jpg',
                    'red-valvet-sundae-1.jpg', 'salted-caramel-sundae-1.jpg', 'three-milk-sundae-1.jpg'
                ]
            }
        }

        # Process each category
        for folder_name, config in categories_config.items():
            # Create category
            category = Category.objects.create(
                name=config['name'],
                slug=folder_name,
                description=config['description'],
                order=config['order'],
                image=f'/src/assets/images/categories/{folder_name}/{config["images"][0] if config["images"] else "placeholder.jpg"}',
                product_count=len(config['images'])
            )
            
            self.stdout.write(f"Created category: {category.name}")
            
            # Create products for each image
            for i, image_name in enumerate(config['images']):
                # Generate product name from image filename
                product_name = self.generate_product_name(image_name)
                
                # Generate price within range
                min_price, max_price = config['price_range']
                price = Decimal(str(random.randint(min_price, max_price)))
                
                # Check if featured
                is_featured = image_name in config['featured_items']
                
                # Generate description
                description = self.generate_description(product_name, category.name)
                
                # Create product with unique slug
                unique_slug = self.generate_unique_slug(product_name)
                DessertItem.objects.create(
                    name=product_name,
                    slug=unique_slug,
                    category=category,
                    description=description,
                    price=price,
                    image=f'/src/assets/images/categories/{folder_name}/{image_name}',
                    featured=is_featured,
                    available=True,
                    rating=Decimal(str(round(random.uniform(4.0, 5.0), 1))),
                    reviews_count=random.randint(5, 50),
                    preparation_time=random.randint(15, 45),
                    best_seller=random.choice([True, False]) if is_featured else False,
                    seasonal=random.choice([True, False]),
                    dietary_info=self.get_random_dietary_info(),
                    ingredients=self.get_random_ingredients(category.name.lower()),
                    allergens=self.get_random_allergens()
                )
            
            self.stdout.write(f"Created {len(config['images'])} products for {category.name}")
        
        self.stdout.write(self.style.SUCCESS('Successfully populated Layers menu data!'))
        self.stdout.write(f"Created {Category.objects.count()} categories")
        self.stdout.write(f"Created {DessertItem.objects.count()} dessert items")
        self.stdout.write(f"Featured items: {DessertItem.objects.filter(featured=True).count()}")

    def generate_unique_slug(self, product_name):
        """Generate a unique slug for the product"""
        from django.utils.text import slugify
        base_slug = slugify(product_name)
        slug = base_slug
        counter = 1
        
        # Check if slug exists and add counter if needed
        while DessertItem.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        return slug

    def generate_product_name(self, image_name):
        """Generate a clean product name from image filename"""
        # Remove file extension and replace hyphens/underscores with spaces
        name = image_name.replace('.jpg', '').replace('.jpeg', '').replace('-', ' ').replace('_', ' ')
        
        # Remove numbers and clean up
        import re
        name = re.sub(r'\d+', '', name).strip()
        
        # Title case
        name = name.title()
        
        # Handle specific cases
        name_mappings = {
            'Mm': 'M&M',
            'Kit Kat': 'Kit-Kat',
            'After  Mint': 'After-8 Mint',
            'Ferrero Rocher': 'Ferrero Rocher',
            'Three Milk': 'Three Milk'
        }
        
        for old, new in name_mappings.items():
            name = name.replace(old, new)
        
        # Clean up double spaces
        name = ' '.join(name.split())
        
        return name if name else 'Delicious Treat'

    def generate_description(self, product_name, category):
        """Generate description for products"""
        descriptions = {
            'cakes': [
                f"A rich and moist {product_name.lower()} made with premium ingredients and love.",
                f"Indulgent {product_name.lower()} perfect for celebrations and special occasions.",
                f"Freshly baked {product_name.lower()} with layers of flavor that melt in your mouth."
            ],
            'brownies': [
                f"Fudgy and decadent {product_name.lower()} with a perfect chewy texture.",
                f"Rich chocolate {product_name.lower()} topped with premium ingredients.",
                f"Irresistible {product_name.lower()} that's the perfect balance of sweet and satisfying."
            ],
            'desserts': [
                f"Elegant {product_name.lower()} crafted with traditional techniques and modern flair.",
                f"Sophisticated {product_name.lower()} that's a perfect end to any meal.",
                f"Exquisite {product_name.lower()} made with the finest ingredients."
            ],
            'cupcakes': [
                f"Individual {product_name.lower()} topped with creamy frosting and delightful decorations.",
                f"Perfectly portioned {product_name.lower()} bursting with flavor in every bite.",
                f"Adorable {product_name.lower()} that's as beautiful as it is delicious."
            ],
            'cookies': [
                f"Crispy and chewy {product_name.lower()} baked to golden perfection.",
                f"Classic {product_name.lower()} with a perfect texture and amazing taste.",
                f"Homestyle {product_name.lower()} that brings back childhood memories."
            ],
            'mini donuts': [
                f"Bite-sized {product_name.lower()} that are perfect for sharing or enjoying alone.",
                f"Fluffy and sweet {product_name.lower()} with delightful toppings.",
                f"Miniature {product_name.lower()} packed with big flavors."
            ],
            'sundae': [
                f"Refreshing {product_name.lower()} with premium ice cream and delicious toppings.",
                f"Cool and creamy {product_name.lower()} perfect for any time of day.",
                f"Indulgent {product_name.lower()} that's a treat for all your senses."
            ]
        }
        
        category_key = category.lower()
        if category_key in descriptions:
            return random.choice(descriptions[category_key])
        
        return f"Delicious {product_name.lower()} made with care and premium ingredients."

    def get_random_dietary_info(self):
        """Get random dietary information"""
        # Return empty list to remove all dietary tags
        return []

    def get_random_ingredients(self, category):
        """Get random ingredients based on category"""
        base_ingredients = {
            'cakes': ['flour', 'eggs', 'butter', 'sugar', 'vanilla', 'baking powder'],
            'brownies': ['chocolate', 'flour', 'eggs', 'butter', 'cocoa powder'],
            'desserts': ['cream', 'sugar', 'eggs', 'gelatin', 'vanilla'],
            'cupcakes': ['flour', 'eggs', 'butter', 'sugar', 'frosting', 'baking powder'],
            'cookies': ['flour', 'butter', 'sugar', 'eggs', 'baking soda'],
            'mini donuts': ['flour', 'sugar', 'oil', 'yeast', 'milk'],
            'sundae': ['ice cream', 'chocolate sauce', 'nuts', 'cherries', 'whipped cream']
        }
        
        ingredients = base_ingredients.get(category, ['flour', 'sugar', 'butter'])
        
        # Add some random premium ingredients
        premium = ['premium chocolate', 'vanilla extract', 'fresh cream', 'organic honey', 'imported nuts']
        ingredients.extend(random.sample(premium, random.randint(0, 2)))
        
        return ingredients[:6]  # Limit to 6 ingredients

    def get_random_allergens(self):
        """Get random allergen information"""
        allergens = ['eggs', 'milk', 'wheat', 'nuts', 'soy']
        return random.sample(allergens, random.randint(1, 3))