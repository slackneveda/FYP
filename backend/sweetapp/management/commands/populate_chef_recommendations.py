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
        
        # Chef data with names, titles, and recommendations
        chef_recommendations_data = [
            {
                'chef_name': 'Chef Marcus Rivera',
                'chef_title': 'Executive Pastry Chef',
                'recommendation_text': "Our head pastry chef's personal favorite - the perfect balance of flavors and textures makes this absolutely irresistible.",
                'is_featured': True
            },
            {
                'chef_name': 'Chef Sofia Laurent',
                'chef_title': 'Head Chocolatier',
                'recommendation_text': "This signature creation showcases our finest ingredients and traditional techniques, resulting in pure perfection.",
                'is_featured': True
            },
            {
                'chef_name': 'Chef Amir Hassan',
                'chef_title': 'Senior Pastry Artist',
                'recommendation_text': "A masterpiece that combines innovation with classic techniques - every bite tells a story of culinary excellence.",
                'is_featured': False
            },
            {
                'chef_name': 'Chef Emma Chen',
                'chef_title': 'Dessert Specialist',
                'recommendation_text': "Made with premium imported ingredients and our secret family recipe, this dessert represents the best of our craft.",
                'is_featured': False
            },
        ]
        
        created_count = 0
        for i, dessert in enumerate(selected_desserts):
            chef_data = chef_recommendations_data[i % len(chef_recommendations_data)]
            
            chef_rec, created = ChefRecommendation.objects.get_or_create(
                dessert_item=dessert,
                defaults={
                    'chef_name': chef_data['chef_name'],
                    'chef_title': chef_data['chef_title'],
                    'recommendation_text': chef_data['recommendation_text'],
                    'is_featured': chef_data['is_featured'],
                    'active': True
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(f'✅ Created chef recommendation: {chef_data["chef_name"]} recommends {dessert.name}')
            else:
                self.stdout.write(f'⚠️  Chef recommendation already exists: {dessert.name}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} chef recommendations!')
        )