import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Award, Clock, Flame, Leaf, Heart, ShoppingCart, ChefHat, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { AuroraText } from '@/components/ui/aurora-text';
import { DessertCard, CompactDessertCard } from '@/components/DessertCards';
import { desserts, chefRecommendations } from '@/data/desserts';
import { useCart } from '@/contexts/CartProvider';
import apiService from '@/services/api';

// Import actual dessert images from assets
import ChocolateHeaven from '../assets/images/categories/cakes/Chocolate-Heaven.jpg';
import BelgianChocolate from '../assets/images/categories/cakes/Belgian-Chocolate.jpg';
import RedVelvet from '../assets/images/categories/cakes/Red-Velvet.jpg';
import NutellaBrownie from '../assets/images/categories/brownies/Nutella-Brownie-7.jpg';
import ChocolateChunkBrownie from '../assets/images/categories/brownies/Chocolate-chunk-brownie.jpg';
import RedVelvetCupcake from '../assets/images/categories/cupcakes/Red-Velvet-Cupcake.jpg';
import LotusChesecake from '../assets/images/categories/desserts/Lotus-cheesecake-9.jpg';
import NutellaCookies from '../assets/images/categories/cookies/Nutella.jpg';
import GalaxySundae from '../assets/images/categories/sundae/galaxy-sundae-1.jpg';
// Additional chef's pick images
import FerrerroRocherDonut from '../assets/images/categories/mini donuts/Ferrero-Rocher-6.jpg';
import KitkatDonut from '../assets/images/categories/mini donuts/Kitkat-8.jpg';
import LotusDonut from '../assets/images/categories/mini donuts/Lotus-2.jpg';
import OreoDonut from '../assets/images/categories/mini donuts/Oreo-1-500x632.jpg';

// Image mapping for local assets
const localImageMap = {
  '/src/assets/images/categories/cakes/Chocolate-Heaven.jpg': ChocolateHeaven,
  '/src/assets/images/categories/cakes/Belgian-Chocolate.jpg': BelgianChocolate,
  '/src/assets/images/categories/cakes/Red-Velvet.jpg': RedVelvet,
  '/src/assets/images/categories/brownies/Nutella-Brownie-7.jpg': NutellaBrownie,
  '/src/assets/images/categories/brownies/Chocolate-chunk-brownie.jpg': ChocolateChunkBrownie,
  '/src/assets/images/categories/cupcakes/Red-Velvet-Cupcake.jpg': RedVelvetCupcake,
  '/src/assets/images/categories/desserts/Lotus-cheesecake-9.jpg': LotusChesecake,
  '/src/assets/images/categories/cookies/Nutella.jpg': NutellaCookies,
  '/src/assets/images/categories/sundae/galaxy-sundae-1.jpg': GalaxySundae,
};

// Chef's special images array for variety
const chefSpecialImages = [
  BelgianChocolate,
  FerrerroRocherDonut,
  LotusChesecake,
  KitkatDonut,
  GalaxySundae,
  OreoDonut
];

// Function to get product image - prioritizes local assets
const getProductImage = (imagePath) => {
  try {
    // First check if we have a local asset for this path
    if (imagePath && localImageMap[imagePath]) {
      return localImageMap[imagePath];
    }
    
    // Convert backend path to check local mapping
    if (imagePath && imagePath.startsWith('/src/')) {
      const mappedImage = localImageMap[imagePath];
      if (mappedImage) {
        return mappedImage;
      }
      
      // Fallback: try to construct path dynamically
      let relativePath = imagePath.replace('/src/', '../');
      relativePath = relativePath.replace('/categories/mini-donuts/', '/categories/mini donuts/');
      return new URL(relativePath, import.meta.url).href;
    }
    
    // Return external URLs as-is
    if (imagePath && (imagePath.startsWith('http') || imagePath.startsWith('/'))) {
      return imagePath;
    }
    
    // Default fallback to one of our local images
    return ChocolateHeaven;
  } catch (error) {
    console.error('Error loading image:', imagePath, error);
    // Return a local fallback image
    return ChocolateHeaven;
  }
};

