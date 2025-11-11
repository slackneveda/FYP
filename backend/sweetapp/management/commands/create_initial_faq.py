from django.core.management.base import BaseCommand
from sweetapp.models import FAQPage, FAQCategory, FAQItem


class Command(BaseCommand):
    help = 'Create initial FAQ data for the dessert shop'

    def handle(self, *args, **options):
        # Create FAQ Page
        faq_page, created = FAQPage.objects.get_or_create(
            defaults={
                'title': 'Frequently Asked Questions',
                'subtitle': 'Find answers to commonly asked questions about our desserts, ordering, and services.',
                'hero_background_color': 'from-orange-50 to-pink-50'
            }
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS('Successfully created FAQ page')
            )
        else:
            self.stdout.write(
                self.style.WARNING('FAQ page already exists')
            )

        # Create FAQ Categories with Questions
        categories_data = [
            {
                'name': 'Ordering & Payment',
                'description': 'Questions about placing orders and payment methods',
                'icon': 'CreditCard',
                'color': 'orange',
                'order': 1,
                'faqs': [
                    {
                        'question': 'How far in advance should I place a custom cake order?',
                        'answer': 'For custom cakes, we recommend placing your order at least 3-5 days in advance. For wedding cakes or large events, please contact us 2-3 weeks ahead to ensure availability and proper planning. Rush orders may be accommodated with an additional fee, subject to availability.',
                        'order': 1
                    },
                    {
                        'question': 'What payment methods do you accept?',
                        'answer': 'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and online payments through our secure checkout system. For large catering orders, we also accept bank transfers.',
                        'order': 2
                    },
                    {
                        'question': 'Can I modify or cancel my order?',
                        'answer': 'Orders can be modified or cancelled up to 2 hours before the scheduled pickup/delivery time. For custom cakes, changes must be made at least 24 hours in advance. Please contact us as soon as possible if you need to make changes.',
                        'order': 3
                    }
                ]
            },
            {
                'name': 'Delivery & Pickup',
                'description': 'Information about delivery options and pickup times',
                'icon': 'Truck',
                'color': 'blue',
                'order': 2,
                'faqs': [
                    {
                        'question': 'What are your delivery options and fees?',
                        'answer': 'We offer delivery within a 15-mile radius for orders over ₨250. Delivery fees range from ₨40 to ₨80 depending on distance. For large catering orders, we provide special delivery services with setup options.',
                        'order': 1
                    },
                    {
                        'question': 'Do you offer contactless delivery?',
                        'answer': 'Yes, we offer contactless delivery options. Simply specify your preference when placing your order, and our delivery team will leave your desserts at your specified location with photo confirmation.',
                        'order': 2
                    },
                    {
                        'question': 'What are your pickup hours?',
                        'answer': 'Pickup is available during our regular business hours: Monday-Thursday 7AM-9PM, Friday-Sunday 7AM-10PM. We also offer early pickup (6AM-7AM) and late pickup (after 9PM) by special arrangement.',
                        'order': 3
                    }
                ]
            },
            {
                'name': 'Dietary Requirements',
                'description': 'Questions about allergies and special dietary needs',
                'icon': 'Heart',
                'color': 'green',
                'order': 3,
                'faqs': [
                    {
                        'question': 'Do you accommodate dietary restrictions and allergies?',
                        'answer': 'Absolutely! We offer various options including gluten-free, dairy-free, vegan, and sugar-free desserts. Please inform us of any allergies when placing your order, and we\'ll ensure your desserts are prepared safely.',
                        'order': 1
                    },
                    {
                        'question': 'Are your gluten-free options certified?',
                        'answer': 'Yes, our gluten-free desserts are prepared in a dedicated gluten-free facility and are certified by relevant food safety authorities. We use certified gluten-free ingredients and follow strict protocols.',
                        'order': 2
                    },
                    {
                        'question': 'Can you make sugar-free desserts that still taste great?',
                        'answer': 'Definitely! We use premium sugar alternatives like erythritol, stevia, and monk fruit to create delicious sugar-free options. Our pastry chefs have perfected recipes that maintain traditional taste and texture.',
                        'order': 3
                    }
                ]
            },
            {
                'name': 'Custom Cakes & Events',
                'description': 'Information about custom orders and catering',
                'icon': 'Cake',
                'color': 'pink',
                'order': 4,
                'faqs': [
                    {
                        'question': 'Do you provide cake tastings for custom orders?',
                        'answer': 'Yes! We offer complimentary cake tastings for wedding cakes and large custom orders (minimum ₨1500). Tastings are available by appointment and include up to 4 flavor combinations.',
                        'order': 1
                    },
                    {
                        'question': 'Do you offer catering for events?',
                        'answer': 'Absolutely! We provide full catering services for events of all sizes. Our catering menu includes dessert tables, individual portions, and custom displays. Contact us to discuss your event needs.',
                        'order': 2
                    },
                    {
                        'question': 'What\'s the minimum order for catering?',
                        'answer': 'Our minimum catering order is ₨1000 or 25 servings, whichever is greater. For larger events (100+ guests), we offer volume discounts and additional services like dessert stations.',
                        'order': 3
                    }
                ]
            },
            {
                'name': 'Quality & Storage',
                'description': 'Questions about product quality and storage instructions',
                'icon': 'Package',
                'color': 'purple',
                'order': 5,
                'faqs': [
                    {
                        'question': 'How should I store my desserts?',
                        'answer': 'Most of our desserts should be refrigerated and consumed within 2-3 days for best quality. Specific storage instructions are provided with each order. Room temperature items like cookies can be stored in airtight containers.',
                        'order': 1
                    },
                    {
                        'question': 'Do your desserts freeze well?',
                        'answer': 'Many of our desserts freeze beautifully! Cakes, cupcakes, and most pastries can be frozen for up to 3 months when properly wrapped. We provide detailed freezing and thawing instructions with each order.',
                        'order': 2
                    },
                    {
                        'question': 'What if I\'m not satisfied with my order?',
                        'answer': 'Your satisfaction is our priority! If you\'re not completely happy with your order, please contact us within 24 hours. We\'ll work with you to make it right, whether that means a replacement, refund, or store credit.',
                        'order': 3
                    }
                ]
            }
        ]

        # Create categories and FAQ items
        for category_data in categories_data:
            faqs_data = category_data.pop('faqs')
            
            category, created = FAQCategory.objects.get_or_create(
                faq_page=faq_page,
                name=category_data['name'],
                defaults=category_data
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully created category: {category.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Category already exists: {category.name}')
                )

            # Create FAQ items for this category
            for faq_data in faqs_data:
                faq_item, created = FAQItem.objects.get_or_create(
                    category=category,
                    question=faq_data['question'],
                    defaults={
                        'answer': faq_data['answer'],
                        'order': faq_data['order'],
                        'is_active': True
                    }
                )
                
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(f'  - Created FAQ: {faq_item.question[:50]}...')
                    )

        self.stdout.write(
            self.style.SUCCESS('Initial FAQ data creation completed!')
        )