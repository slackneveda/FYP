import React from 'react';
import { 
  Heart,
  Sparkles,
  Calendar,
  Users,
  Award,
  MapPin,
  Clock,
  Star,
  Cake,
  Coffee,
  ChefHat,
  Smile
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuroraText } from '@/components/ui/aurora-text';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { Link } from 'react-router-dom';
import noorAhmedPhoto from '@/assets/mypic.jpg';

const OurStoryPage = () => {
  const timeline = [
    {
      year: "2016",
      title: "The Sweet Beginning",
      description: "Noor Ahmed establishes Sweet Dessert as a premium artisanal bakery, focusing on exceptional quality and innovative dessert creations.",
      icon: Heart,
      color: "from-pink-500/20 to-red-500/20"
    },
    {
      year: "2017",
      title: "First Custom Wedding Cake",
      description: "Created our first custom wedding cake, sparking a passion for celebration desserts and artistic cake design.",
      icon: Cake,
      color: "from-purple-500/20 to-pink-500/20"
    },
    {
      year: "2018",
      title: "Team Expansion",
      description: "Under Noor Ahmed's leadership, we expanded our team with specialist cake designers and operations managers, establishing our professional foundation.",
      icon: Users,
      color: "from-blue-500/20 to-indigo-500/20"
    },
    {
      year: "2019",
      title: "Award Recognition",
      description: "Won 'Best Local Bakery' and 'Excellence in Customer Service' awards from the City Chamber of Commerce.",
      icon: Award,
      color: "from-amber-500/20 to-orange-500/20"
    },
    {
      year: "2020",
      title: "Digital Innovation",
      description: "Launched online ordering and contactless delivery during challenging times, reaching customers safely at home.",
      icon: Sparkles,
      color: "from-emerald-500/20 to-teal-500/20"
    },
    {
      year: "2021",
      title: "Catering Excellence",
      description: "Expanded into full-service catering, bringing our sweet creations to corporate events and large celebrations.",
      icon: Star,
      color: "from-violet-500/20 to-purple-500/20"
    },
    {
      year: "2022",
      title: "Master Chocolatier",
      description: "David Chen joined as our chocolatier, adding handcrafted chocolate artistry to our dessert repertoire.",
      icon: ChefHat,
      color: "from-rose-500/20 to-pink-500/20"
    },
    {
      year: "2024",
      title: "Sweet Present",
      description: "Today, we proudly serve over 50,000 happy customers with the same passion and dedication we started with.",
      icon: Smile,
      color: "from-green-500/20 to-emerald-500/20"
    }
  ];

  const values = [
    {
      title: "Quality First",
      description: "Every ingredient is carefully selected, every technique perfected, every dessert crafted with uncompromising quality.",
      icon: "🥇"
    },
    {
      title: "Customer Joy",
      description: "Seeing smiles on our customers' faces and being part of their special moments drives everything we do.",
      icon: "😊"
    },
    {
      title: "Innovation",
      description: "Constantly exploring new flavors, techniques, and designs while honoring traditional pastry craftsmanship.",
      icon: "💡"
    },
    {
      title: "Community",
      description: "Supporting local suppliers, creating jobs, and being a positive force in our neighborhood community.",
      icon: "🤝"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20">
        <div className="container mx-auto px-4 text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          
          <Badge variant="default" className="text-lg px-6 py-2 bg-primary/20 text-primary border-primary/30">
            ✨ From Dreams to Reality
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            <AuroraText>Our Sweet Story</AuroraText>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            A journey that began with a simple dream: to create desserts that don't just taste incredible, 
            but touch hearts and create lasting memories. This is the story of how passion, dedication, 
            and a love for sweetness transformed into Sweet Dessert.
          </p>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-6 mb-16">
              <h2 className="text-4xl font-bold text-foreground">
                <AuroraText>Where It All Began</AuroraText>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8">
                  <p className="text-lg text-muted-foreground leading-relaxed italic mb-4">
                    "My journey began with a deep appreciation for culinary excellence and innovation. 
                    After extensive training in pastry arts and business management, I envisioned creating 
                    a premier dessert destination that combines traditional craftsmanship with modern techniques 
                    to deliver exceptional experiences for every customer."
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Noor Ahmed</p>
                      <p className="text-sm text-muted-foreground">Founder & Head Pastry Chef</p>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  With comprehensive training in international pastry techniques and business operations, 
                  Noor Ahmed established Sweet Dessert with a clear mission: to deliver artisanal desserts 
                  that exceed expectations through superior ingredients, innovative designs, and meticulous 
                  attention to detail, creating memorable experiences for discerning customers.
                </p>
              </div>

              <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center overflow-hidden">
                <div className="text-center space-y-4 w-full h-full flex flex-col items-center justify-center p-6">
                  <div className="w-full flex-1 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 backdrop-blur-sm overflow-hidden">
                    <img 
                      src={noorAhmedPhoto} 
                      alt="Noor Ahmed - Founder & Head Pastry Chef" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.outerHTML = '<div class="flex items-center justify-center w-full h-full"><div class="text-6xl">👨‍🍳</div></div>';
                      }}
                    />
                  </div>
                  <p className="text-primary font-medium text-lg">Noor Ahmed's Vision</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              <AuroraText>Our Journey Through Time</AuroraText>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every milestone, every achievement, every sweet moment that shaped who we are today.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-4">
              {timeline.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div key={index} className="flex justify-center">
                    <CardContainer className="inter-var" containerClassName="py-8">
                      <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full max-w-sm h-auto rounded-xl p-8 border flex flex-col items-center">
                        <CardItem
                          translateZ="50"
                          className="flex items-center justify-between mb-6 w-full"
                        >
                          <Badge variant="outline" className="text-primary font-bold">
                            {item.year}
                          </Badge>
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                        </CardItem>
                        <CardItem
                          as="h3"
                          translateZ="60"
                          className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 leading-tight mb-4 w-full text-center"
                        >
                          {item.title}
                        </CardItem>
                        <CardItem
                          as="p"
                          translateZ="60"
                          className="text-neutral-500 text-sm dark:text-neutral-300 leading-relaxed w-full text-center"
                        >
                          {item.description}
                        </CardItem>
                      </CardBody>
                    </CardContainer>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-bold text-foreground">
              <AuroraText>Our Philosophy</AuroraText>
            </h2>
            
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 md:p-12">
              <blockquote className="text-2xl text-foreground leading-relaxed italic mb-8">
                "At Sweet Dessert, we understand that exceptional desserts represent more than culinary achievement – 
                they embody artistry, celebration, and the pursuit of perfection. Our commitment to excellence 
                ensures that every creation reflects our dedication to quality and our customers' most cherished moments."
              </blockquote>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                {values.map((value, index) => (
                  <div key={index} className="text-center space-y-3">
                    <div className="text-4xl mb-2">{value.icon}</div>
                    <h3 className="font-semibold text-foreground">{value.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="bg-gradient-to-r from-primary/5 to-primary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              <AuroraText>Making a Sweet Impact</AuroraText>
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Beyond creating delicious desserts, we're committed to making a positive difference 
              in our community and supporting causes close to our hearts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto px-4">
            <div className="flex justify-center">
              <CardContainer className="inter-var" containerClassName="py-8">
                <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full max-w-sm h-auto rounded-xl p-8 border flex flex-col items-center">
                  <CardItem
                    translateZ="50"
                    className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6"
                  >
                    <Heart className="h-8 w-8 text-green-600" />
                  </CardItem>
                  <CardItem
                    as="h3"
                    translateZ="60"
                    className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 text-center mb-6 w-full"
                  >
                    Community Support
                  </CardItem>
                  <CardItem
                    as="p"
                    translateZ="60"
                    className="text-neutral-500 dark:text-neutral-300 text-center leading-relaxed w-full"
                  >
                    We donate desserts to local charities, sponsor community events, and support 
                    local food banks with fresh baked goods every month.
                  </CardItem>
                </CardBody>
              </CardContainer>
            </div>

            <div className="flex justify-center">
              <CardContainer className="inter-var" containerClassName="py-8">
                <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full max-w-sm h-auto rounded-xl p-8 border flex flex-col items-center">
                  <CardItem
                    translateZ="50"
                    className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6"
                  >
                    <Users className="h-8 w-8 text-blue-600" />
                  </CardItem>
                  <CardItem
                    as="h3"
                    translateZ="60"
                    className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 text-center mb-6 w-full"
                  >
                    Local Employment
                  </CardItem>
                  <CardItem
                    as="p"
                    translateZ="60"
                    className="text-neutral-500 dark:text-neutral-300 text-center leading-relaxed w-full"
                  >
                    We've created over 25 local jobs, providing career growth opportunities and 
                    supporting families in our community through meaningful employment.
                  </CardItem>
                </CardBody>
              </CardContainer>
            </div>

            <div className="flex justify-center">
              <CardContainer className="inter-var" containerClassName="py-8">
                <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full max-w-sm h-auto rounded-xl p-8 border flex flex-col items-center">
                  <CardItem
                    translateZ="50"
                    className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6"
                  >
                    <Sparkles className="h-8 w-8 text-amber-600" />
                  </CardItem>
                  <CardItem
                    as="h3"
                    translateZ="60"
                    className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 text-center mb-6 w-full"
                  >
                    Sustainable Practices
                  </CardItem>
                  <CardItem
                    as="p"
                    translateZ="60"
                    className="text-neutral-500 dark:text-neutral-300 text-center leading-relaxed w-full"
                  >
                    We source locally when possible, use eco-friendly packaging, and maintain 
                    sustainable business practices that care for our environment.
                  </CardItem>
                </CardBody>
              </CardContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Future Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-bold text-foreground">
              <AuroraText>Looking Forward</AuroraText>
            </h2>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              As we continue our sweet journey, we remain committed to innovation while honoring 
              the traditions that brought us here. Our future holds exciting plans for new locations, 
              expanded catering services, and even more ways to bring joy through exceptional desserts.
            </p>

            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 md:p-12 mt-12">
              <p className="text-lg text-muted-foreground leading-relaxed italic mb-6">
                "Our commitment remains steadfast: to continuously innovate while maintaining the highest 
                standards of quality and service. At Sweet Dessert, we don't just create desserts – we craft 
                experiences that celebrate life's special moments with uncompromising excellence."
              </p>
              <div className="w-16 h-1 bg-primary rounded-full mx-auto"></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link to="/menu">
                <ShimmerButton variant="chocolate" size="lg">
                  <Cake className="h-5 w-5 mr-2" />
                  Taste Our Story
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
        </div>
      </section>
    </div>
  );
};

export default OurStoryPage;