const FeaturedPage = () => {
  const [activeTab, setActiveTab] = useState('seasonal');
  const [dessertsList, setDessertsList] = useState(desserts);
  const [chefRecommendationsList, setChefRecommendationsList] = useState(chefRecommendations);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addItem } = useCart();

  // Fetch data from backend
  useEffect(() => {
    const fetchFeaturedData = async () => {
      try {
        setLoading(true);
        
        // Fetch all desserts from backend API
        try {
          const dessertsResponse = await apiService.getDesserts();
          // Handle paginated response from DRF
          const dessertsData = dessertsResponse.results ? dessertsResponse.results : dessertsResponse;
          
          if (dessertsData && dessertsData.length > 0) {
            setDessertsList(dessertsData);
          } else {
            setDessertsList(desserts); // Fallback to static data
          }
        } catch (error) {
          console.warn('Backend unavailable for desserts, using fallback data', error);
          setDessertsList(desserts);
        }

        // Fetch chef recommendations from backend
        try {
          const chefRecsResponse = await apiService.getChefRecommendations();
          const chefRecsData = chefRecsResponse.results ? chefRecsResponse.results : chefRecsResponse;
          
          if (chefRecsData && chefRecsData.length > 0) {
            // Transform backend chef recommendations to match frontend format
            const transformedRecs = chefRecsData.map(rec => ({
              id: rec.dessert_item?.id || rec.id,
              name: rec.dessert_item?.name || rec.name,
              description: rec.dessert_item?.description || rec.description,
              price: rec.dessert_item?.price || rec.price,
              image: rec.dessert_item?.image || rec.image,
              rating: rec.dessert_item?.rating || rec.rating,
              reviews_count: rec.dessert_item?.reviews_count || rec.reviews_count,
              chefReason: rec.reason,
              category: rec.dessert_item?.category || rec.category
            }));
            setChefRecommendationsList(transformedRecs);
          } else {
            setChefRecommendationsList(chefRecommendations); // Fallback to static data
          }
        } catch (error) {
          console.warn('Backend unavailable for chef recommendations, using fallback data', error);
          setChefRecommendationsList(chefRecommendations);
        }



      } catch (error) {
        console.error('Error fetching featured data:', error);
        setError('Unable to load featured data. Please try again later.');
        // Use fallback data
        setDessertsList(desserts);
        setChefRecommendationsList(chefRecommendations);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedData();
  }, []);

  const handleAddToCart = (dessert) => {
    addItem({
      id: dessert.id,
      name: dessert.name,
      price: parseFloat(dessert.price), // Convert string to number
      image: dessert.image,
      quantity: 1,
      customizations: {}
    });
  };

  const seasonalDesserts = dessertsList.filter(dessert => 
    dessert.seasonal || dessert.is_seasonal || 
    (dessert.featured && (dessert.seasonal || dessert.is_seasonal)) ||
    dessert.is_featured
  ).slice(0, 6);
  
  const bestSellers = dessertsList.filter(dessert => 
    dessert.bestSeller || dessert.best_seller || dessert.is_bestseller || 
    dessert.is_popular || (dessert.featured && dessert.best_seller)
  ).slice(0, 6);
  
  const chefsPicks = chefRecommendationsList.map(rec => {
    // For backend data format (dessert_item nested structure)
    if (rec.dessert_item) {
      return {
        ...rec.dessert_item,
        chefReason: rec.reason || "Personally recommended by our head chef for its exceptional quality and taste.",
        image: rec.dessert_item.image || 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&h=500&fit=crop'
      };
    }
    // For transformed backend data (already processed in useEffect)
    if (rec.chefReason) {
      return {
        ...rec,
        image: rec.image || 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&h=500&fit=crop'
      };
    }
    // For static data format (fallback)
    const dessert = dessertsList.find(d => d.id === rec.id);
    if (dessert) {
      return {
        ...dessert,
        chefReason: rec.reason || "Personally recommended by our head chef for its exceptional quality and taste.",
        image: dessert.image || 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&h=500&fit=crop',
        // Ensure all required fields
        rating: dessert.rating || '4.8',
        price: dessert.price?.toString() || '500'
      };
    }
    // Return the recommendation as-is with fallback data
    return {
      id: rec.id || `chef-pick-${Math.random()}`,
      name: rec.name || 'Chef Special Dessert',
      description: rec.description || 'A delicious dessert specially recommended by our chef.',
      price: rec.price || '500',
      rating: rec.rating || '4.8',
      image: rec.image || 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&h=500&fit=crop',
      chefReason: rec.reason || "Personally recommended by our head chef for its exceptional quality and taste."
    };
  }).filter(Boolean).slice(0, 4);

  const tabs = [
    { id: 'seasonal', label: 'Seasonal Specials', icon: Calendar },
    { id: 'chef', label: "Chef's Picks", icon: ChefHat },
    { id: 'bestsellers', label: 'Best Sellers', icon: Flame }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading featured desserts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-16">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mx-4">
          <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4 text-center space-y-6">
          <Badge variant="default" className="text-lg px-4 py-2">
            ✨ Featured Collection
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            <AuroraText>Handpicked Just for You</AuroraText>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            From seasonal sensations to chef's signature delights, indulge in the desserts everyone's talking about.
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <ShimmerButton
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'mint'}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center space-x-2"
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </ShimmerButton>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {/* Seasonal Specials */}
          {activeTab === 'seasonal' && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-foreground flex items-center justify-center space-x-2">
                  <Leaf className="h-8 w-8 text-green-600" />
                  <AuroraText>Autumn Seasonal Collection</AuroraText>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Embrace the flavors of fall with our limited-time seasonal desserts, 
                  featuring warm spices and seasonal ingredients.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {seasonalDesserts.map((dessert) => (
                  <CompactDessertCard 
                    key={dessert.id}
                    dessert={{
                      ...dessert,
                      image: getProductImage(dessert.image),
                      reviews: dessert.reviews || dessert.review_count || '0'
                    }} 
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Chef's Recommendations */}
          {activeTab === 'chef' && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-foreground flex items-center justify-center space-x-2">
                  <ChefHat className="h-8 w-8 text-primary" />
                  <AuroraText>Chef Maria's Recommendations</AuroraText>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Our head pastry chef personally selects these exceptional desserts 
                  that showcase the finest techniques and premium ingredients.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {chefsPicks.map((dessert, index) => (
                  <CompactDessertCard 
                    key={dessert.id}
                    dessert={{
                      ...dessert,
                      // Use different images from chef's special collection
                      image: chefSpecialImages[index % chefSpecialImages.length],
                      reviews: dessert.reviews || dessert.review_count || '0'
                    }} 
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Best Sellers */}
          {activeTab === 'bestsellers' && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-foreground flex items-center justify-center space-x-2">
                  <Flame className="h-8 w-8 text-orange-500" />
                  <AuroraText>Customer Favorites</AuroraText>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  These are the desserts our customers can't stop ordering. 
                  Tried, tested, and absolutely loved by thousands.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {bestSellers.map((dessert) => (
                  <CompactDessertCard 
                    key={dessert.id}
                    dessert={{
                      ...dessert,
                      image: getProductImage(dessert.image),
                      reviews: dessert.reviews || dessert.review_count || '0'
                    }} 
                      onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </div>
          )}


        </div>
      </section>


    </div>
  );
};

export default FeaturedPage;