import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { CartProvider } from '@/contexts/CartProvider';
import AuthProvider from '@/contexts/AuthContext';
import { Toaster } from 'sonner';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import ProtectedRoute from '@/components/ProtectedRoute';

// Lazy load other pages for code splitting
const MenuPage = React.lazy(() => import('@/pages/MenuPage'));
const CategoryProductsPage = React.lazy(() => import('@/pages/CategoryProductsPage'));
const FeaturedPage = React.lazy(() => import('@/pages/FeaturedPage'));
const ContactPage = React.lazy(() => import('@/pages/ContactPage'));
const FAQPage = React.lazy(() => import('@/pages/FAQPage'));
const AboutPage = React.lazy(() => import('@/pages/AboutPage'));
const OurStoryPage = React.lazy(() => import('@/pages/OurStoryPage'));
const ChatAssistantPage = React.lazy(() => import('@/pages/ChatAssistantPage'));
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage'));
const SignInPage = React.lazy(() => import('@/pages/SignInPage'));
const SignUpPage = React.lazy(() => import('@/pages/SignUpPage'));

// Admin components
const AdminLayout = React.lazy(() => import('@/components/admin/AdminLayout'));
const AdminDashboard = React.lazy(() => import('@/components/admin/AdminDashboard'));
const AdminUsers = React.lazy(() => import('@/components/admin/AdminUsers'));
const AdminOrders = React.lazy(() => import('@/components/admin/AdminOrders'));
const AdminProducts = React.lazy(() => import('@/components/admin/AdminProducts'));
const AdminContacts = React.lazy(() => import('@/components/admin/AdminContacts'));
const AdminCategories = React.lazy(() => import('@/components/admin/AdminCategories'));
const AdminTestimonials = React.lazy(() => import('@/components/admin/AdminTestimonials'));
const AdminChefRecommendations = React.lazy(() => import('@/components/admin/AdminChefRecommendations'));
const AdminOrderItems = React.lazy(() => import('@/components/admin/AdminOrderItems'));
const AdminAboutUs = React.lazy(() => import('@/components/admin/AdminAboutUs'));
const AdminOurStory = React.lazy(() => import('@/components/admin/AdminOurStory'));
const AdminFAQ = React.lazy(() => import('@/components/admin/AdminFAQ'));
const AdminChatAssistant = React.lazy(() => import('@/components/admin/AdminChatAssistant'));

const CartPage = React.lazy(() => import('@/pages/CartPage'));
const OrderTypeSelectionPage = React.lazy(() => import('@/pages/OrderTypeSelectionPage'));
const TakeAwayInfoPage = React.lazy(() => import('@/pages/TakeAwayInfoPage'));  
const CheckoutPage = React.lazy(() => import('@/pages/CheckoutPage'));
const OrderConfirmationPage = React.lazy(() => import('@/pages/OrderConfirmationPage'));
const PaymentSuccessPage = React.lazy(() => import('@/pages/PaymentSuccessPage'));

// Footer pages
const PrivacyPolicyPage = React.lazy(() => import('@/pages/PrivacyPolicyPage'));
const TermsOfServicePage = React.lazy(() => import('@/pages/TermsOfServicePage'));
const CookiePolicyPage = React.lazy(() => import('@/pages/CookiePolicyPage'));
const AccessibilityPage = React.lazy(() => import('@/pages/AccessibilityPage'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
  </div>
);

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="sweet-dessert-theme">
      <Router>
        <AuthProvider>
          <CartProvider>
            <div className="App">
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route 
                    path="menu" 
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <MenuPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="menu/:slug" 
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <CategoryProductsPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="featured" 
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <FeaturedPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="contact" 
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <ContactPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="faq" 
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <FAQPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="about" 
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AboutPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="story" 
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <OurStoryPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="chat-assistant" 
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <ChatAssistantPage />
                      </Suspense>
                    } 
                  />

                  
                  {/* Authentication pages */}
                  <Route 
                    path="signin" 
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <SignInPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="signup" 
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <SignUpPage />
                      </Suspense>
                    } 
                  />

                  {/* Protected routes */}
                  <Route 
                    path="dashboard" 
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      </Suspense>
                    } 
                  />

                  {/* Shopping cart and checkout */}
                  <Route 
                    path="cart" 
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <CartPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="order-type" 
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <OrderTypeSelectionPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="takeaway-info" 
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <TakeAwayInfoPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="checkout" 
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <CheckoutPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="order-confirmation" 
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <OrderConfirmationPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="payment-success" 
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <PaymentSuccessPage />
                      </Suspense>
                    } 
                  />

                  {/* Footer pages */}
                  <Route 
                    path="privacy" 
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <PrivacyPolicyPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="terms" 
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <TermsOfServicePage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="cookies" 
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <CookiePolicyPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="accessibility" 
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AccessibilityPage />
                      </Suspense>
                    } 
                  />
                </Route>
                
                {/* Admin routes - separate from main layout */}
                <Route 
                  path="/admin" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AdminLayout>
                        <AdminDashboard />
                      </AdminLayout>
                    </Suspense>
                  } 
                />
                <Route 
                  path="/admin/users" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AdminLayout>
                        <AdminUsers />
                      </AdminLayout>
                    </Suspense>
                  } 
                />
                <Route 
                  path="/admin/orders" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AdminLayout>
                        <AdminOrders />
                      </AdminLayout>
                    </Suspense>
                  } 
                />
                <Route 
                  path="/admin/chat-assistant" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AdminLayout>
                        <AdminChatAssistant />
                      </AdminLayout>
                    </Suspense>
                  } 
                />
                <Route 
                  path="/admin/products" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AdminLayout>
                        <AdminProducts />
                      </AdminLayout>
                    </Suspense>
                  } 
                />
                <Route 
                  path="/admin/categories" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AdminLayout>
                        <AdminCategories />
                      </AdminLayout>
                    </Suspense>
                  } 
                />
                <Route 
                  path="/admin/testimonials" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AdminLayout>
                        <AdminTestimonials />
                      </AdminLayout>
                    </Suspense>
                  } 
                />
                <Route 
                  path="/admin/chef-recommendations" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AdminLayout>
                        <AdminChefRecommendations />
                      </AdminLayout>
                    </Suspense>
                  } 
                />
                <Route 
                  path="/admin/order-items" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AdminLayout>
                        <AdminOrderItems />
                      </AdminLayout>
                    </Suspense>
                  } 
                />
                <Route 
                  path="/admin/contacts" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AdminLayout>
                        <AdminContacts />
                      </AdminLayout>
                    </Suspense>
                  } 
                />
                <Route 
                  path="/admin/about-us" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AdminLayout>
                        <AdminAboutUs />
                      </AdminLayout>
                    </Suspense>
                  } 
                />
                <Route 
                  path="/admin/our-story" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AdminLayout>
                        <AdminOurStory />
                      </AdminLayout>
                    </Suspense>
                  } 
                />
                <Route 
                  path="/admin/faq" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AdminLayout>
                        <AdminFAQ />
                      </AdminLayout>
                    </Suspense>
                  } 
                />
              </Routes>
            </div>
          </CartProvider>
        </AuthProvider>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
