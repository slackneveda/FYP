from django.core.management.base import BaseCommand
from sweetapp.models import CustomerTestimonial
from decimal import Decimal


class Command(BaseCommand):
    help = 'Populate database with customer testimonials'

    def handle(self, *args, **options):
        self.stdout.write('Creating customer testimonials...')
        
        # Clear existing testimonials
        CustomerTestimonial.objects.all().delete()
        
        testimonials_data = [
            {
                'name': 'Sarah Ahmed',
                'rating': 5,
                'text': 'Absolutely amazing desserts! The chocolate cake was divine and the presentation was beautiful. Will definitely order again!',
                'approved': True
            },
            {
                'name': 'Ali Hassan',
                'rating': 5,
                'text': 'Best desserts in the city! The quality is outstanding and the flavors are incredible. Highly recommend to everyone.',
                'approved': True
            },
            {
                'name': 'Fatima Khan',
                'rating': 4,
                'text': 'Great variety of desserts with authentic Pakistani flavors. The delivery was quick and everything was fresh.',
                'approved': True
            },
            {
                'name': 'Muhammad Usman',
                'rating': 5,
                'text': 'Ordered for my daughter\'s birthday and everyone loved it! The custom cake was exactly what we wanted.',
                'approved': True
            },
            {
                'name': 'Aisha Malik',
                'rating': 5,
                'text': 'The traditional sweets reminded me of my grandmother\'s recipes. Perfect taste and quality!',
                'approved': True
            },
            {
                'name': 'Hassan Ali',
                'rating': 4,
                'text': 'Fast delivery and amazing quality. The red velvet cupcakes were a hit at our office party!',
                'approved': True
            },
            {
                'name': 'Zainab Sheikh',
                'rating': 5,
                'text': 'Love the seasonal specials! Always something new and exciting to try. Customer service is excellent too.',
                'approved': True
            },
            {
                'name': 'Omar Farooq',
                'rating': 5,
                'text': 'Been ordering from here for months and never disappointed. The consistency in quality is remarkable.',
                'approved': True
            }
        ]
        
        created_count = 0
        for testimonial_data in testimonials_data:
            testimonial, created = CustomerTestimonial.objects.get_or_create(
                name=testimonial_data['name'],
                text=testimonial_data['text'],
                defaults={
                    'rating': testimonial_data['rating'],
                    'approved': testimonial_data['approved']
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(f'✅ Created testimonial: {testimonial.name}')
            else:
                self.stdout.write(f'⚠️  Testimonial already exists: {testimonial.name}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} testimonials!')
        )