import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare, 
  ChefHat, 
  ShoppingCart,
  Plus,
  Minus,
  Star,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AuroraText } from '@/components/ui/aurora-text';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';

const ContactPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    orderType: 'general',
    message: '',
    preferredContact: 'email'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form with user data if authenticated
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        name: user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}`.trim()
          : user.username || prevData.name,
        email: user.email || prevData.email,
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiService.submitContact(formData);
      
      // Show success message with submission type
      const userType = user ? 'authenticated user' : 'guest';
      alert(`Thank you for your message! We've received your ${formData.orderType.replace('-', ' ')} inquiry as an ${userType} and will get back to you within 24 hours.`);
      
      // Reset form but keep user info for authenticated users
      const resetData = {
        name: user ? formData.name : '',
        email: user ? formData.email : '',
        phone: '',
        subject: '',
        orderType: 'general',
        message: '',
        preferredContact: 'email'
      };
      setFormData(resetData);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('There was an error submitting your message. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const orderTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'custom-cake', label: 'Custom Cake Order' },
    { value: 'catering', label: 'Catering Request' },
    { value: 'corporate', label: 'Corporate Event' },
    { value: 'wedding', label: 'Wedding Desserts' },
    { value: 'complaint', label: 'Issue/Complaint' }
  ];



  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4 text-center space-y-6">
          <Badge variant="default" className="text-lg px-4 py-2">
            📞 Get in Touch
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            <AuroraText>We're Here to Help</AuroraText>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Have questions about our desserts, need help with a custom order, or want to discuss catering? 
            Our sweet team is ready to make your experience delightful.
          </p>
        </div>
      </section>

      {/* User Status Section */}
      {user && (
        <section className="container mx-auto px-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Welcome back, {user.first_name || user.username}!
                  </h3>
                  <p className="text-muted-foreground">
                    As a registered user, your contact information will be pre-filled and your message history will be saved to your account.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}



      {/* Contact Form and Map */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4"><AuroraText>Send us a Message</AuroraText></h2>
              <p className="text-muted-foreground">
                Fill out the form below and we'll get back to you within 24 hours. 
                For urgent matters, please call us directly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Order Type
                  </label>
                  <select
                    name="orderType"
                    value={formData.orderType}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {orderTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Subject *
                </label>
                <Input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Brief description of your inquiry"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us more about your request, including any special requirements, dates, or preferences..."
                  rows={6}
                  required
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <ShimmerButton 
                type="submit" 
                variant="chocolate"
                size="lg" 
                className="w-full" 
                disabled={isSubmitting}
              >
                <Send className="h-5 w-5 mr-2" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </ShimmerButton>
            </form>
          </div>

          {/* Map and Additional Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-4"><AuroraText>Find Our Store</AuroraText></h3>
              <p className="text-muted-foreground mb-6">
                Visit us in person to see our full selection of fresh desserts 
                and speak with our pastry chefs about custom orders.
              </p>
            </div>

            {/* Placeholder Map */}
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-6">
              <div className="text-center space-y-2">
                <MapPin className="h-12 w-12 text-primary mx-auto" />
                <p className="text-muted-foreground">Interactive Map</p>
                <p className="text-sm text-muted-foreground">123 Sweet Street, Dessert City, DC 12345</p>
              </div>
            </div>



            {/* Business Hours */}
            <Card className="border-primary/20 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg">
                <CardTitle className="flex items-center space-x-3 text-lg">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-foreground font-semibold">Business Hours</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-muted/20">
                    <span className="text-sm font-medium text-foreground">Monday - Thursday</span>
                    <span className="font-semibold text-primary text-sm">7:00 AM - 9:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-muted/20">
                    <span className="text-sm font-medium text-foreground">Friday - Sunday</span>
                    <span className="font-semibold text-primary text-sm">7:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-foreground">Holidays</span>
                    <span className="font-semibold text-primary text-sm">10:00 AM - 6:00 PM</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-muted/20">
                  <p className="text-xs text-muted-foreground text-center">
                    Call ahead for holiday hours or special events
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>



    </div>
  );
};

export default ContactPage;