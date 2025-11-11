// cspell:disable
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Heart, Award, Users, Clock } from 'lucide-react';
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

const HomePage = () => {
  const [featuredDesserts, setFeaturedDesserts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [testimonialsList, setTestimonialsList] = useState([]);
  const [heroVideoUrl, setHeroVideoUrl] = useState(null);
  const [videoLoading, setVideoLoading] = useState(true);
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
            // Fallback: fetch all desserts and filter featured ones
            const allDessertsResponse = await apiService.getDesserts();
            const allDessertsData = allDessertsResponse.results ? allDessertsResponse.results : allDessertsResponse;
            const featuredItems = allDessertsData.filter(dessert => 
              dessert.featured || dessert.is_featured || dessert.seasonal || dessert.is_seasonal
            );
            setFeaturedDesserts(featuredItems.slice(0, 3));
          }
        } catch {
          console.warn('Backend unavailable, using fallback data for featured desserts');
          setFeaturedDesserts(desserts.filter(dessert => dessert.featured).slice(0, 3));
        }

        // Fetch best sellers from backend  
        try {
          const bestSellersResponse = await apiService.getDesserts({ best_seller: 'true' });
          let bestSellersData = bestSellersResponse.results ? bestSellersResponse.results : bestSellersResponse;
          
          if (!bestSellersData || bestSellersData.length === 0) {
            // Fallback: fetch all and filter best sellers
            const allDessertsResponse = await apiService.getDesserts();
            const allDessertsData = allDessertsResponse.results ? allDessertsResponse.results : allDessertsResponse;
            bestSellersData = allDessertsData.filter(dessert => 
              dessert.best_seller || dessert.is_bestseller || dessert.featured || dessert.is_featured
            );
          }
          setBestSellers(bestSellersData.slice(0, 4));
        } catch {
          console.warn('Backend unavailable, using fallback data for best sellers');
          setBestSellers(desserts.filter(dessert => dessert.bestSeller).slice(0, 4));
        }

        // Fetch testimonials from backend
        try {
          const testimonialsResponse = await apiService.getTestimonials();
          // Handle the API response structure: {testimonials: [...], count: 8}
          const testimonialsData = testimonialsResponse.testimonials || testimonialsResponse.results || testimonialsResponse;
          if (testimonialsData && testimonialsData.length > 0) {
            setTestimonialsList(testimonialsData);
          }
        } catch {
          console.warn('Backend unavailable for testimonials');
        }

        // Fetch hero video from backend
        try {
          const videoResponse = await fetch('http://localhost:8000/api/hero-video/');
          const videoData = await videoResponse.json();
          if (videoData.success && videoData.video_url) {
            setHeroVideoUrl(videoData.video_url);
          }
        } catch {
          console.warn('Hero video unavailable from backend');
        } finally {
          setVideoLoading(false);
        }

      } catch (error) {
        console.error('Error fetching homepage data:', error);
        setError('Unable to load some content. Please try again later.');
        
        // Use fallback data
        setFeaturedDesserts(desserts.filter(dessert => dessert.featured).slice(0, 3));
        setBestSellers(desserts.filter(dessert => dessert.bestSeller).slice(0, 4));
        // No fallback for testimonials - force backend usage
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = (dessert) => {
    console.log('Adding dessert to cart:', dessert);
    const cartItem = {
      id: dessert.id,
      name: dessert.name,
      price: parseFloat(dessert.price), // Convert string to number
      image: dessert.image,
      quantity: 1,
      customizations: {}
    };
    console.log('Cart item structure:', cartItem);
    addItem(cartItem);
  };

  const stats = [
    { icon: "👥", label: "Happy Customers", value: "10,000+", color: "orange" },
    { icon: "🏆", label: "Awards Won", value: "25+", color: "blue" },
    { icon: "⏰", label: "Years Experience", value: "15+", color: "green" },
    { icon: "❤️", label: "Desserts Made", value: "50,000+", color: "purple" },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading delicious content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-16">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50/90 dark:bg-red-900/30 backdrop-blur-md border border-red-200 dark:border-red-800 rounded-lg p-4 mx-4 mt-4">
            <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}
        
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Fullscreen Video Background */}
        <div className="absolute inset-0 w-full h-full">
          {videoLoading || !heroVideoUrl ? (
            // Loading state or fallback background
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              {videoLoading ? (
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
                  <p className="text-primary/70 text-lg">Loading video...</p>
                </div>
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1920&h=1080&fit=crop"
                  alt="Delicious desserts"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ) : (
            // Fullscreen Video
            <div className="relative w-full h-full">
              <video
                className="w-full h-full object-cover"
                style={{ aspectRatio: '9/16' }}
                autoPlay
                muted
                loop
                playsInline
                onError={() => setVideoLoading(true)}
              >
                <source src={heroVideoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              {/* Video overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/40"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30"></div>
            </div>
          )}
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 min-h-screen flex items-center">
            <div className="container mx-auto px-4 py-16">
              <div className="max-w-4xl mx-auto text-center space-y-8">
                <Badge variant="secondary" className="w-fit bg-white/20 backdrop-blur-md text-white border-white/30">
                  ✨ Fresh Daily Made
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold leading-tight text-white">
                  <span className="text-white"><AuroraText>Sweet Dreams</AuroraText></span>
                  <span className="text-orange-300 block">Come True</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto">
                  Whispers of sweetness, crafted with care. From delicate pastries to 
                  decadent delights, every bite is an embrace of pure pleasure.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
                  <ShimmerButton asChild size="lg" className="text-xl px-12 py-4 bg-orange-600 hover:bg-orange-700">
                    <Link to="/menu" className="flex items-center justify-center">
                      Explore Menu
                      <ArrowRight className="ml-2 h-6 w-6" />
                    </Link>
                  </ShimmerButton>
                  <ShimmerButton asChild variant="outline" size="lg" className="text-xl px-12 py-4 border-white text-white hover:bg-white hover:text-black">
                    <Link to="/featured" className="flex items-center justify-center">View Featured</Link>
                  </ShimmerButton>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* Stats Section - 3D Interactive Cards */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              <AuroraText>Our Sweet Achievements</AuroraText>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience our journey through these interactive cards
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
            {stats.map((stat, index) => (
              <StatsCard 
                key={index}
                icon={stat.icon}
                number={stat.value}
                label={stat.label}
                color={stat.color}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Desserts */}
      <section className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            <AuroraText>Featured Desserts</AuroraText>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our chef's special selections and seasonal favorites
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
          {featuredDesserts.map((dessert) => (
            <DessertCard 
              key={dessert.id} 
              dessert={{
                ...dessert,
                image: getProductImage(dessert.image)
              }} 
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
        
        <div className="text-center mt-8">
          <ShimmerButton variant="caramel" asChild className="px-12 py-3 text-lg min-w-[280px]">
            <Link to="/menu" className="flex items-center justify-center">
              View All Desserts
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </ShimmerButton>
        </div>
      </section>

      {/* About Us Section */}
      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                <AuroraText>Our Sweet Story</AuroraText>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                In 2024, with a heart full of passion and a kitchen filled with the aroma of fresh bakes, 
                Noor Ahmed set out to turn a lifelong dream into reality. That dream became Sweet Dessert – 
                a place where every treat is crafted to spark joy, stir memories, and create moments worth cherishing.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                What began as a humble space with a single oven quickly became a local treasure, known for 
                irresistible flavors and desserts that feel like a hug in every bite. Noor's vision was simple: 
                blend the purest ingredients with creativity, artistry, and a sprinkle of magic.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, Sweet Dessert is more than just a bakery – it's a haven for dessert lovers, 
                a gathering spot for friends, and a place where every creation is made with love, care, 
                and traditions infused with a modern twist.
              </p>
              <p className="text-muted-foreground leading-relaxed italic">
                Because here, we believe life should be savored… one sweet bite at a time.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Handcrafted</Badge>
                  <Badge variant="outline">Premium Quality</Badge>
                  <Badge variant="outline">Local Ingredients</Badge>
                </div>
              </div>
              <ShimmerButton variant="caramel" asChild className="px-8 py-2">
                <Link to="/about">Learn More About Us</Link>
              </ShimmerButton>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-6">
                <img
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop"
                  alt="Our bakery"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            <AuroraText>Customer Favorites</AuroraText>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The desserts our customers can't stop talking about
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {bestSellers.slice(0, 3).map((dessert) => (
            <DessertCard 
              key={dessert.id} 
              dessert={{
                ...dessert,
                image: getProductImage(dessert.image)
              }} 
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              <AuroraText>What Our Customers Say</AuroraText>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real reviews from real dessert lovers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
            {testimonialsList.slice(0, 3).map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="container mx-auto px-4">
        <Card className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground text-center p-8">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl mb-4">
              <AuroraText>Stay Sweet with Our Newsletter</AuroraText>
            </CardTitle>
            <p className="text-primary-foreground/90 max-w-md mx-auto">
              Get the latest updates on new desserts, special offers, and baking tips
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input 
                placeholder="Enter your email" 
                className="bg-background text-foreground"
              />
              <Button variant="secondary">Subscribe</Button>
            </div>
            <p className="text-sm text-primary-foreground/80">
              Join 5,000+ dessert lovers. Unsubscribe anytime.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default HomePage;