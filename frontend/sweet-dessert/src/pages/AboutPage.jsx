import React, { useState, useEffect } from 'react';
import { 
  Users,
  Heart,
  Award,
  MapPin,
  Clock,
  ChefHat,
  Star,
  Coffee,
  Cake,
  Utensils
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuroraText } from '@/components/ui/aurora-text';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { Link } from 'react-router-dom';
import api from '@/services/api';

const AboutPage = () => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const response = await api.get('/cms/about-us/active/');
        setPageData(response);
      } catch (error) {
        console.error('Error fetching About Us page data:', error);
        // Fallback to static data if API fails
        setPageData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, []);

  // Fallback static data
  const fallbackValues = [
    {
      icon: Heart,
      title: "Passion for Excellence",
      description: "Every dessert is crafted with love, dedication, and an unwavering commitment to perfection.",
      color: "from-red-500/20 to-pink-500/20"
    },
    {
      icon: Award,
      title: "Quality Ingredients",
      description: "We source only the finest, premium ingredients from trusted suppliers around the world.",
      color: "from-amber-500/20 to-yellow-500/20"
    },
    {
      icon: Users,
      title: "Community Focus",
      description: "Building lasting relationships with our customers and being an integral part of our community.",
      color: "from-blue-500/20 to-indigo-500/20"
    },
    {
      icon: ChefHat,
      title: "Artisan Craftsmanship",
      description: "Our skilled pastry chefs combine traditional techniques with innovative creativity.",
      color: "from-emerald-500/20 to-teal-500/20"
    }
  ];

  // Use data from CMS or fallback to static data
  const values = pageData?.values || fallbackValues;
  const teamMembers = pageData?.team_members || [];

  // Get page content with fallbacks
  const heroTitle = pageData?.hero_title || "About Sweet Dessert";
  const heroSubtitle = pageData?.hero_subtitle || "We create exquisite desserts with passion, artistry, and the finest ingredients — each bite a delicious chapter in a story of sweetness and perfection. Welcome to our world of culinary excellence.";
  const heroShortTitle = pageData?.hero_badge_text || "🏪 Our Sweet Story";
  const missionTitle = pageData?.mission_title || "Our Mission";
  const missionText = pageData?.mission_text || "To transform life's precious moments into unforgettable experiences through exceptional desserts. We believe that every celebration deserves the perfect sweet touch, and every day can be made brighter with a little sweetness. Our commitment is to craft not just desserts, but memories that last a lifetime.";
  const valuesTitle = pageData?.values_title || "Our Values";
  const valuesSubtitle = pageData?.values_subtitle || "The principles that guide everything we do, from ingredient selection to customer service.";
  const storeTitle = pageData?.store_title || "Visit Our Store";
  const storeDescription = pageData?.store_description || "Step into our warm, inviting space where the aroma of freshly baked goods fills the air. Watch our pastry chefs at work through our open kitchen concept, and experience the magic of dessert creation firsthand.";
  const storeAddress = pageData?.store_address || "123 Sweet Street, Dessert City, DC 12345";
  const storeHours = pageData?.store_hours || "Mon-Thu: 7AM-9PM | Fri-Sun: 7AM-10PM";
  const ctaTitle = pageData?.cta_title || "Ready to Experience Sweet Perfection?";
  const ctaSubtitle = pageData?.cta_subtitle || "Join thousands of satisfied customers who have made us their go-to destination for life's sweetest moments.";

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading page content...</p>
        </div>
      </div>
    );
  }

  const fallbackTeam = [
    {
      name: "Sarah Mitchell",
      role: "Head Pastry Chef & Founder",
      description: "With 15 years of experience in fine pastry, Sarah brings European techniques to every creation.",
      image: "👩‍🍳"
    },
    {
      name: "Ahmed Hassan",
      role: "Cake Designer",
      description: "Specializing in custom wedding cakes and artistic dessert displays with 8 years of expertise.",
      image: "👨‍🍳"
    },
    {
      name: "Maria Rodriguez",
      role: "Operations Manager",
      description: "Ensuring every customer experience is exceptional and every order is perfect.",
      image: "👩‍💼"
    },
    {
      name: "David Chen",
      role: "Chocolatier",
      description: "Master of chocolate artistry, creating handcrafted truffles and chocolate sculptures.",
      image: "🍫"
    }
  ];

  const stats = [
    {
      number: "50,000+",
      label: "Happy Customers",
      icon: Users
    },
    {
      number: "15,000+",
      label: "Custom Cakes Created",
      icon: Cake
    },
    {
      number: "500+",
      label: "Events Catered",
      icon: Utensils
    },
    {
      number: "8",
      label: "Years of Excellence",
      icon: Star
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20">
        <div className="container mx-auto px-4 text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Heart className="h-10 w-10 text-primary" />
          </div>
          
          <Badge variant="default" className="text-lg px-6 py-2 bg-primary/20 text-primary border-primary/30">
            {heroShortTitle}
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            <AuroraText>{heroTitle}</AuroraText>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            {heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link to="/menu">
              <ShimmerButton variant="chocolate" size="lg">
                <Cake className="h-5 w-5 mr-2" />
                Explore Our Menu
              </ShimmerButton>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="border-primary/30">
                <Coffee className="h-5 w-5 mr-2" />
                Visit Our Store
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-bold text-foreground">
              <AuroraText>{missionTitle}</AuroraText>
            </h2>
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 md:p-12">
              <p className="text-lg text-muted-foreground leading-relaxed italic">
                "{missionText}"
              </p>
              <div className="flex items-center justify-center mt-6">
                <div className="w-12 h-1 bg-primary rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              <AuroraText>{valuesTitle}</AuroraText>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {valuesSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-4">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="flex justify-center">
                  <CardContainer className="inter-var" containerClassName="py-8">
                    <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full max-w-sm h-auto rounded-xl p-8 border flex flex-col items-center">
                      <CardItem
                        translateZ="50"
                        className="text-xl font-bold text-neutral-600 dark:text-white text-center w-full mb-6 flex justify-center"
                      >
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${value.color}`}>
                          <IconComponent className="h-8 w-8 text-primary" />
                        </div>
                      </CardItem>
                      <CardItem
                        as="h3"
                        translateZ="60"
                        className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 text-center mb-4 w-full"
                      >
                        {value.title}
                      </CardItem>
                      <CardItem
                        as="p"
                        translateZ="60"
                        className="text-neutral-500 text-sm dark:text-neutral-300 text-center leading-relaxed w-full"
                      >
                        {value.description}
                      </CardItem>
                    </CardBody>
                  </CardContainer>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              <AuroraText>Meet Our Team</AuroraText>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The passionate artists behind every delicious creation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-4">
            {(teamMembers.length > 0 ? teamMembers : fallbackTeam).map((member, index) => (
              <div key={index} className="flex justify-center">
                <CardContainer className="inter-var" containerClassName="py-8">
                  <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full max-w-sm h-auto rounded-xl p-8 border flex flex-col items-center">
                    <CardItem
                      translateZ="50"
                      className="text-6xl mb-6 text-center w-full flex justify-center"
                    >
                      {member.image}
                    </CardItem>
                    <CardItem
                      as="h3"
                      translateZ="60"
                      className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 text-center mb-3 w-full"
                    >
                      {member.name}
                    </CardItem>
                    <CardItem
                      translateZ="40"
                      className="text-center mb-4 w-full"
                    >
                      <Badge variant="outline" className="text-xs">{member.role}</Badge>
                    </CardItem>
                    <CardItem
                      as="p"
                      translateZ="60"
                      className="text-neutral-500 text-sm dark:text-neutral-300 text-center leading-relaxed w-full"
                    >
                      {member.description}
                    </CardItem>
                  </CardBody>
                </CardContainer>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-primary/5 to-primary/10 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold text-foreground">
              <AuroraText>Our Journey in Numbers</AuroraText>
            </h2>
            <p className="text-muted-foreground">
              Celebrating milestones and achievements together with our community.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="border-primary/20 bg-background/50 backdrop-blur-sm">
                  <CardContent className="p-6 text-center space-y-3">
                    <IconComponent className="h-8 w-8 text-primary mx-auto" />
                    <div className="text-3xl font-bold text-foreground">{stat.number}</div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Location & Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-foreground">
                <AuroraText>{storeTitle}</AuroraText>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {storeDescription}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-foreground">{storeAddress}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-foreground">{storeHours}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/contact">
                  <ShimmerButton variant="chocolate">
                    Get Directions
                  </ShimmerButton>
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              {/* Store Image Placeholder */}
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Coffee className="h-16 w-16 text-primary mx-auto" />
                  <p className="text-primary font-medium">Our Beautiful Store</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold text-foreground">
            <AuroraText>{ctaTitle}</AuroraText>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {ctaSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/menu">
              <ShimmerButton variant="chocolate" size="lg">
                Order Now
              </ShimmerButton>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="border-primary/30">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;