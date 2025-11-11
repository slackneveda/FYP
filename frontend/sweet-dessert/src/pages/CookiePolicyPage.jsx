import React, { useState } from 'react';
import { 
  Cookie,
  Settings,
  Eye,
  Shield,
  BarChart3,
  Globe,
  Zap,
  CheckCircle,
  XCircle,
  Info,
  RefreshCw,
  Download,
  ExternalLink,
  Calendar,
  Clock,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuroraText } from '@/components/ui/aurora-text';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { Switch } from '@/components/ui/switch';
import { Link } from 'react-router-dom';

const CookiePolicyPage = () => {
  const lastUpdated = "September 18, 2025";
  
  // State for cookie preferences (mock implementation)
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Always true, cannot be disabled
    analytics: true,
    marketing: false,
    personalization: true
  });

  const cookieTypes = [
    {
      icon: Shield,
      title: "Essential Cookies",
      subtitle: "The Basic Ingredients",
      description: "Like flour in a cake, these cookies are essential for our website to function properly. They enable core functionality like security, account access, and shopping cart features.",
      required: true,
      color: "from-emerald-500/20 to-teal-500/20",
      examples: ["Session management", "Security tokens", "Shopping cart", "Login status"],
      duration: "Session or up to 1 year"
    },
    {
      icon: BarChart3,
      title: "Analytics Cookies", 
      subtitle: "The Recipe Improvement Notes",
      description: "These help us understand how visitors interact with our website, like which desserts are most popular, so we can improve your experience.",
      required: false,
      color: "from-blue-500/20 to-indigo-500/20",
      examples: ["Page views", "User behavior", "Performance metrics", "Error tracking"],
      duration: "Up to 2 years"
    },
    {
      icon: Globe,
      title: "Marketing Cookies",
      subtitle: "The Sweet Recommendations",
      description: "Like a pastry chef remembering your favorite flavors, these cookies help us show you relevant dessert advertisements and special offers.",
      required: false,
      color: "from-purple-500/20 to-pink-500/20",
      examples: ["Ad targeting", "Social media integration", "Campaign tracking", "Conversion measurement"],
      duration: "Up to 1 year"
    },
    {
      icon: Zap,
      title: "Personalization Cookies",
      subtitle: "Your Custom Sweet Experience",
      description: "These remember your preferences like dietary restrictions, favorite products, and display settings to create a personalized dessert journey.",
      required: false,
      color: "from-amber-500/20 to-orange-500/20",
      examples: ["Language preferences", "Theme settings", "Saved preferences", "Recommended products"],
      duration: "Up to 1 year"
    }
  ];

  const cookieFacts = [
    {
      icon: Info,
      title: "What Are Cookies?",
      description: "Small text files stored on your device that help websites remember information about your visit - like digital breadcrumbs that make your next visit sweeter!"
    },
    {
      icon: Eye,
      title: "Transparency First",
      description: "We believe in being as transparent about our cookies as we are about our dessert ingredients. No hidden surprises, just clear information."
    },
    {
      icon: Settings,
      title: "You're In Control", 
      description: "Just like customizing your dessert order, you can customize which cookies you accept. Your preferences, your choice!"
    },
    {
      icon: RefreshCw,
      title: "Easy Management",
      description: "Change your cookie preferences anytime through our cookie settings panel or your browser settings. It's as easy as changing your dessert order!"
    }
  ];

  const thirdPartyCookies = [
    {
      name: "Google Analytics",
      purpose: "Website analytics and performance tracking",
      type: "Analytics",
      privacy: "https://policies.google.com/privacy"
    },
    {
      name: "Facebook Pixel",
      purpose: "Social media advertising and conversion tracking", 
      type: "Marketing",
      privacy: "https://www.facebook.com/privacy/policy"
    },
    {
      name: "Stripe",
      purpose: "Payment processing and fraud prevention",
      type: "Essential",
      privacy: "https://stripe.com/privacy"
    },
    {
      name: "Mailchimp",
      purpose: "Email marketing and newsletter management",
      type: "Marketing", 
      privacy: "https://mailchimp.com/legal/privacy/"
    }
  ];

  const handleCookieToggle = (type) => {
    if (type === 'essential') return; // Essential cookies cannot be disabled
    setCookiePreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const acceptAllCookies = () => {
    setCookiePreferences({
      essential: true,
      analytics: true,
      marketing: true,
      personalization: true
    });
  };

  const acceptEssentialOnly = () => {
    setCookiePreferences({
      essential: true,
      analytics: false,
      marketing: false,
      personalization: false
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20">
        <div className="container mx-auto px-4 text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Cookie className="h-10 w-10 text-primary" />
          </div>
          
          <Badge variant="default" className="text-lg px-6 py-2 bg-primary/20 text-primary border-primary/30">
            🍪 Digital Cookie Jar
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            <AuroraText>Cookie Policy</AuroraText>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Just like our delicious dessert cookies, our digital cookies help make your experience sweeter! 
            Learn about the different types we use and how you can control them.
          </p>

          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mt-8">
            <Calendar className="h-4 w-4" />
            <span>Last Updated: {lastUpdated}</span>
          </div>
        </div>
      </section>

      {/* Cookie Facts */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              <AuroraText>Cookie 101: The Sweet Basics</AuroraText>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Understanding digital cookies doesn't have to be crumby! Here's everything you need to know.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cookieFacts.map((fact, index) => {
              const IconComponent = fact.icon;
              return (
                <Card key={index} className="border-primary/10 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{fact.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {fact.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cookie Types */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              <AuroraText>Our Cookie Recipe Collection</AuroraText>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Different types of cookies serve different purposes - just like in a bakery! 
              Here's our complete collection and what each type does.
            </p>
          </div>

          <div className="space-y-8">
            {cookieTypes.map((cookie, index) => {
              const IconComponent = cookie.icon;
              const prefKey = cookie.title.toLowerCase().split(' ')[0];
              const isEnabled = cookiePreferences[prefKey] !== undefined ? cookiePreferences[prefKey] : true;
              
              return (
                <Card key={index} className="border-primary/10 hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <CardHeader className={`bg-gradient-to-r ${cookie.color} border-b`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-background/80 backdrop-blur-sm">
                          <IconComponent className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-foreground">{cookie.title}</CardTitle>
                          <p className="text-sm text-muted-foreground italic">{cookie.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={cookie.required ? "default" : "secondary"}
                          className={cookie.required ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : ""}
                        >
                          {cookie.required ? "Required" : "Optional"}
                        </Badge>
                        {!cookie.required && (
                          <div className="flex items-center space-x-2">
                            <Switch 
                              checked={isEnabled}
                              onCheckedChange={() => handleCookieToggle(prefKey)}
                              className="data-[state=checked]:bg-primary"
                            />
                            {isEnabled ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                        )}
                        {cookie.required && (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      {cookie.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center">
                          <Info className="h-4 w-4 mr-2 text-primary" />
                          What We Track
                        </h4>
                        <ul className="space-y-2">
                          {cookie.examples.map((example, idx) => (
                            <li key={idx} className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          Storage Duration
                        </h4>
                        <p className="text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg">
                          {cookie.duration}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cookie Preferences Panel */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl font-bold text-foreground">
                <AuroraText>Customize Your Cookie Preferences</AuroraText>
              </h2>
              <p className="text-muted-foreground text-lg">
                Take control of your digital cookie jar! Adjust your preferences to taste.
              </p>
            </div>

            <Card className="border-primary/10 bg-gradient-to-r from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Settings className="h-6 w-6 text-primary" />
                  <span>Cookie Preference Center</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  {Object.entries(cookiePreferences).map(([key, value]) => {
                    const cookieInfo = cookieTypes.find(ct => 
                      ct.title.toLowerCase().includes(key) || 
                      (key === 'analytics' && ct.title.includes('Analytics')) ||
                      (key === 'marketing' && ct.title.includes('Marketing')) ||
                      (key === 'personalization' && ct.title.includes('Personalization')) ||
                      (key === 'essential' && ct.title.includes('Essential'))
                    );
                    
                    if (!cookieInfo) return null;
                    
                    return (
                      <div key={key} className="flex items-center justify-between p-4 bg-background rounded-lg border border-primary/10">
                        <div className="flex items-center space-x-3">
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                            <cookieInfo.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{cookieInfo.title}</h4>
                            <p className="text-sm text-muted-foreground">{cookieInfo.subtitle}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {cookieInfo.required ? (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                              Always Active
                            </Badge>
                          ) : (
                            <>
                              <Switch 
                                checked={value}
                                onCheckedChange={() => handleCookieToggle(key)}
                                className="data-[state=checked]:bg-primary"
                              />
                              <span className="text-sm text-muted-foreground">
                                {value ? 'Enabled' : 'Disabled'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button 
                    onClick={acceptAllCookies} 
                    className="flex-1"
                    variant="default"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept All Cookies
                  </Button>
                  <Button 
                    onClick={acceptEssentialOnly}
                    variant="outline" 
                    className="flex-1"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Essential Only
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground text-center">
                  Your preferences are saved locally and take effect immediately. You can change them anytime.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Third-Party Cookies */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold text-foreground">
                <AuroraText>Third-Party Cookie Partners</AuroraText>
              </h2>
              <p className="text-muted-foreground text-lg">
                We work with trusted partners who also use cookies to enhance your experience. 
                Here's who they are and what they do.
              </p>
            </div>

            <div className="space-y-4">
              {thirdPartyCookies.map((partner, index) => (
                <Card key={index} className="border-primary/10">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{partner.name}</h3>
                          <Badge 
                            variant="outline"
                            className={
                              partner.type === 'Essential' 
                                ? 'border-emerald-500/50 text-emerald-700 dark:text-emerald-400' 
                                : partner.type === 'Analytics'
                                ? 'border-blue-500/50 text-blue-700 dark:text-blue-400'
                                : 'border-purple-500/50 text-purple-700 dark:text-purple-400'
                            }
                          >
                            {partner.type}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{partner.purpose}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link to={partner.privacy} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Privacy Policy
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Managing Cookies */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold text-foreground">
                <AuroraText>How to Manage Your Cookies</AuroraText>
              </h2>
              <p className="text-muted-foreground text-lg">
                You have multiple ways to control cookies, both on our site and in your browser.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-primary/10">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Settings className="h-6 w-6 text-primary" />
                    <CardTitle>Browser Settings</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    Most browsers allow you to control cookies through their settings menu. 
                    You can usually find cookie settings under Privacy or Security options.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Chrome:</span>
                      <span className="text-foreground">Settings → Privacy → Cookies</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Firefox:</span>
                      <span className="text-foreground">Options → Privacy → Cookies</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Safari:</span>
                      <span className="text-foreground">Preferences → Privacy</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Edge:</span>
                      <span className="text-foreground">Settings → Privacy → Cookies</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/10">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Cookie className="h-6 w-6 text-primary" />
                    <CardTitle>Our Cookie Center</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    Use our cookie preference center for easy management of your settings. 
                    Changes take effect immediately and are saved to your device.
                  </p>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Open Cookie Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset to Defaults
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Card className="border-primary/10 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-700">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <Info className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1" />
                    <div>
                      <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                        Impact of Disabling Cookies
                      </h4>
                      <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
                        While you can disable all cookies, doing so may affect your experience on our website. 
                        Essential cookies are required for basic functionality like shopping cart and account access. 
                        Disabling analytics cookies won't affect your experience, but it helps us improve our services.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl font-bold text-foreground">
            <AuroraText>Questions About Our Cookie Policy?</AuroraText>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            We're here to help clarify any questions about our use of cookies. 
            Don't let confusion crumble your experience!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link to="/contact">
              <ShimmerButton variant="chocolate" size="lg">
                <Cookie className="h-5 w-5 mr-2" />
                Contact Support
              </ShimmerButton>
            </Link>
            <Link to="/privacy">
              <Button variant="outline" size="lg" className="border-primary/30">
                <Shield className="h-5 w-5 mr-2" />
                Privacy Policy
              </Button>
            </Link>
          </div>

          <div className="text-sm text-muted-foreground mt-8 space-y-2">
            <p>
              This Cookie Policy is part of our Privacy Policy and Terms of Service. 
              We may update this policy to reflect changes in technology or regulations.
            </p>
            <p className="font-medium">
              Sweet Dessert | 123 Sweet Street, Dessert City, DC 12345 | cookies@sweetdessert.com
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CookiePolicyPage;