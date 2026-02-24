import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, Sun, Moon, User, LogOut, LogIn, UserPlus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { useTheme } from '@/contexts/ThemeProvider';
import { useCart } from '@/contexts/CartProvider';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { getTotalItems } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();

  // Dynamic navigation based on authentication state
  const navigation = user ? [
    { name: 'Home', href: '/' },
    { name: 'Menu', href: '/menu' },
    { name: 'Featured', href: '/featured' },
    { name: 'Contact', href: '/contact' },
    { name: 'Chat Assistant', href: '/chat-assistant' },
    { name: 'Dashboard', href: '/dashboard' },
  ] : [
    { name: 'Home', href: '/' },
    { name: 'Menu', href: '/menu' },
    { name: 'Featured', href: '/featured' },
    { name: 'Contact', href: '/contact' },
    { name: 'Chat Assistant', href: '/chat-assistant' },
  ];

  const isActive = (path) => location.pathname === path;

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SD</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:inline">Sweet Dessert</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link 
                  key={item.name}
                  to={item.href}
                  className={`relative text-sm font-medium transition-colors hover:text-primary ${
                    active ? 'text-primary' : 'text-foreground/80 '
                  }`}
                >
                  {item.name}
                  {active && (
                    <span className="absolute -bottom-1.5 left-0 w-full h-[2px] bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>



          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <ShoppingCart className="h-4 w-4" />
                {getTotalItems() > 0 && (
                  <Badge 
                    variant="default" 
                    className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
                  >
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Authentication */}
            {user ? (
              <div className="flex items-center space-x-2">
                <Link to="/dashboard">
                  <Button variant="ghost" size="icon" className="h-9 w-9" title={`Dashboard - ${user.username}`}>
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={logout}
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/signin" className="hidden sm:block">
                  <ShimmerButton variant="caramel" size="default" className="flex items-center justify-center px-6">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </ShimmerButton>
                </Link>
                <Link to="/signin" className="sm:hidden">
                  <ShimmerButton variant="caramel" size="sm" className="h-9 w-9 p-0 flex items-center justify-center">
                    <LogIn className="h-4 w-4" />
                  </ShimmerButton>
                </Link>
                <Link to="/signup" className="hidden sm:block">
                  <ShimmerButton variant="chocolate" size="default" className="flex items-center justify-center px-6">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign Up
                  </ShimmerButton>
                </Link>
                <Link to="/signup" className="sm:hidden">
                  <ShimmerButton variant="chocolate" size="sm" className="h-9 w-9 p-0 flex items-center justify-center">
                    <UserPlus className="h-4 w-4" />
                  </ShimmerButton>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <div className="px-4 py-6 space-y-4">

              
              {/* Mobile Navigation Links */}
              <nav className="flex flex-col space-y-4">
                {navigation.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`text-lg font-medium transition-colors ${
                        active ? 'text-primary' : 'text-foreground/80 hover:text-primary'
                      }`}
                    >
                      {item.name}
                      {active && (
                         <div className="h-0.5 w-8 bg-primary mt-1 rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Authentication */}
              <div className="pt-4 border-t space-y-2">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Welcome, {user.username}!
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/signin" onClick={() => setIsMobileMenuOpen(false)} className="block w-full">
                      <ShimmerButton variant="caramel" className="w-full flex items-center justify-center py-3">
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </ShimmerButton>
                    </Link>
                    <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="block w-full mt-2">
                      <ShimmerButton variant="chocolate" className="w-full flex items-center justify-center py-3">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Sign Up
                      </ShimmerButton>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;