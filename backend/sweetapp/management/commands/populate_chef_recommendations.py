from django.core.management.base import BaseCommand
from sweetapp.models import DessertItem, ChefRecommendation
import random


class Command(BaseCommand):
    help = 'Populate database with chef recommendations'

    def handle(self, *args, **options):
        self.stdout.write('Creating chef recommendations...')
        
        # Clear existing chef recommendations
        ChefRecommendation.objects.all().delete()
        
        # Get some featured or popular desserts
        desserts = DessertItem.objects.filter(available=True)
        
        if not desserts.exists():
            self.stdout.write(self.style.ERROR('No desserts found. Please populate desserts first.'))
            return
        
        # Select some desserts for chef recommendations
        featured_desserts = desserts.filter(featured=True)[:4]
        if featured_desserts.count() < 4:
            # If not enough featured desserts, get any desserts
            selected_desserts = desserts.order_by('?')[:4]  # Random selection
        else:
            selected_desserts = featured_desserts
        
        # Chef recommendation reasons
        reasons = [
            "Our head pastry chef's personal favorite - the perfect balance of flavors and textures makes this absolutely irresistible.",
            "This signature creation showcases our finest ingredients and traditional techniques, resulting in pure perfection.",
            "A masterpiece that combines innovation with classic techniques - every bite tells a story of culinary excellence.",
            "Made with premium imported ingredients and our secret family recipe, this dessert represents the best of our craft.",
            "The delicate preparation and attention to detail in this dessert makes it a true work of art.",
            "Using traditional methods passed down through generations, this dessert embodies authentic flavors.",
            "The perfect harmony of taste and presentation - this dessert never fails to impress our most discerning customers.",
            "Crafted with seasonal ingredients at their peak, this dessert captures the essence of fine pastry making."
        ]
        
        created_count = 0
        for dessert in selected_desserts:
            reason = random.choice(reasons)
            
            chef_rec, created = ChefRecommendation.objects.get_or_create(
                dessert_item=dessert,
                defaults={
                    'reason': reason,
                    'active': True
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(f'✅ Created chef recommendation: {dessert.name}')
            else:
                self.stdout.write(f'⚠️  Chef recommendation already exists: {dessert.name}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} chef recommendations!')
        )