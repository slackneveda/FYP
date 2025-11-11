import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartProvider';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { AuroraText } from '@/components/ui/aurora-text';
import { CompactDessertCard } from '@/components/DessertCards';
import api from '../services/api';
import './CategoryProductsPage.css';

// Function to dynamically import images
const getProductImage = (imagePath) => {
  try {
    // Extract the path relative to src
    let relativePath = imagePath.replace('/src/', '../');
    // Fix folder name mapping - database uses hyphens but actual folders use spaces
    relativePath = relativePath.replace('/categories/mini-donuts/', '/categories/mini donuts/');
    return new URL(relativePath, import.meta.url).href;
  } catch (error) {
    console.error('Error loading image:', imagePath, error);
    return '/placeholder.jpg'; // Fallback image
  }
};

const CategoryProductsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const { addItem } = useCart();

  const fetchCategoryAndProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching data for category slug:', slug);

      // Fetch all categories to find the current one
      console.log('Fetching categories...');
      const categoriesResponse = await api.getCategories();
      const categoriesData = categoriesResponse.results ? categoriesResponse.results : categoriesResponse;
      console.log('Categories data:', categoriesData);
      
      const currentCategory = categoriesData.find(cat => cat.slug === slug);
      console.log('Current category found:', currentCategory);
      setCategory(currentCategory);

      // Fetch products in this category using the category slug as filter
      console.log('Fetching products for category:', slug);
      const productsResponse = await api.getDesserts({ category: slug });
      console.log('Products response:', productsResponse);
      
      const productsData = productsResponse.results ? productsResponse.results : productsResponse;
      console.log('Products data:', productsData);
      setProducts(productsData);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchCategoryAndProducts();
  }, [fetchCategoryAndProducts]);

  const handleAddToCart = (product) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price), // Convert string to number
      image: product.image,
      category: product.category_name,
      quantity: 1
    };
    
    addItem(cartItem);
    
    // Show success message or feedback here if needed
    console.log('Added to cart:', cartItem);
  };

  // Utility functions now handled by CompactDessertCard component

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <ShimmerButton onClick={fetchCategoryAndProducts} className="retry-button">
          Try Again
        </ShimmerButton>
        <Link to="/menu" className="back-to-menu">
          ← Back to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="category-products-container">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/menu" className="breadcrumb-link">Menu</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{category?.name}</span>
      </nav>
      
      {/* Category Header */}
      <div className="category-header">
        <ShimmerButton onClick={() => navigate('/menu')} className="back-button" variant="caramel">
          ← Back to Categories
        </ShimmerButton>
        <h1 className="category-title"><AuroraText>{category?.name}</AuroraText></h1>
        {category?.description && (
          <p className="category-description">{category.description}</p>
        )}
        <div className="category-stats">
          <span className="products-count">{products.length} products available</span>
          {products.filter(p => p.featured).length > 0 && (
            <span className="featured-count">
              {products.filter(p => p.featured).length} featured items
            </span>
          )}
        </div>
      </div>
      
      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="no-products">
          <h3>No products available</h3>
          <p>This category is being updated. Please check back soon!</p>
          <Link to="/menu" className="back-to-menu-btn">
            Browse Other Categories
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-20 px-8 py-8">
          {products.map((product) => (
            <CompactDessertCard 
              key={product.id}
              dessert={{
                ...product,
                image: getProductImage(product.image),
                reviews: product.reviews_count || '0',
                rating: product.rating || '4.5'
              }} 
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryProductsPage;