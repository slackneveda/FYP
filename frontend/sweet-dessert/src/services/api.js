// API service for communication with Django backend
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Helper function to get CSRF token
function getCSRFToken() {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrftoken') {
      return value;
    }
  }
  return null;
}

class ApiService {
  // Generic HTTP methods for CMS endpoints
  async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error with GET ${endpoint}:`, error);
      throw error;
    }
  }

  async post(endpoint, data) {
    try {
      const csrfToken = getCSRFToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }
      
      console.log(`POST ${API_BASE_URL}${endpoint}`, {
        headers,
        data,
        hasCSRF: !!csrfToken
      });
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(data)
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response:`, errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: `HTTP ${response.status}: ${errorText || 'Unknown error'}` };
        }
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error with POST ${endpoint}:`, error);
      throw error;
    }
  }

  async put(endpoint, data) {
    try {
      const csrfToken = getCSRFToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error with PUT ${endpoint}:`, error);
      throw error;
    }
  }

  async delete(endpoint) {
    try {
      const csrfToken = getCSRFToken();
      const headers = {};
      
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: headers,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // DELETE might return empty response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return { success: true };
    } catch (error) {
      console.error(`Error with DELETE ${endpoint}:`, error);
      throw error;
    }
  }

  async createPaymentIntent(orderData) {
    try {
      const response = await fetch(`${API_BASE_URL}/create-payment-intent/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async confirmPayment(paymentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/confirm-payment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  async getOrder(orderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  async getOrders() {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  // ===== NEW ENDPOINTS FOR FRONTEND INTEGRATION =====

  async getDesserts(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const url = `${API_BASE_URL}/desserts/?${params}`;
      console.log('Making API call to:', url);
      console.log('Filters:', filters);
      
      const response = await fetch(url);
      
      console.log('Desserts API Response status:', response.status);
      console.log('Desserts API Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Desserts API Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Desserts API Response data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching desserts:', error);
      throw error;
    }
  }

  async getFeaturedDesserts() {
    try {
      const response = await fetch(`${API_BASE_URL}/featured-desserts/`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching featured desserts:', error);
      throw error;
    }
  }

  async getCategories() {
    try {
      console.log('Making API call to:', `${API_BASE_URL}/categories/`);
      const response = await fetch(`${API_BASE_URL}/categories/`);
      
      console.log('API Response status:', response.status);
      console.log('API Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API Response data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getTestimonials() {
    try {
      const response = await fetch(`${API_BASE_URL}/testimonials/`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }
  }

  async getChefRecommendations() {
    try {
      const response = await fetch(`${API_BASE_URL}/chef-recommendations/`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching chef recommendations:', error);
      throw error;
    }
  }

  async submitContact(contactData) {
    try {
      const response = await fetch(`${API_BASE_URL}/contact/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw error;
    }
  }

  async createOrder(orderData) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getPaymentDetails(paymentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw error;
    }
  }

  async getPaymentsList() {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payments list:', error);
      throw error;
    }
  }

  // ===== FAQ CMS ENDPOINTS =====
  
  // FAQ Page endpoints
  async getFAQPage() {
    return this.get('/cms/faq/active/');
  }

  async getAllFAQPages() {
    return this.get('/cms/faq/');
  }

  async createFAQPage(data) {
    return this.post('/cms/faq/', data);
  }

  async updateFAQPage(id, data) {
    return this.put(`/cms/faq/${id}/`, data);
  }

  async deleteFAQPage(id) {
    return this.delete(`/cms/faq/${id}/`);
  }

  // FAQ Category endpoints
  async getFAQCategories(faqPageId = null) {
    const params = faqPageId ? `?faq_page_id=${faqPageId}` : '';
    return this.get(`/cms/faq-categories/${params}`);
  }

  async createFAQCategory(data) {
    return this.post('/cms/faq-categories/', data);
  }

  async updateFAQCategory(id, data) {
    return this.put(`/cms/faq-categories/${id}/`, data);
  }

  async deleteFAQCategory(id) {
    return this.delete(`/cms/faq-categories/${id}/`);
  }

  // FAQ Item endpoints
  async getFAQItems(categoryId = null) {
    const params = categoryId ? `?category_id=${categoryId}` : '';
    return this.get(`/cms/faq-items/${params}`);
  }

  async createFAQItem(data) {
    return this.post('/cms/faq-items/', data);
  }

  async updateFAQItem(id, data) {
    return this.put(`/cms/faq-items/${id}/`, data);
  }

  async deleteFAQItem(id) {
    return this.delete(`/cms/faq-items/${id}/`);
  }
}

const apiService = new ApiService();
export default apiService;
export { apiService as api };