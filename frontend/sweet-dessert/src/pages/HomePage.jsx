// cspell:disable
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Heart, Award, Users, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { AuroraText } from '@/components/ui/aurora-text';
import { StatsCard, TestimonialCard, DessertCard } from '@/components/DessertCards';
import { desserts } from '@/data/desserts';
import { useCart } from '@/contexts/CartProvider';
import apiService from '@/services/api';
import { motion } from 'framer-motion';

// Function to dynamically import images from assets
const getProductImage = (imagePath) => {
  try {
    // Convert backend path to relative path for imports
    if (imagePath && imagePath.startsWith('/src/')) {
      let relativePath = imagePath.replace('/src/', '../');
      // Fix folder name mapping - database uses hyphens but actual folders use spaces
      relativePath = relativePath.replace('/categories/mini-donuts/', '/categories/mini donuts/');
      return new URL(relativePath, import.meta.url).href;
    }
    // Fallback for other image formats
    return imagePath || '/placeholder.jpg';
  } catch (error) {
    console.error('Error loading image:', imagePath, error);
    // Return a placeholder or the original path
    return imagePath || '/placeholder.jpg';
  }
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      delay: i * 0.15,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
};

const SectionReveal = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const HomePage = () => {
  const [featuredDesserts, setFeaturedDesserts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [testimonialsList, setTestimonialsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured desserts from backend
        try {
          const featuredResponse = await apiService.getFeaturedDesserts();
          const featuredData = featuredResponse.results ? featuredResponse.results : featuredResponse;
          if (featuredData && featuredData.length > 0) {
            setFeaturedDesserts(featuredData.slice(0, 3));
          } else {
            // Fallback
            const allDessertsResponse = await apiService.getDesserts();
            const allDessertsData = allDessertsResponse.results ? allDessertsResponse.results : allDessertsResponse;
            const featuredItems = allDessertsData.filter(dessert => 
              dessert.featured || dessert.is_featured || dessert.seasonal || dessert.is_seasonal
            );
            setFeaturedDesserts(featuredItems.slice(0, 3));
          }
        } catch {
          setFeaturedDesserts(desserts.filter(dessert => dessert.featured).slice(0, 3));
        }

        // Fetch best sellers from backend  
        try {
          const bestSellersResponse = await apiService.getDesserts({ best_seller: 'true' });
          let bestSellersData = bestSellersResponse.results ? bestSellersResponse.results : bestSellersResponse;
          
          if (!bestSellersData || bestSellersData.length === 0) {
            const allDessertsResponse = await apiService.getDesserts();
            const allDessertsData = allDessertsResponse.results ? allDessertsResponse.results : allDessertsResponse;
            bestSellersData = allDessertsData.filter(dessert => 
              dessert.best_seller || dessert.is_bestseller || dessert.featured || dessert.is_featured
            );
          }
          setBestSellers(bestSellersData.slice(0, 3));
        } catch {
          setBestSellers(desserts.filter(dessert => dessert.bestSeller).slice(0, 3));
        }

        // Fetch testimonials from backend
        try {
          const testimonialsResponse = await apiService.getTestimonials();
          const testimonialsData = testimonialsResponse.testimonials || testimonialsResponse.results || testimonialsResponse;
          if (testimonialsData && testimonialsData.length > 0) {
            setTestimonialsList(testimonialsData);
          }
        } catch {
          // Ignore
        }

      } catch (error) {
        console.error('Error fetching homepage data:', error);
        setError('Unable to load some content. Please try again later.');
        setFeaturedDesserts(desserts.filter(dessert => dessert.featured).slice(0, 3));
        setBestSellers(desserts.filter(dessert => dessert.bestSeller).slice(0, 3));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = (dessert) => {
    const cartItem = {
      id: dessert.id,
      name: dessert.name,
      price: parseFloat(dessert.price), // Convert string to number
      image: dessert.image,
      quantity: 1,
      customizations: {}
    };
    addItem(cartItem);
  };

  const stats = [
    { icon: "👥", label: "Happy Customers", value: "10,000+", color: "orange" },
    { icon: "🏆", label: "Awards Won", value: "25+", color: "blue" },
    { icon: "⏰", label: "Years Experience", value: "15+", color: "green" },
    { icon: "❤️", label: "Desserts Made", value: "50,000+", color: "purple" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <div className="relative mx-auto h-20 w-20">
            <div className="absolute inset-0 animate-ping rounded-full bg-orange-500/20"></div>
            <div className="relative flex h-full w-full items-center justify-center rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground text-lg font-medium animate-pulse">Preparing sweet moments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-24 pb-24 overflow-x-hidden relative bg-background">
        
      {/* Error Alert Overlay */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md bg-red-500/90 backdrop-blur-md rounded-full px-6 py-3 shadow-2xl text-white text-sm text-center font-medium">
          {error}
        </div>
      )}
        
      {/* Hero Section */}
      <section className="relative min-h-[90svh] flex items-center bg-zinc-950">
        {/* Elegant Background Image with Parallax & Dark Overlay */}
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.65 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src="https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=2564&auto=format&fit=crop"
            alt="Artisanal Desserts Background"
            className="w-full h-full object-cover"
          />
          {/* Gradients to blend text beautifully */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/50 to-transparent"></div>
        </motion.div>

        {/* Floating Ambient Light Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-orange-500/20 blur-[100px]"
              initial={{ 
                left: `${Math.random() * 100}%`, 
                top: `${Math.random() * 100}%`,
                scale: Math.random() + 0.5
              }}
              animate={{ 
                left: `${Math.random() * 100}%`, 
                top: `${Math.random() * 100}%`,
              }}
              transition={{ 
                duration: Math.random() * 15 + 15, 
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear"
              }}
              style={{
                width: `${Math.random() * 30 + 20}vw`,
                height: `${Math.random() * 30 + 20}vw`,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="container relative z-10 mx-auto px-4 md:px-8">
          <div className="max-w-3xl pt-20 pb-16">
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeUpVariants}
              className="mb-8 inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-5 py-2 backdrop-blur-md"
            >
              <Sparkles className="mr-2 h-4 w-4 text-orange-400" />
              <span className="text-sm font-semibold tracking-wide text-orange-300 uppercase">Artisanal Bakery & Patisserie</span>
            </motion.div>

            <motion.h1 
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeUpVariants}
              className="mb-6 text-5xl font-display font-extrabold tracking-tight text-white sm:text-7xl lg:text-8xl"
            >
              Sweet Dreams <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-amber-200">
                Come True.
              </span>
            </motion.h1>

            <motion.p 
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeUpVariants}
              className="mb-10 max-w-2xl text-lg text-zinc-300 sm:text-xl leading-relaxed"
            >
              Whispers of sweetness, crafted with care. From delicate pastries to decadent delights, every bite is an embrace of pure pleasure. Elevate your senses with our handcrafted desserts.
            </motion.p>

            <motion.div 
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeUpVariants}
              className="flex flex-col sm:flex-row gap-5 sm:items-center"
            >
              <Link to="/menu">
                <ShimmerButton size="lg" className="h-14 px-8 text-lg font-semibold bg-orange-600 hover:bg-orange-700 shadow-[0_0_40px_-10px_rgba(234,88,12,0.5)] flex items-center justify-center">
                  Explore Menu
                  <ArrowRight className="ml-2 h-5 w-5" />
                </ShimmerButton>
              </Link>
              <Link to="/featured">
                <Button variant="outline" size="lg" className="h-14 px-8 rounded-md border-zinc-700 bg-zinc-900/40 text-lg font-medium text-white backdrop-blur-md hover:bg-zinc-800 hover:text-white hover:border-zinc-600 transition-all duration-300">
                  View Featured
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Subtle curve at bottom to transition to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none"></div>
      </section>

      {/* Stats Section */}
      <SectionReveal>
        <section className="container mx-auto px-4 !mt-12">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              <AuroraText>Our Sweet Achievements</AuroraText>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A testament to our dedication to quality, taste, and the joy of our community.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="col-span-1"
              >
                <StatsCard 
                  icon={stat.icon}
                  number={stat.value}
                  label={stat.label}
                  color={stat.color}
                />
              </motion.div>
            ))}
          </div>
        </section>
      </SectionReveal>

      {/* Featured Desserts */}
      <SectionReveal className="bg-muted/30 py-24 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                <AuroraText>Featured Masterpieces</AuroraText>
              </h2>
              <p className="text-lg text-muted-foreground">
                Discover our chef's special selections and seasonal favorites, crafted to perfection.
              </p>
            </div>
            <Link to="/menu" className="group">
              <Button variant="ghost" className="w-fit text-primary hover:text-primary-hover hover:bg-primary/10">
                View All Menu
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {featuredDesserts.map((dessert, i) => (
              <motion.div
                key={dessert.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <DessertCard 
                  dessert={{
                    ...dessert,
                    image: getProductImage(dessert.image)
                  }} 
                  onAddToCart={handleAddToCart}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* About Us Split Section */}
      <SectionReveal>
        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1 group">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-orange-500/20 to-pink-500/20 opacity-0 blur-xl transition duration-500 group-hover:opacity-100"></div>
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80"
                  alt="Our beautifully crafted bakery"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-3xl"></div>
              </div>
              
              {/* Floating Badge on Image */}
              <div className="absolute -bottom-6 -right-6 bg-background p-6 rounded-2xl shadow-xl border border-border flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="font-bold text-lg text-foreground">Made with Love</p>
                  <p className="text-sm text-muted-foreground">Every single day</p>
                </div>
              </div>
            </div>

            <div className="space-y-8 order-1 lg:order-2 lg:pl-8">
              <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                Our Story
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                A Legacy of <br/><AuroraText>Sweet Craftsmanship</AuroraText>
              </h2>
              
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  In 2024, with a heart full of passion and a kitchen filled with the aroma of fresh bakes, 
                  Noor Ahmed set out to turn a lifelong dream into reality. That dream became Sweet Dessert.
                </p>
                <p>
                  What began as a humble space with a single oven quickly became a local treasure, known for 
                  irresistible flavors and desserts that feel like a hug in every bite. Our vision is simple: 
                  blend the purest ingredients with creativity, artistry, and a sprinkle of magic.
                </p>
              </div>

              <div className="pt-4 grid sm:grid-cols-2 gap-4">
                {[
                  "Premium Ingredients", "Artisanal Methods", "Daily Fresh Bakes", "Custom Creations"
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span className="font-medium text-foreground text-base">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <Link to="/our-story">
                  <ShimmerButton variant="caramel" className="h-14 px-8 text-lg font-medium shadow-lg hover:shadow-xl transition-all">
                    Read The Full Story
                  </ShimmerButton>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* Best Sellers */}
      <SectionReveal>
        <section className="container mx-auto px-4 mt-12">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              <AuroraText>Customer Favorites</AuroraText>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The sweet treats our customers keep coming back for time and time again.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {bestSellers.map((dessert, i) => (
              <motion.div
                key={dessert.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
              >
                <DessertCard 
                  dessert={{
                    ...dessert,
                    image: getProductImage(dessert.image)
                  }} 
                  onAddToCart={handleAddToCart}
                />
              </motion.div>
            ))}
          </div>
        </section>
      </SectionReveal>

      {/* Testimonials */}
      {testimonialsList.length > 0 && (
        <SectionReveal className="bg-muted/30 py-24 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                <AuroraText>Words from Dessert Lovers</AuroraText>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Don't just take our word for it—see what our satisfied customers are saying.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonialsList.slice(0, 3).map((testimonial, i) => (
                <motion.div
                  key={testimonial.id}
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <TestimonialCard testimonial={testimonial} index={i} />
                </motion.div>
              ))}
            </div>
          </div>
        </SectionReveal>
      )}

      {/* Newsletter Signup */}
      <SectionReveal>
        <section className="container mx-auto px-4 !mb-24">
          <Card className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-light to-orange-400 text-primary-foreground text-center border-none shadow-2xl rounded-3xl">
            {/* Background graphic elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/10 blur-3xl mix-blend-overlay"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-black/10 blur-3xl mix-blend-overlay"></div>
            
            <CardHeader className="relative z-10 pt-16 pb-8">
              <CardTitle className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Stay Sweet with Our Newsletter
              </CardTitle>
              <p className="text-primary-foreground/90 text-lg md:text-xl max-w-xl mx-auto font-medium">
                Get the latest updates on new seasonal desserts, exclusive VIP offers, and baking secrets straight to your inbox.
              </p>
            </CardHeader>
            <CardContent className="relative z-10 space-y-6 pb-16">
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto p-2 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                <Input 
                  placeholder="Enter your email address..." 
                  className="bg-white/90 text-zinc-900 border-none h-14 rounded-xl text-lg focus-visible:ring-2 focus-visible:ring-white/50 placeholder:text-zinc-500"
                />
                <Button className="h-14 px-8 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-lg font-semibold shrink-0 transition-all shadow-lg">
                  Subscribe Now
                </Button>
              </div>
              <p className="text-sm font-medium text-white/80">
                Join 10,000+ dessert lovers. Unsubscribe anytime.
              </p>
            </CardContent>
          </Card>
        </section>
      </SectionReveal>
    </div>
  );
};

export default HomePage;