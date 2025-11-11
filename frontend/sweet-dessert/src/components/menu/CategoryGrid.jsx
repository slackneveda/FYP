import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { AuroraText } from '@/components/ui/aurora-text';
import api from '../../services/api';
import './CategoryGrid.css';

// Import category representative images
import cakesImage from '../../assets/images/categories/cakes/Chocolate-Heaven.jpg';
import browniesImage from '../../assets/images/categories/brownies/Nutella-Brownie-7.jpg';
import dessertsImage from '../../assets/images/categories/desserts/Lotus-cheesecake-9.jpg';
import cupcakesImage from '../../assets/images/categories/cupcakes/Red-Velvet-Cupcake.jpg';
import cookiesImage from '../../assets/images/categories/cookies/Nutella.jpg';
import donutsImage from '../../assets/images/categories/mini donuts/Nutella-5.jpg';
import sundaeImage from '../../assets/images/categories/sundae/galaxy-sundae-1.jpg';

const categoryImages = {
  'cakes': cakesImage,
  'brownies': browniesImage,
  'desserts': dessertsImage,
  'cupcakes': cupcakesImage,
  'cookies': cookiesImage,
  'mini-donuts': donutsImage,
  'sundae': sundaeImage
};

const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.getCategories();
      
      // Handle paginated response from DRF
      const categoriesData = response.results ? response.results : response;
      setCategories(categoriesData);
      setError(null);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <ShimmerButton onClick={fetchCategories} className="retry-button">
          Try Again
        </ShimmerButton>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="error-container">
        <p className="error-message">No categories found</p>
        <ShimmerButton onClick={fetchCategories} className="retry-button">
          Reload
        </ShimmerButton>
      </div>
    );
  }

  return (
    <div className="category-container">
      <div className="category-header">
        <h1 className="category-title"><AuroraText>Product Category</AuroraText></h1>
        <p className="category-subtitle">Discover our delicious selection of handcrafted desserts</p>
      </div>
      
      
      <div className="category-grid">
        {categories.map((category) => (
          <Link 
            to={`/menu/${category.slug}`} 
            key={category.id} 
            className="category-card"
          >
            <div className="category-image-wrapper">
              <img 
                src={categoryImages[category.slug] || categoryImages['cakes']} 
                alt={category.name}
                className="category-image"
                onError={(e) => {
                  e.target.src = categoryImages['cakes']; // Fallback image
                }}
              />
              <div className="category-overlay">
                <span className="category-view-text">View Products</span>
              </div>
            </div>
            <div className="category-info">
              <h3 className="category-name">{category.name}</h3>
              <p className="category-count">{category.product_count} products</p>
              {category.description && (
                <p className="category-description">{category.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;