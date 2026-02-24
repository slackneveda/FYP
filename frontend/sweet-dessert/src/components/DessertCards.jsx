// cspell:disable
import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { Star, ShoppingCart, Quote } from "lucide-react";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { formatPriceWithCurrency } from "@/utils/priceUtils";

export function DessertCard({ dessert, onAddToCart }) {
  return (
    <CardContainer className="inter-var">
      <CardBody className="bg-card relative group/card dark:hover:shadow-2xl dark:hover:shadow-orange-500/[0.1] border-border w-auto sm:w-[22rem] h-auto rounded-xl p-6 border shadow-sm hover:shadow-md transition-all duration-300">
        <CardItem
          translateZ="50"
          className="text-xl font-bold text-foreground mb-2">
          {dessert?.name || "Delicious Dessert"}
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className="text-muted-foreground text-sm leading-relaxed mb-4">
          {dessert?.description || "Indulge in our signature sweet creation"}
        </CardItem>
        <CardItem translateZ="100" className="w-full mb-4">
          <img
            src={dessert?.image || "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=2564&auto=format&fit=crop&ixlib=rb-4.0.3"}
            height="1000"
            width="1000"
            className="h-48 w-full object-cover rounded-xl group-hover/card:shadow-xl"
            alt={dessert?.name || "dessert"} />
        </CardItem>
        
        {/* Rating Section */}
        {dessert?.rating && (
          <CardItem translateZ="40" className="flex items-center space-x-1 mb-4">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-foreground">{dessert.rating}</span>
            {dessert?.reviews && (
              <span className="text-sm text-muted-foreground">
                ({dessert.reviews} reviews)
              </span>
            )}
          </CardItem>
        )}
        
        <div className="flex justify-between items-center mt-4">
          <CardItem
            translateZ={20}
            className="px-3 py-1 rounded-lg bg-primary/10 text-lg font-bold text-primary">
            {formatPriceWithCurrency(dessert?.price || 399)}
          </CardItem>
          <CardItem
            translateZ={20}
            as="div">
            <ShimmerButton 
              variant="chocolate"
              size="sm"
              onClick={() => onAddToCart && onAddToCart(dessert)}
              className="px-4 py-2 text-sm font-semibold">
              <ShoppingCart className="h-3 w-3 mr-1" />
              Add to Cart
            </ShimmerButton>
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
}

export function StatsCard({ icon, number, label }) {
  return (
    <CardContainer className="inter-var">
      <CardBody className="bg-gradient-to-br from-orange-700 to-orange-800 dark:from-orange-800 dark:to-orange-900 relative group/card dark:hover:shadow-2xl border-0 w-auto sm:w-[20rem] h-auto rounded-xl p-8 shadow-lg shadow-orange-700/20 dark:shadow-orange-800/25 hover:shadow-orange-700/35 dark:hover:shadow-orange-800/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardItem
          translateZ="50"
          className="text-4xl mb-4 text-orange-50 opacity-95">
          {icon}
        </CardItem>
        <CardItem
          translateZ="60"
          className="text-3xl font-bold text-orange-50 mb-2">
          {number}
        </CardItem>
        <CardItem
          as="p"
          translateZ="40"
          className="text-orange-100 text-base opacity-90">
          {label}
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}

export function CompactDessertCard({ dessert, onAddToCart }) {
  return (
    <CardContainer className="inter-var">
      <CardBody className="bg-card relative group/card dark:hover:shadow-2xl dark:hover:shadow-orange-500/[0.1] border-border w-auto sm:w-[18rem] h-auto rounded-xl p-4 border shadow-sm hover:shadow-md transition-all duration-300">
        <CardItem translateZ="100" className="w-full mb-3">
          <img
            src={dessert?.image || "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=2564&auto=format&fit=crop&ixlib=rb-4.0.3"}
            height="800"
            width="800"
            className="h-32 w-full object-cover rounded-lg group-hover/card:shadow-xl"
            alt={dessert?.name || "dessert"} />
        </CardItem>
        
        <CardItem
          translateZ="50"
          className="text-lg font-bold text-foreground mb-1 line-clamp-1">
          {dessert?.name || "Delicious Dessert"}
        </CardItem>
        
        <CardItem
          as="p"
          translateZ="60"
          className="text-muted-foreground text-xs leading-relaxed mb-3 line-clamp-2">
          {dessert?.description || "Indulge in our signature sweet creation"}
        </CardItem>
        
        {/* Rating Section */}
        {dessert?.rating && (
          <CardItem translateZ="40" className="flex items-center space-x-1 mb-3">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium text-foreground">{dessert.rating}</span>
            {dessert?.reviews && (
              <span className="text-xs text-muted-foreground">
                ({dessert.reviews})
              </span>
            )}
          </CardItem>
        )}
        
        <div className="flex justify-between items-center">
          <CardItem
            translateZ={20}
            className="px-2 py-1 rounded-md bg-primary/10 text-sm font-bold text-primary">
            {formatPriceWithCurrency(dessert?.price || 399)}
          </CardItem>
          <CardItem
            translateZ={20}
            as="div">
            <ShimmerButton 
              variant="chocolate"
              size="sm"
              onClick={() => onAddToCart && onAddToCart(dessert)}
              className="px-3 py-1 text-xs font-semibold">
              <ShoppingCart className="h-2 w-2 mr-1" />
              Add to Cart
            </ShimmerButton>
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
}

export function TestimonialCard({ testimonial, index = 0 }) {
  // Funky vibrant background options based on index
  const bgVariants = [
    "from-rose-100 to-teal-50 dark:from-rose-950/40 dark:to-teal-900/40 border-rose-200 dark:border-rose-900/50",
    "from-amber-50 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40 border-orange-200 dark:border-orange-900/50",
    "from-indigo-50 to-fuchsia-100 dark:from-indigo-950/40 dark:to-fuchsia-950/40 border-fuchsia-200 dark:border-fuchsia-900/50",
    "from-emerald-50 to-sky-100 dark:from-emerald-950/40 dark:to-sky-950/40 border-sky-200 dark:border-sky-900/50"
  ];
  const iconColors = [
    "text-rose-500", "text-orange-500", "text-fuchsia-500", "text-sky-500"
  ];
  
  const bgClass = bgVariants[index % bgVariants.length];
  const iconColor = iconColors[index % iconColors.length];

  return (
    <CardContainer className="inter-var">
      <CardBody className={`relative group/card w-full sm:w-[24rem] h-auto rounded-[2rem] p-8 border-2 shadow-sm hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${bgClass}`}>
        
        {/* Subtle decorative elements behind the card items */}
        <div className={`absolute top-0 right-0 p-8 opacity-10 ${iconColor}`}>
          <Quote size={120} />
        </div>

        <CardItem
          translateZ="60"
          className="relative z-10 flex flex-col h-full justify-between"
        >
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-1">
                {[...Array(testimonial?.rating || 5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-500 drop-shadow-sm" />
                ))}
              </div>
              <Quote className={`h-8 w-8 ${iconColor} opacity-50`} />
            </div>
            
            <p className="text-foreground/90 font-medium mb-8 text-lg leading-relaxed font-display">
              "{testimonial?.text || 'Amazing experience with great quality desserts! Highly recommend.'}"
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-auto">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-display font-bold text-xl shadow-inner bg-gradient-to-br from-primary to-primary-light`}>
              {testimonial?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div>
              <p className="font-bold text-foreground text-lg tracking-tight">
                {testimonial?.name || 'Happy Customer'}
              </p>
              <p className="text-muted-foreground text-sm font-medium">Sweet Enthusiast</p>
            </div>
          </div>
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}