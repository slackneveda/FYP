import React from 'react';
import { 
  Shield,
  Lock,
  Eye,
  UserCheck,
  FileText,
  Globe,
  Mail,
  Settings,
  AlertCircle,
  CheckCircle,
  Cookie,
  Database,
  Share2,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuroraText } from '@/components/ui/aurora-text';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage = () => {
  const lastUpdated = "September 18, 2025";

  const privacyPrinciples = [
    {
      icon: Shield,
      title: "Data Protection",
      description: "Your personal information is encrypted and secured with industry-leading protection.",
      color: "from-blue-500/20 to-indigo-500/20"
    },
    {
      icon: Eye,
      title: "Transparency",
      description: "We're clear about what data we collect and how we use it to enhance your experience.",
      color: "from-emerald-500/20 to-teal-500/20"
    },
    {
      icon: UserCheck,
      title: "User Control",
      description: "You have full control over your data with options to view, modify, or delete it anytime.",
      color: "from-purple-500/20 to-pink-500/20"
    },
    {
      icon: Lock,
      title: "Minimal Collection",
      description: "We only collect information necessary to provide you with exceptional dessert experiences.",
      color: "from-amber-500/20 to-orange-500/20"
    }
  ];

  const dataTypes = [
    {
      icon: UserCheck,
      title: "Account Information",
      description: "Name, email address, phone number, and delivery preferences when you create an account.",
      required: true
    },
    {
      icon: Globe,
      title: "Order Details",
      description: "Items ordered, delivery addresses, payment information, and order history for fulfillment.",
      required: true
    },
    {
      icon: Cookie,
      title: "Website Usage",
      description: "Cookies and analytics to improve site performance and provide personalized recommendations.",
      required: false
    },
    {
      icon: Mail,
      title: "Communications",
      description: "Email preferences, marketing consent, and communication history for customer service.",
      required: false
    }
  ];

  const userRights = [
    {
      icon: Eye,
      title: "Access Your Data",
      description: "Request a copy of all personal data we have about you."
    },
    {
      icon: Settings,
      title: "Modify Information",
      description: "Update or correct your personal information at any time."
    },
    {
      icon: AlertCircle,
      title: "Delete Account",
      description: "Request complete deletion of your account and associated data."
    },
    {
      icon: Share2,
      title: "Data Portability",
      description: "Export your data in a commonly used, machine-readable format."
    },
    {
      icon: FileText,
      title: "Opt-Out Marketing",
      description: "Unsubscribe from marketing communications while keeping your account."
    },
    {
      icon: CheckCircle,
      title: "Consent Withdrawal",
      description: "Withdraw consent for data processing where consent is the legal basis."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20">
        <div className="container mx-auto px-4 text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          
          <Badge variant="default" className="text-lg px-6 py-2 bg-primary/20 text-primary border-primary/30">
            🛡️ Your Privacy Matters
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            <AuroraText>Privacy Policy</AuroraText>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            At Sweet Dessert, we believe your privacy is as important as the perfect recipe. We're committed to 
            protecting your personal information while delivering the sweetest experiences.
          </p>

          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mt-8">
            <Calendar className="h-4 w-4" />
            <span>Last Updated: {lastUpdated}</span>
          </div>
        </div>
      </section>

      {/* Privacy Principles */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              <AuroraText>Our Privacy Principles</AuroraText>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              These core principles guide how we handle your personal information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {privacyPrinciples.map((principle, index) => {
              const IconComponent = principle.icon;
              return (
                <Card key={index} className="border-primary/10 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${principle.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{principle.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {principle.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Information We Collect */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              <AuroraText>Information We Collect</AuroraText>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We collect only the information necessary to provide you with exceptional service and personalized experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dataTypes.map((data, index) => {
              const IconComponent = data.icon;
              return (
                <Card key={index} className="border-primary/10 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{data.title}</CardTitle>
                      </div>
                      <Badge 
                        variant={data.required ? "default" : "secondary"}
                        className={data.required ? "bg-primary/20 text-primary" : ""}
                      >
                        {data.required ? "Required" : "Optional"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground leading-relaxed">
                      {data.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How We Use Information */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold text-foreground">
                <AuroraText>How We Use Your Information</AuroraText>
              </h2>
              <p className="text-muted-foreground text-lg">
                Your data helps us create sweeter experiences and better service.
              </p>
            </div>

            <div className="space-y-8">
              <Card className="border-primary/10">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Database className="h-6 w-6 text-primary" />
                    <CardTitle>Service Delivery</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">
                    We use your information primarily to process orders, arrange deliveries, handle payments, 
                    and provide customer support. This includes managing your account, tracking orders, 
                    and ensuring you receive your desserts fresh and on time.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/10">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Settings className="h-6 w-6 text-primary" />
                    <CardTitle>Personalization</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">
                    With your consent, we analyze your preferences and purchase history to recommend desserts 
                    you might love, customize your shopping experience, and send you relevant offers and updates 
                    about new products or special events.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/10">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-6 w-6 text-primary" />
                    <CardTitle>Communication</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">
                    We may contact you about your orders, account updates, important service changes, 
                    and promotional offers (with your permission). You can control communication preferences 
                    in your account settings or unsubscribe at any time.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Your Rights */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              <AuroraText>Your Privacy Rights</AuroraText>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              You have complete control over your personal information. Here's what you can do.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userRights.map((right, index) => {
              const IconComponent = right.icon;
              return (
                <Card key={index} className="border-primary/10 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6 space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{right.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {right.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-6">
              To exercise any of these rights, please contact our privacy team.
            </p>
            <Link to="/contact">
              <ShimmerButton variant="chocolate" size="lg">
                <Mail className="h-5 w-5 mr-2" />
                Contact Privacy Team
              </ShimmerButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Data Security */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold text-foreground">
                <AuroraText>Data Security & Retention</AuroraText>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-primary/10">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Lock className="h-6 w-6 text-primary" />
                    <CardTitle>Security Measures</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    We implement industry-standard security measures including SSL encryption, 
                    secure payment processing, regular security audits, and restricted access 
                    to personal information. Our servers are protected by firewalls and monitored 24/7.
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-primary">
                    <CheckCircle className="h-4 w-4" />
                    <span>256-bit SSL Encryption</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-primary">
                    <CheckCircle className="h-4 w-4" />
                    <span>PCI DSS Compliant</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-primary">
                    <CheckCircle className="h-4 w-4" />
                    <span>Regular Security Audits</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/10">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Database className="h-6 w-6 text-primary" />
                    <CardTitle>Data Retention</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    We keep your personal information only as long as necessary to provide our services 
                    and comply with legal obligations. Account data is retained while your account is active. 
                    Order history is kept for 7 years for tax and legal compliance.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account Data:</span>
                      <span className="text-foreground">While account is active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order History:</span>
                      <span className="text-foreground">7 years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Marketing Data:</span>
                      <span className="text-foreground">Until consent withdrawn</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Cookies & Third Parties */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold text-foreground">
                <AuroraText>Cookies & Third-Party Services</AuroraText>
              </h2>
            </div>

            <div className="space-y-8">
              <Card className="border-primary/10">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Cookie className="h-6 w-6 text-primary" />
                    <CardTitle>Cookie Usage</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We use cookies to enhance your browsing experience, remember your preferences, 
                    and analyze website performance. You can control cookie settings in your browser 
                    or through our cookie preference center.
                  </p>
                  <Link to="/cookies">
                    <Button variant="outline" className="border-primary/30">
                      Learn More About Cookies
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-primary/10">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Share2 className="h-6 w-6 text-primary" />
                    <CardTitle>Third-Party Services</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We work with trusted partners for payment processing (Stripe), analytics (Google Analytics), 
                    and delivery services. These partners have their own privacy policies and only receive 
                    information necessary to provide their services.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-primary/5 rounded-lg">
                      <div className="font-medium text-foreground">Payment Processing</div>
                      <div className="text-muted-foreground">Stripe, PayPal</div>
                    </div>
                    <div className="text-center p-3 bg-primary/5 rounded-lg">
                      <div className="font-medium text-foreground">Analytics</div>
                      <div className="text-muted-foreground">Google Analytics</div>
                    </div>
                    <div className="text-center p-3 bg-primary/5 rounded-lg">
                      <div className="font-medium text-foreground">Delivery</div>
                      <div className="text-muted-foreground">Local Partners</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Updates */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl font-bold text-foreground">
            <AuroraText>Questions About Your Privacy?</AuroraText>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            We're here to help. If you have any questions about this Privacy Policy or how we handle 
            your personal information, please don't hesitate to reach out.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link to="/contact">
              <ShimmerButton variant="chocolate" size="lg">
                <Mail className="h-5 w-5 mr-2" />
                Contact Us
              </ShimmerButton>
            </Link>
            <Button variant="outline" size="lg" className="border-primary/30">
              <FileText className="h-5 w-5 mr-2" />
              Download PDF
            </Button>
          </div>

          <div className="text-sm text-muted-foreground mt-8 space-y-2">
            <p>
              We may update this Privacy Policy from time to time. We'll notify you of any significant 
              changes by email or through a notice on our website.
            </p>
            <p className="font-medium">
              Sweet Dessert | 123 Sweet Street, Dessert City, DC 12345 | privacy@sweetdessert.com
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;