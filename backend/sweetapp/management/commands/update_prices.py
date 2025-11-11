# cspell:disable
from django.core.management.base import BaseCommand
from sweetapp.models import DessertItem
from decimal import Decimal

class Command(BaseCommand):
    help = 'Update all dessert prices to clean round numbers'

    def handle(self, *args, **options):
        # Define clean pricing structure
        price_updates = {
            # Cakes (Premium items) - 1000-3000 range
            'Belgian Chocolate Truffle Cake': 1599,
            'Red Velvet Dream Cake': 1299,
            'Chocolate Dreamcake': 1999,
            'All Chocolate Dreamcake': 2999,
            'Belgian Chocolate': 2899,
            'Turkish Chocolate Cake': 2399,
            'Hersheys Chocolate Cake': 1999,
            'Three Milk Cake': 2399,
            'Lotus Three Milk Cake': 3199,
            'Pistachio Three Milk Cake': 2399,
            'Honey Cake': 2799,
            'German Fudge': 1999,
            'Nuts Fusion Cake': 2199,
            'Nutella': 1999,
            'Milky Malt': 1899,
            
            # Individual Desserts (Medium range) - 400-1500
            'Chef Maria\'s Signature Tiramisu': 1299,
            'Galaxy Sundae Supreme': 899,
            'Pumpkin Spice Lava Cake': 1199,
            'Strawberry Cheesecake': 999,
            'Mango Cheese Cake': 899,
            'Creme Brulee': 799,
            'Pistachio Kunafa': 1299,
            'Coffee': 2399,
            'Dairy Milk': 2499,
            'Ferrero Classic': 2999,
            'Ferrero Square': 3099,
            'Kit-Kat Sqaure': 2399,
            'Malteser': 2599,
            'Pistachio': 2899,
            'Rafaelo': 3099,
            'Salted Caramel': 2299,
            
            # Artisan Items (Higher end) - 700-1500
            'Artisan French Macarons': 1499,
            'Mini Chocolate Tarts Feature': 899,
            'Walnut Cup Pie': 699,
            'Hazelnut Parfait': 799,
            'Three Milk Sundae': 899,
            'Red Valvet Sundae': 799,
            'Salted Caramel Sundae': 799,
            'Lotus Sundae': 699,
            'Lotus Three Milk': 899,
            
            # Cupcakes - 250-400 range
            'Nutella Paradise Cupcakes': 349,
            'Cinnamon Apple Cupcakes': 299,
            'Belgian Malt Cupcake': 249,
            'Salted Caramel Cupcake': 299,
            'Strawberry Cupcake': 249,
            
            # Brownies - 300-500 range
            'Classic Chocolate Fudge Brownies': 399,
            'Maple Pecan Brownies': 349,
            'Cadbury Brownie': 399,
            'Chocolate Chunk Brownie': 449,
            'Mars Brownie': 399,
            'Hersheys Fudge': 399,
            
            # Small Items & Cookies - 150-400 range
            'M&M': 249,
            'Oreo Cookie': 199,
            'Chunky Blend': 179,
            'Classic Chocolate': 249,
            'Cotton Candy': 249,
            'Keylime': 249,
            'Lite Coffee': 229,
            'Lotus': 199,
            'Lotus Biscoff': 249,
            'Nutella Filled': 159,
            'Nuttla': 229,
            'Orange Creamsicle': 349,
            'Oreo X': 329,
            'Original Malt': 279,
            'Plain Glaze': 379,
            'Raffaello': 279,
            'Red Velvet': 349,
            'Swiss Dark Chocolate': 269,
            'Triple Chocolate': 169,
            'White Chocolate': 189,
            
            # Specialty Items - 350-600 range
            'After-8 Mint': 199,
            'Apple Pie': 599,
            'Belgian Malt': 399,
            'Boston Cream': 359,
            'Chocolate Creme Cheese': 229,
            'Chocolate Hazelnut': 229,
            'Chocolate Mousse': 2399,
            'Chocolate Three Milk': 359,
            'Ferrero Rocher': 379,
            'Kitkat': 359,
            'Malt Chocolate': 379,
            'Milk Chocolate': 279,
            'Peanut Butter': 399,
            'Pistachio': 429,
            'Pistachio Kunafa': 359,
        }
        
        updated_count = 0
        
        for item_name, new_price in price_updates.items():
            try:
                item = DessertItem.objects.get(name=item_name)
                old_price = item.price
                item.price = Decimal(str(new_price))
                item.save()
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Updated "{item_name}": RS {old_price} → RS {new_price}'
                    )
                )
                updated_count += 1
                
            except DessertItem.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f'Item not found: "{item_name}"')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error updating "{item_name}": {e}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'\nSuccessfully updated {updated_count} items with clean pricing!')
        )