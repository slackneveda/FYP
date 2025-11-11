// cSpell:ignore magicui stevia
import React, { useState, useEffect } from 'react';
import { 
  Plus,
  Minus,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  ShoppingCart,
  Utensils,
  Heart,
  HelpCircle,
  Package,
  CreditCard,
  Truck,
  ChefHat,
  MapPin,
  Star,
  Users,
  Award,
  Coffee,
  Cake,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuroraText } from '@/components/ui/aurora-text';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { Link } from 'react-router-dom';
import api from '@/services/api';

const FAQPage = () => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [faqData, setFaqData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Icon mapping for dynamic icons
  const iconMap = {
    Package: Package,
    CreditCard: CreditCard,
    Truck: Truck,
    Heart: Heart,
    ChefHat: ChefHat,
    Clock: Clock,
    MapPin: MapPin,
    Phone: Phone,
    Mail: Mail,
    Star: Star,
    Users: Users,
    Award: Award,
    Coffee: Coffee,
    Cake: Cake,
    Sparkles: Sparkles,
    HelpCircle: HelpCircle,
    ShoppingCart: ShoppingCart,
    Utensils: Utensils,
    MessageSquare: MessageSquare
  };

  useEffect(() => {
    fetchFAQData();
  }, []);

  const fetchFAQData = async () => {
    try {
      setLoading(true);
      const response = await api.getFAQPage();
      const data = response.data || response;
      setFaqData(data);
    } catch (err) {
      console.error('Error fetching FAQ data:', err);
      // Fallback to static data if API fails
      setFaqData(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const faqCategories = [
    {
      title: "Ordering & Custom Cakes",
      icon: ShoppingCart,
      color: "from-amber-500/20 to-orange-500/20",
      faqs: [
        {
          question: "How far in advance should I place a custom cake order?",
          answer: "For custom cakes, we recommend placing your order at least 3-5 days in advance. For wedding cakes or large events, please contact us 2-3 weeks ahead to ensure availability and proper planning. Rush orders may be accommodated with an additional fee, subject to availability."
        },
        {
          question: "Can I modify or cancel my order?",
          answer: "Orders can be modified or cancelled up to 2 hours before the scheduled pickup/delivery time. For custom cakes, changes must be made at least 24 hours in advance. Please contact us as soon as possible if you need to make changes. Cancellation fees may apply for custom orders."
        },
        {
          question: "Do you provide cake tastings for custom orders?",
          answer: "Yes! We offer complimentary cake tastings for wedding cakes and large custom orders (minimum ₨1500). Tastings are available by appointment and include up to 4 flavor combinations. Additional flavors can be sampled for a small fee."
        }
      ]
    },
    {
      title: "Dietary Requirements",
      icon: Heart,
      color: "from-emerald-500/20 to-teal-500/20",
      faqs: [
        {
          question: "Do you accommodate dietary restrictions and allergies?",
          answer: "Absolutely! We offer various options including gluten-free, dairy-free, vegan, and sugar-free desserts. Please inform us of any allergies when placing your order, and we'll ensure your desserts are prepared safely with dedicated equipment and separate preparation areas."
        },
        {
          question: "Are your gluten-free options certified?",
          answer: "Yes, our gluten-free desserts are prepared in a dedicated gluten-free facility and are certified by relevant food safety authorities. We use certified gluten-free ingredients and follow strict protocols to prevent cross-contamination."
        },
        {
          question: "Can you make sugar-free desserts that still taste great?",
          answer: "Definitely! We use premium sugar alternatives like erythritol, stevia, and monk fruit to create delicious sugar-free options. Our pastry chefs have perfected recipes that maintain the taste and texture you'd expect from traditional desserts."
        }
      ]
    },
    {
      title: "Delivery & Pickup",
      icon: Clock,
      color: "from-blue-500/20 to-indigo-500/20",
      faqs: [
        {
          question: "What are your delivery options and fees?",
          answer: "We offer delivery within a 15-mile radius for orders over ₨250. Delivery fees range from ₨40 to ₨80 depending on distance. For large catering orders, we provide special delivery services with setup options. Same-day delivery is available for an additional fee."
        },
        {
          question: "Do you offer contactless delivery?",
          answer: "Yes, we offer contactless delivery options. Simply specify your preference when placing your order, and our delivery team will leave your desserts at your specified location with photo confirmation and text notification."
        },
        {
          question: "What are your pickup hours?",
          answer: "Pickup is available during our regular business hours: Monday-Thursday 7AM-9PM, Friday-Sunday 7AM-10PM. We also offer early pickup (6AM-7AM) and late pickup (after 9PM) by special arrangement for an additional fee."
        }
      ]
    },
    {
      title: "Catering & Events",
      icon: Utensils,
      color: "from-purple-500/20 to-pink-500/20",
      faqs: [
        {
          question: "Do you offer catering for events?",
          answer: "Absolutely! We provide full catering services for events of all sizes. Our catering menu includes dessert tables, individual portions, and custom displays. Contact us to discuss your event needs and get a personalized quote. We also offer setup and breakdown services."
        },
        {
          question: "What's the minimum order for catering?",
          answer: "Our minimum catering order is ₨1000 or 25 servings, whichever is greater. For larger events (100+ guests), we offer volume discounts and additional services like dessert stations, live cake decorating, and branded packaging."
        },
        {
          question: "Do you provide serving equipment for events?",
          answer: "Yes! We provide serving platters, utensils, napkins, and plates for catering orders over ₨2000. For smaller orders, these items are available for rent at a nominal fee. We also offer elegant display stands and tiered serving pieces."
        }
      ]
    },
    {
      title: "Storage & Quality",
      icon: MessageSquare,
      color: "from-rose-500/20 to-red-500/20",
      faqs: [
        {
          question: "How should I store my desserts?",
          answer: "Most of our desserts should be refrigerated and consumed within 2-3 days for best quality. Specific storage instructions are provided with each order. Frozen desserts should be kept frozen until 30 minutes before serving. Room temperature items like cookies can be stored in airtight containers."
        },
        {
          question: "Do your desserts freeze well?",
          answer: "Many of our desserts freeze beautifully! Cakes, cupcakes, and most pastries can be frozen for up to 3 months when properly wrapped. We provide detailed freezing and thawing instructions with each order. Some items like fresh fruit tarts are best enjoyed fresh."
        },
        {
          question: "What if I'm not satisfied with my order?",
          answer: "Your satisfaction is our priority! If you're not completely happy with your order, please contact us within 24 hours. We'll work with you to make it right, whether that means a replacement, refund, or store credit. We stand behind the quality of our desserts 100%."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Loading State */}
      {loading && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
        </div>
      )}

      {/* Hero Section */}
      {!loading && (
        <section className="relative bg-gradient-to-br from-orange-50 via-pink-50 to-rose-50 dark:bg-gradient-to-br dark:from-background dark:via-background dark:to-muted/20 py-20">
          <div className="container mx-auto px-4 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 mb-4">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            
            <Badge variant="default" className="text-lg px-6 py-2 bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary-foreground border-primary/30 dark:border-primary/50">
              💡 Get Answers
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              <AuroraText>{faqData?.title || 'Frequently Asked Questions'}</AuroraText>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {faqData?.subtitle || 'Find quick answers to common questions about our desserts, ordering process, and services. Can\'t find what you\'re looking for? We\'re here to help!'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link to="/contact">
                <ShimmerButton variant="chocolate" size="lg">
                  <Mail className="h-5 w-5 mr-2" />
                  Contact Us
                </ShimmerButton>
              </Link>
              <Button variant="outline" size="lg" className="border-primary/30 dark:border-primary/50 dark:hover:bg-primary/10">
                <Phone className="h-5 w-5 mr-2" />
                Call (555) 123-4567
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Categories */}
      {!loading && (
        <section className="py-20">
          <div className="container mx-auto px-4 space-y-16">
            {/* Dynamic FAQ Categories */}
            {faqData?.categories?.filter(cat => cat.is_active)?.map((category) => {
              const IconComponent = iconMap[category.icon] || HelpCircle;
              const colorClass = `from-${category.color}-500/20 to-${category.color}-600/20`;
              const activeItems = category.faq_items?.filter(item => item.is_active) || [];
              
              if (activeItems.length === 0) return null;
              
              return (
                <div key={category.id} className="space-y-8">
                  {/* Category Header */}
                  <div className="text-center space-y-4">
                    {/* cSpell:disable */}
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${colorClass} mb-4`}>
                      <IconComponent className="h-7 w-7 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold text-foreground">
                      <AuroraText>{category.name}</AuroraText>
                    </h2>
                    {category.description && (
                      <p className="text-muted-foreground max-w-2xl mx-auto">
                        {category.description}
                      </p>
                    )}
                  </div>

                  {/* FAQs Grid */}
                  <div className="max-w-4xl mx-auto space-y-4">
                    {activeItems.map((faq) => {
                      const globalIndex = `${category.id}-${faq.id}`;
                      return (
                        <Card key={faq.id} className="overflow-hidden border-primary/10 shadow-sm hover:shadow-md transition-all duration-300">
                          <CardHeader 
                            className="cursor-pointer hover:bg-primary/5 transition-colors duration-200 p-6"
                            onClick={() => toggleFAQ(globalIndex)}
                          >
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-left text-foreground text-lg pr-4">
                                {faq.question}
                              </h3>
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                                expandedFAQ === globalIndex 
                                  ? 'bg-primary text-primary-foreground rotate-180' 
                                  : 'bg-primary/10 text-primary hover:bg-primary/20'
                              }`}>
                                {expandedFAQ === globalIndex ? (
                                  <Minus className="h-4 w-4" />
                                ) : (
                                  <Plus className="h-4 w-4" />
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          
                          {expandedFAQ === globalIndex && (
                            <CardContent className="pt-0 pb-6 px-6">
                              <div className="border-t border-primary/10 pt-4">
                                <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-line">
                                  {faq.answer}
                                </p>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Fallback to Static Data if no dynamic data */}
            {(!faqData || !faqData.categories || faqData.categories.length === 0) && (
              <>
                {faqCategories.map((category, categoryIndex) => {
                  const IconComponent = category.icon;
                  return (
                    <div key={categoryIndex} className="space-y-8">
                      {/* Category Header */}
                      <div className="text-center space-y-4">
                        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} mb-4`}>
                          <IconComponent className="h-7 w-7 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold text-foreground">
                          <AuroraText>{category.title}</AuroraText>
                        </h2>
                      </div>

                      {/* FAQs Grid */}
                      <div className="max-w-4xl mx-auto space-y-4">
                        {category.faqs.map((faq, faqIndex) => {
                          const globalIndex = categoryIndex * 100 + faqIndex;
                          return (
                            <Card key={globalIndex} className="overflow-hidden border-primary/10 shadow-sm hover:shadow-md transition-all duration-300">
                              <CardHeader 
                                className="cursor-pointer hover:bg-primary/5 transition-colors duration-200 p-6"
                                onClick={() => toggleFAQ(globalIndex)}
                              >
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold text-left text-foreground text-lg pr-4">
                                    {faq.question}
                                  </h3>
                                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                                    expandedFAQ === globalIndex 
                                      ? 'bg-primary text-primary-foreground rotate-180' 
                                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                                  }`}>
                                    {expandedFAQ === globalIndex ? (
                                      <Minus className="h-4 w-4" />
                                    ) : (
                                      <Plus className="h-4 w-4" />
                                    )}
                                  </div>
                                </div>
                              </CardHeader>
                              
                              {expandedFAQ === globalIndex && (
                                <CardContent className="pt-0 pb-6 px-6">
                                  <div className="border-t border-primary/10 pt-4">
                                    <p className="text-muted-foreground leading-relaxed text-base">
                                      {faq.answer}
                                    </p>
                                  </div>
                                </CardContent>
                              )}
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </section>
      )}

      {/* Still Have Questions Section */}
      <section className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:bg-gradient-to-r dark:from-muted/30 dark:via-muted/50 dark:to-muted/30 py-16">
        <div className="container mx-auto px-4 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              <AuroraText>Still Have Questions?</AuroraText>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our sweet team is ready to help! Reach out to us and we'll get back to you within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-primary/20 dark:border-primary/30 hover:shadow-lg dark:hover:shadow-primary/10 transition-shadow">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Email Support</h3>
                <p className="text-sm text-muted-foreground">
                  Get detailed answers to your questions
                </p>
                <Link to="/contact">
                  <Button variant="outline" size="sm" className="w-full dark:hover:bg-primary/10">
                    Send Message
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-primary/20 dark:border-primary/30 hover:shadow-lg dark:hover:shadow-primary/10 transition-shadow">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Phone Support</h3>
                <p className="text-sm text-muted-foreground">
                  Speak directly with our team
                </p>
                <Button variant="outline" size="sm" className="w-full dark:hover:bg-primary/10">
                  Call Now
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/20 dark:border-primary/30 hover:shadow-lg dark:hover:shadow-primary/10 transition-shadow">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Live Chat</h3>
                <p className="text-sm text-muted-foreground">
                  Instant help during business hours
                </p>
                <Button variant="outline" size="sm" className="w-full dark:hover:bg-primary/10">
                  Start Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;