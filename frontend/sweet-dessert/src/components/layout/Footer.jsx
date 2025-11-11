import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShimmerButton } from '@/components/magicui/shimmer-button';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Story', href: '/story' },
    ],
    customer: [
      { name: 'Contact', href: '/contact' },
      { name: 'FAQ', href: '/faq' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Accessibility', href: '/accessibility' },
    ],
  };

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">SD</span>
              </div>
              <span className="text-lg font-bold text-foreground">Sweet Dessert</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We create exquisite desserts with passion, artistry, and the finest ingredients — each bite a delicious chapter in a story of sweetness and perfection.
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Twitter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Company
            </h3>
            <ul className="space-y-2">
              {footerSections.company.map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Customer Service
            </h3>
            <ul className="space-y-2">
              {footerSections.customer.map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Stay Connected
            </h3>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>hello@sweetdessert.com</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>123 Sweet Street<br />Dessert City, DC 12345</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Mon-Sat: 8AM-9PM</span>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Newsletter</h4>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Enter email" 
                  className="text-sm"
                  type="email"
                />
                <ShimmerButton variant="default" size="sm">
                  Subscribe
                </ShimmerButton>
              </div>
              <p className="text-xs text-muted-foreground">
                Get special offers and updates
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap items-center space-x-4 text-sm text-muted-foreground">
            <span>© {currentYear} Sweet Dessert. All rights reserved.</span>
          </div>
          
          <div className="flex space-x-4">
            {footerSections.legal.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;