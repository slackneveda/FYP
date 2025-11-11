from django.core.management.base import BaseCommand
from sweetapp.models import DessertItem, Category
import random

class Command(BaseCommand):
    help = 'Update all products with detailed 2-3 line descriptions'

    def handle(self, *args, **options):
        # Comprehensive description templates for different dessert categories
        description_templates = {
            'Cakes': [
                "A moist and fluffy cake that melts in your mouth with every bite. Crafted with premium ingredients and traditional baking techniques for the perfect texture. Perfect for celebrations, special occasions, or when you simply want to indulge in something extraordinary.",
                "Rich, decadent layers of cake that create a symphony of flavors in every slice. Made with the finest cocoa, fresh cream, and carefully selected ingredients. This cake represents the perfect balance of sweetness and sophistication.",
                "An elegant cake that combines classic flavors with modern presentation techniques. Each layer is carefully crafted to ensure optimal moisture and flavor distribution. Ideal for those who appreciate the artistry of fine baking.",
                "A traditional cake recipe passed down through generations, perfected with contemporary techniques. Features a tender crumb structure and rich, satisfying flavor profile. This cake brings together nostalgia and culinary excellence in every serving.",
                "Luxurious cake creation that showcases the perfect harmony of texture and taste. Made with premium butter, fresh eggs, and high-quality flour for exceptional results. A true masterpiece that elevates any dining experience."
            ],
            'Brownies': [
                "Dense, fudgy brownies with a rich chocolate flavor that satisfies even the most discerning chocolate lovers. Made with premium cocoa and real chocolate chunks for an intense taste experience. These brownies offer the perfect balance of chewy texture and decadent flavor.",
                "Gooey, indulgent brownies that deliver pure chocolate bliss in every bite. Crafted with Belgian chocolate and traditional baking methods for authentic taste. The perfect treat for chocolate enthusiasts seeking that ultimate brownie experience.",
                "Classic brownies with a modern twist, featuring layers of chocolate richness throughout. Made with high-quality ingredients and baked to perfection for optimal texture. These brownies represent the epitome of chocolate dessert craftsmanship.",
                "Artisanal brownies that combine traditional recipes with premium ingredients for exceptional results. Each batch is carefully monitored to achieve the perfect fudgy consistency. A chocolate lover's dream come true in brownie form.",
                "Decadent brownies that showcase the pure essence of chocolate in its finest form. Made with sustainably sourced cocoa and artisanal techniques for superior quality. These brownies deliver an unforgettable chocolate experience."
            ],
            'Desserts': [
                "An exquisite dessert that combines multiple flavors and textures for a truly memorable experience. Carefully crafted using traditional techniques and premium ingredients for exceptional quality. This dessert represents the perfect finale to any meal.",
                "A sophisticated dessert creation that showcases culinary artistry and attention to detail. Features harmonious flavor combinations that dance on your palate with each spoonful. Perfect for those who appreciate fine dessert craftsmanship.",
                "Elegant dessert that brings together classic techniques with contemporary presentation styles. Made with seasonal ingredients and time-honored recipes for authentic taste. This creation embodies the essence of fine dessert making.",
                "Luxurious dessert experience that delivers both visual appeal and exceptional taste. Crafted with precision and passion using only the finest available ingredients. A true celebration of dessert artistry and culinary excellence.",
                "Traditional dessert with a modern interpretation, featuring layers of complementary flavors. Made with careful attention to texture, temperature, and presentation for optimal enjoyment. This dessert creates lasting memories with every serving."
            ],
            'Cupcakes': [
                "Perfectly portioned cupcakes that deliver big flavors in a delightfully compact form. Each cupcake is topped with signature frosting and finished with artisanal decorations. These treats combine convenience with gourmet quality for the ultimate cupcake experience.",
                "Moist, tender cupcakes that burst with flavor from the first bite to the last crumb. Made with premium ingredients and topped with creamy, house-made frosting. These cupcakes prove that great things truly do come in small packages.",
                "Artisanal cupcakes that showcase creative flavor combinations and beautiful presentation techniques. Each one is individually crafted with attention to detail and quality. Perfect for parties, gifts, or personal indulgence moments.",
                "Gourmet cupcakes that elevate the classic treat to new heights of deliciousness. Features unique flavor profiles and decorative elements that make each one special. These cupcakes are miniature works of edible art.",
                "Handcrafted cupcakes that combine traditional baking methods with innovative flavor inspirations. Made fresh daily with premium ingredients and creative toppings. Each cupcake offers a perfect balance of cake, frosting, and pure joy."
            ],
            'Sundae': [
                "A classic sundae experience that brings together premium ice cream with delectable toppings. Features multiple scoops of creamy goodness complemented by sauces, nuts, and cherries. This sundae delivers pure nostalgic joy in every spoonful.",
                "Elaborate sundae creation that combines various textures and flavors for maximum enjoyment. Made with artisanal ice cream and topped with house-made sauces and premium garnishes. A perfect treat for sharing or solo indulgence.",
                "Traditional sundae that celebrates the art of ice cream presentation and flavor combination. Features carefully selected toppings that complement the base ice cream perfectly. This sundae creates a symphony of taste and texture sensations.",
                "Gourmet sundae that elevates the classic dessert with premium ingredients and creative presentation. Each component is carefully chosen to enhance the overall taste experience. Perfect for those who appreciate elevated ice cream creations.",
                "Decadent sundae that offers multiple layers of flavor and textural contrast in every serving. Made with the finest ice cream and topped with artisanal accompaniments. This sundae represents the pinnacle of frozen dessert artistry."
            ],
            'Cookies': [
                "Perfectly baked cookies that deliver the ideal combination of crispy edges and chewy centers. Made with premium ingredients and traditional techniques for authentic homemade taste. These cookies bring comfort and satisfaction with every bite.",
                "Artisanal cookies that showcase classic flavors with modern baking precision and quality standards. Each cookie is individually crafted to ensure consistent texture and flavor distribution. Perfect for any time you crave something sweet and satisfying.",
                "Gourmet cookies that combine time-tested recipes with premium ingredients for exceptional results. Features perfect texture balance and rich, satisfying flavors throughout. These cookies represent the epitome of cookie craftsmanship and quality.",
                "Handcrafted cookies made with love and attention to detail in every batch. Uses only the finest ingredients and traditional baking methods for superior taste. Each cookie delivers a moment of pure, simple pleasure.",
                "Classic cookies with a contemporary approach to ingredients and baking techniques for optimal results. Made fresh daily with premium components and careful quality control. These cookies bring back childhood memories while satisfying adult palates."
            ],
            'Mini Donuts': [
                "Bite-sized donuts that pack maximum flavor into perfectly portioned treats for easy enjoyment. Made with a light, airy texture and finished with signature glazes or toppings. These mini donuts offer the perfect balance of indulgence and portion control.",
                "Delicate mini donuts that showcase the art of miniature baking with full-sized flavors. Each donut is carefully crafted to achieve optimal texture and taste in compact form. Perfect for sharing, parties, or when you want just a taste of sweetness.",
                "Artisanal mini donuts that deliver gourmet quality in conveniently sized portions for any occasion. Features creative flavor combinations and beautiful presentation that makes them irresistible. These treats prove that good things come in small packages.",
                "Premium mini donuts made with traditional techniques scaled down to create perfect bite-sized indulgences. Each one is freshly made and finished with house-made glazes or coatings. Ideal for those who appreciate quality in smaller servings.",
                "Gourmet mini donuts that combine classic donut-making traditions with innovative flavors and presentations. Made with premium ingredients and careful attention to texture and taste. These miniature treats offer maximum enjoyment in every bite."
            ]
        }

        # Get all products
        products = DessertItem.objects.all()
        updated_count = 0

        self.stdout.write(f"Found {products.count()} products to update...")

        for product in products:
            category_name = product.category.name if product.category else 'Desserts'
            
            # Select appropriate descriptions based on category
            if category_name in description_templates:
                descriptions = description_templates[category_name]
            else:
                descriptions = description_templates['Desserts']  # Default to general desserts
            
            # Choose a random description from the appropriate category
            new_description = random.choice(descriptions)
            
            # Update the product description
            product.description = new_description
            product.save()
            
            updated_count += 1
            self.stdout.write(f"Updated: {product.name} ({category_name})")

        self.stdout.write(
            self.style.SUCCESS(f'Successfully updated {updated_count} product descriptions!')
        )