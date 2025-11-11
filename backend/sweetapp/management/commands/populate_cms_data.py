from django.core.management.base import BaseCommand
from sweetapp.models import (
    AboutUsPage, AboutUsValue, AboutUsTeamMember,
    OurStoryPage, StoryTimeline, StoryImpact
)


class Command(BaseCommand):
    help = 'Populate CMS data with default content from current pages'

    def handle(self, *args, **options):
        self.stdout.write('Creating About Us page data...')
        
        # Create About Us Page
        about_page, created = AboutUsPage.objects.get_or_create(
            is_active=True,
            defaults={
                'hero_title': 'About Sweet Dessert',
                'hero_subtitle': 'We create exquisite desserts with passion, artistry, and the finest ingredients — each bite a delicious chapter in a story of sweetness and perfection. Welcome to our world of culinary excellence.',
                'hero_badge_text': '🏪 Our Sweet Story',
                'mission_title': 'Our Mission',
                'mission_text': 'To transform life\'s precious moments into unforgettable experiences through exceptional desserts. We believe that every celebration deserves the perfect sweet touch, and every day can be made brighter with a little sweetness. Our commitment is to craft not just desserts, but memories that last a lifetime.',
                'values_title': 'Our Values',
                'values_subtitle': 'The principles that guide everything we do, from ingredient selection to customer service.',
                'store_title': 'Visit Our Store',
                'store_description': 'Step into our warm, inviting space where the aroma of freshly baked goods fills the air. Watch our pastry chefs at work through our open kitchen concept, and experience the magic of dessert creation firsthand.',
                'store_address': '123 Sweet Street, Dessert City, DC 12345',
                'store_hours': 'Mon-Thu: 7AM-9PM | Fri-Sun: 7AM-10PM',
                'cta_title': 'Ready to Experience Sweet Perfection?',
                'cta_subtitle': 'Join thousands of satisfied customers who have made us their go-to destination for life\'s sweetest moments.',
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS('About Us page created'))
        else:
            self.stdout.write('About Us page already exists')

        # Create About Us Values
        values_data = [
            {
                'title': 'Passion for Excellence',
                'description': 'Every dessert is crafted with love, dedication, and an unwavering commitment to perfection.',
                'icon': 'Heart',
                'color_gradient': 'from-red-500/20 to-pink-500/20',
                'order': 1
            },
            {
                'title': 'Quality Ingredients',
                'description': 'We source only the finest, premium ingredients from trusted suppliers around the world.',
                'icon': 'Award',
                'color_gradient': 'from-amber-500/20 to-yellow-500/20',
                'order': 2
            },
            {
                'title': 'Community Focus',
                'description': 'Building lasting relationships with our customers and being an integral part of our community.',
                'icon': 'Users',
                'color_gradient': 'from-blue-500/20 to-indigo-500/20',
                'order': 3
            },
            {
                'title': 'Artisan Craftsmanship',
                'description': 'Our skilled pastry chefs combine traditional techniques with innovative creativity.',
                'icon': 'ChefHat',
                'color_gradient': 'from-emerald-500/20 to-teal-500/20',
                'order': 4
            }
        ]

        for value_data in values_data:
            value, created = AboutUsValue.objects.get_or_create(
                about_page=about_page,
                title=value_data['title'],
                defaults=value_data
            )
            if created:
                self.stdout.write(f'Created value: {value.title}')

        # Create About Us Team Members (using Noor Ahmed instead of Sarah)
        team_data = [
            {
                'name': 'Noor Ahmed',
                'role': 'Head Pastry Chef & Founder',
                'description': 'With 15 years of experience in fine pastry, Noor brings European techniques to every creation.',
                'image_emoji': '👨‍🍳',
                'order': 1
            },
            {
                'name': 'Ahmed Hassan',
                'role': 'Cake Designer',
                'description': 'Specializing in custom wedding cakes and artistic dessert displays with 8 years of expertise.',
                'image_emoji': '👨‍🍳',
                'order': 2
            },
            {
                'name': 'Maria Rodriguez',
                'role': 'Operations Manager',
                'description': 'Ensuring every customer experience is exceptional and every order is perfect.',
                'image_emoji': '👩‍💼',
                'order': 3
            },
            {
                'name': 'David Chen',
                'role': 'Chocolatier',
                'description': 'Master of chocolate artistry, creating handcrafted truffles and chocolate sculptures.',
                'image_emoji': '🍫',
                'order': 4
            }
        ]

        for team_data in team_data:
            member, created = AboutUsTeamMember.objects.get_or_create(
                about_page=about_page,
                name=team_data['name'],
                defaults=team_data
            )
            if created:
                self.stdout.write(f'Created team member: {member.name}')

        self.stdout.write('Creating Our Story page data...')
        
        # Create Our Story Page
        story_page, created = OurStoryPage.objects.get_or_create(
            is_active=True,
            defaults={
                'hero_title': 'Our Sweet Journey',
                'hero_subtitle': 'From a passionate dream to your favorite dessert destination',
                'hero_badge_text': '✨ Our Story',
                'founder_name': 'Noor Ahmed',
                'founder_title': 'Founder & Head Pastry Chef',
                'founder_image': '@/assets/mypic.jpg',
                'founder_quote': 'Every dessert tells a story, and every story deserves the perfect sweet ending.',
                'founder_description': 'With over a decade of experience in fine pastry arts, I founded Sweet Dessert to bring joy and sweetness to every celebration. My journey began in my grandmother\'s kitchen, where I learned that the secret ingredient in every recipe is love.',
                'journey_title': 'The Journey',
                'journey_subtitle': 'From humble beginnings to sweet success',
                'impact_title': 'Our Sweet Impact',
                'impact_subtitle': 'Celebrating the milestones we\'ve achieved together',
                'vision_title': 'Our Vision',
                'vision_text': 'To become the world\'s most beloved dessert destination, spreading joy one sweet creation at a time. We envision a future where every celebration is made more special with our artisanal desserts, and where our passion for perfection continues to set new standards in the industry.',
                'cta_title': 'Be Part of Our Story',
                'cta_subtitle': 'Every order, every smile, every celebration becomes part of our sweet journey.',
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS('Our Story page created'))
        else:
            self.stdout.write('Our Story page already exists')

        # Create Story Timeline Events
        timeline_data = [
            {
                'year': '2016',
                'title': 'The Sweet Beginning',
                'description': 'Noor Ahmed establishes Sweet Dessert as a premium artisanal bakery, focusing on exceptional quality and innovative dessert creations.',
                'icon': 'Heart',
                'color_gradient': 'from-pink-500/20 to-red-500/20',
                'order': 1
            },
            {
                'year': '2018',
                'title': 'Award Recognition',
                'description': 'Received the "Best New Bakery" award from the Local Culinary Association, establishing our reputation for excellence.',
                'icon': 'Award',
                'color_gradient': 'from-yellow-500/20 to-amber-500/20',
                'order': 2
            },
            {
                'year': '2020',
                'title': 'Community Growth',
                'description': 'Expanded our team and opened our doors to custom orders, becoming the go-to destination for special celebrations.',
                'icon': 'Users',
                'color_gradient': 'from-blue-500/20 to-indigo-500/20',
                'order': 3
            },
            {
                'year': '2022',
                'title': 'Digital Innovation',
                'description': 'Launched our online platform, making our delicious creations accessible to customers across the region.',
                'icon': 'Sparkles',
                'color_gradient': 'from-purple-500/20 to-pink-500/20',
                'order': 4
            },
            {
                'year': '2025',
                'title': 'Sweet Future',
                'description': 'Continuing to innovate and expand while maintaining our commitment to quality and customer satisfaction.',
                'icon': 'Star',
                'color_gradient': 'from-emerald-500/20 to-teal-500/20',
                'order': 5
            }
        ]

        for timeline_data in timeline_data:
            event, created = StoryTimeline.objects.get_or_create(
                story_page=story_page,
                year=timeline_data['year'],
                defaults=timeline_data
            )
            if created:
                self.stdout.write(f'Created timeline event: {event.year} - {event.title}')

        # Create Story Impact Metrics
        impact_data = [
            {
                'number': '50,000+',
                'label': 'Happy Customers',
                'icon': 'Users',
                'order': 1
            },
            {
                'number': '15,000+',
                'label': 'Desserts Created',
                'icon': 'Cake',
                'order': 2
            },
            {
                'number': '500+',
                'label': 'Special Events',
                'icon': 'Heart',
                'order': 3
            },
            {
                'number': '9',
                'label': 'Years of Excellence',
                'icon': 'Award',
                'order': 4
            }
        ]

        for impact_data in impact_data:
            metric, created = StoryImpact.objects.get_or_create(
                story_page=story_page,
                number=impact_data['number'],
                label=impact_data['label'],
                defaults=impact_data
            )
            if created:
                self.stdout.write(f'Created impact metric: {metric.number} {metric.label}')

        self.stdout.write(self.style.SUCCESS('CMS data population completed successfully!'))
        self.stdout.write(self.style.SUCCESS('You can now manage your About Us and Our Story pages from the Django admin panel.'))