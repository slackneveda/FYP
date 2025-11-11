from django.core.management.base import BaseCommand
from sweetapp.models import Category


class Command(BaseCommand):
    help = 'Fix Mini Donuts category image'

    def handle(self, *args, **options):
        try:
            # Get Mini Donuts category
            mini_donuts = Category.objects.get(slug='mini-donuts')
            
            # Set the image path
            mini_donuts.image = '/src/assets/images/categories/mini-donuts/Nutella-5.jpg'
            mini_donuts.save()
            
            self.stdout.write(
                self.style.SUCCESS(f'✅ Successfully updated Mini Donuts category image to: {mini_donuts.image}')
            )
            
        except Category.DoesNotExist:
            self.stdout.write(
                self.style.ERROR('❌ Mini Donuts category not found!')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error updating category: {str(e)}')
            )
