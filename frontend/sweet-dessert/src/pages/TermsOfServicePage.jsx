import React from 'react';
import { 
  Scale,
  FileText,
  CreditCard,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Users,
  Gavel,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Calendar,
  Cake,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuroraText } from '@/components/ui/aurora-text';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { Link } from 'react-router-dom';

const TermsOfServicePage = () => {
  const lastUpdated = "September 18, 2025";
  const effectiveDate = "September 18, 2025";

  const serviceTerms = [
    {
      icon: Cake,
      title: "Product Quality",
      description: "All desserts are made fresh with premium ingredients and crafted to our high-quality standards.",
      color: "from-pink-500/20 to-rose-500/20"
    },
    {
      icon: Package,
      title: "Order Fulfillment",
      description: "We process orders promptly and deliver within specified timeframes, weather permitting.",
      color: "from-blue-500/20 to-indigo-500/20"
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      description: "All transactions are processed securely through encrypted payment gateways.",
      color: "from-emerald-500/20 to-teal-500/20"
    },
    {
      icon: Users,
      title: "Customer Support",
      description: "Our dedicated support team is available to assist with any questions or concerns.",
      color: "from-purple-500/20 to-violet-500/20"
    }
  ];

  const userObligations = [
    {
      icon: CheckCircle,
      title: "Accurate Information",
      description: "Provide accurate and up-to-date information for orders and account details.",
      type: "required"
    },
    {
      icon: CreditCard,
      title: "Valid Payment Method",
      description: "Use legitimate payment methods and ensure sufficient funds for purchases.",
      type: "required"
    },
    {
      icon: Users,
      title: "Respectful Conduct",
      description: "Treat our staff and other customers with courtesy and respect.",
      type: "required"
    },
    {
      icon: ShieldCheck,
      title: "Account Security",
      description: "Protect your account credentials and notify us of any unauthorized access.",
      type: "required"
    },
    {
      icon: XCircle,
      title: "Prohibited Uses",
      description: "Do not use our services for illegal activities or violation of third-party rights.",
      type: "prohibited"
    },
    {
      icon: Scale,
      title: "Age Requirement",
      description: "Users must be at least 13 years old, or have parental consent to use our services.",
      type: "required"
    }
  ];

  const paymentTerms = [
    {
      title: "Payment Processing",
      description: "Payments are processed at the time of order placement through our secure payment partners.",
      icon: CreditCard
    },
    {
      title: "Pricing & Currency",
      description: "All prices are displayed in USD and include applicable taxes. Prices may change without notice.",
      icon: FileText
    },
    {
      title: "Failed Payments",
      description: "Orders with failed payments will be cancelled. We may retry payment processing up to 3 times.",
      icon: XCircle
    },
    {
      title: "Refund Policy",
      description: "Refunds are processed within 5-7 business days for eligible returns and cancellations.",
      icon: CheckCircle
    }
  ];

  const liabilityLimits = [
    {
      title: "Service Availability",
      description: "We strive for 99% uptime but cannot guarantee uninterrupted service availability.",
      limitation: "Best Effort"
    },
    {
      title: "Product Quality",
      description: "We ensure high-quality products but are not liable for subjective taste preferences.",
      limitation: "Quality Standards Apply"
    },
    {
      title: "Delivery Delays",
      description: "We are not responsible for delays caused by weather, traffic, or other external factors.",
      limitation: "External Factors Excluded"
    },
    {
      title: "Maximum Liability",
      description: "Our total liability is limited to the amount paid for the specific order in question.",
      limitation: "Order Value Cap"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20">
        <div className="container mx-auto px-4 text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Scale className="h-10 w-10 text-primary" />
          </div>
          
          <Badge variant="default" className="text-lg px-6 py-2 bg-primary/20 text-primary border-primary/30">
            ⚖️ Legal Framework
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            <AuroraText>Terms of Service</AuroraText>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Welcome to Sweet Dessert! These terms establish the foundation for a delicious relationship 
            between you and our bakery. Please read carefully before placing your first order.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-x-0 sm:space-x-6 space-y-2 sm:space-y-0 text-sm text-muted-foreground mt-8">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Effective: {effectiveDate}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Updated: {lastUpdated}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Acceptance of Terms */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-primary/10 bg-gradient-to-r from-primary/5 to-primary/10">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Gavel className="h-6 w-6 text-primary" />
                  <CardTitle className="text-2xl">Acceptance of Terms</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  By accessing and using Sweet Dessert's website, placing orders, or using our services, 
                  you agree to be bound by these Terms of Service and all applicable laws and regulations. 
                  If you do not agree with any of these terms, please discontinue use of our services immediately.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  These terms constitute a legally binding agreement between you and Sweet Dessert. 
                  We reserve the right to modify these terms at any time, with changes becoming effective 
                  upon posting on our website.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Service Commitments */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              <AuroraText>Our Service Commitments</AuroraText>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              What you can expect from Sweet Dessert when you choose our services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviceTerms.map((term, index) => {
              const IconComponent = term.icon;
              return (
                <Card key={index} className="border-primary/10 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${term.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{term.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {term.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* User Obligations */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              <AuroraText>User Responsibilities</AuroraText>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Your obligations and responsibilities when using Sweet Dessert services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userObligations.map((obligation, index) => {
              const IconComponent = obligation.icon;
              return (
                <Card key={index} className="border-primary/10 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <Badge 
                        variant={obligation.type === "required" ? "default" : "destructive"}
                        className={obligation.type === "required" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : ""}
                      >
                        {obligation.type === "required" ? "Required" : "Prohibited"}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{obligation.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {obligation.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Orders & Delivery */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold text-foreground">
                <AuroraText>Orders & Delivery Terms</AuroraText>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-primary/10">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Package className="h-6 w-6 text-primary" />
                    <CardTitle>Order Processing</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    Orders are processed Monday through Saturday. Custom orders require 24-48 hours advance notice. 
                    We reserve the right to refuse or cancel orders that cannot be fulfilled due to ingredient 
                    availability or other circumstances beyond our control.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Standard Orders:</span>
                      <span className="text-foreground">Same day if placed before 2 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Custom Cakes:</span>
                      <span className="text-foreground">24-48 hours notice</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wedding Cakes:</span>
                      <span className="text-foreground">2-4 weeks notice</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/10">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Truck className="h-6 w-6 text-primary" />
                    <CardTitle>Delivery & Pickup</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    We offer both delivery and pickup options. Delivery is available within a 15-mile radius 
                    of our store. Delivery times may vary based on weather conditions, traffic, and order volume. 
                    We are not responsible for delays caused by external factors.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Radius:</span>
                      <span className="text-foreground">15 miles</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Fee:</span>
                      <span className="text-foreground">$5.99 (Free over $50)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pickup Window:</span>
                      <span className="text-foreground">30 minutes grace period</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Terms */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              <AuroraText>Payment & Billing Terms</AuroraText>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Clear and transparent payment policies for all our services.
            </p>
          </div>

          <div className="space-y-6">
            {paymentTerms.map((term, index) => {
              const IconComponent = term.icon;
              return (
                <Card key={index} className="border-primary/10 max-w-4xl mx-auto">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{term.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {term.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-6">
              We accept all major credit cards, PayPal, and digital wallets for your convenience.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Badge variant="outline" className="px-4 py-2">💳 Visa</Badge>
              <Badge variant="outline" className="px-4 py-2">💳 Mastercard</Badge>
              <Badge variant="outline" className="px-4 py-2">💳 American Express</Badge>
              <Badge variant="outline" className="px-4 py-2">💰 PayPal</Badge>
              <Badge variant="outline" className="px-4 py-2">📱 Apple Pay</Badge>
              <Badge variant="outline" className="px-4 py-2">📱 Google Pay</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Cancellation & Returns */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold text-foreground">
                <AuroraText>Cancellation & Return Policy</AuroraText>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-primary/10">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <XCircle className="h-6 w-6 text-primary" />
                    <CardTitle>Cancellation Policy</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    Orders can be cancelled up to 2 hours before the scheduled pickup/delivery time for standard items. 
                    Custom orders require 12 hours notice for cancellation. Wedding cakes and special event orders 
                    have different cancellation policies outlined in your order confirmation.
                  </p>
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-800 dark:text-amber-200">Important Notice</p>
                        <p className="text-amber-700 dark:text-amber-300">
                          Late cancellations may incur charges for ingredients already prepared.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/10">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary" />
                    <CardTitle>Return & Refund Policy</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    We stand behind the quality of our desserts. If you're not completely satisfied, 
                    please contact us within 24 hours of delivery/pickup. We'll work with you to resolve 
                    any issues through replacement, credit, or refund as appropriate.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span className="text-foreground">Quality issues: Full refund</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span className="text-foreground">Delivery problems: Replacement or credit</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span className="text-foreground">Damage in transit: Full replacement</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center mt-8">
              <Link to="/returns">
                <Button variant="outline" className="border-primary/30">
                  <Package className="h-4 w-4 mr-2" />
                  View Detailed Return Policy
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Limitation of Liability */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              <AuroraText>Limitation of Liability</AuroraText>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Understanding the scope and limits of our responsibility.
            </p>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {liabilityLimits.map((limit, index) => (
              <Card key={index} className="border-primary/10">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{limit.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{limit.description}</p>
                    </div>
                    <Badge variant="outline" className="md:ml-4 self-start md:self-center">
                      {limit.limitation}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="max-w-4xl mx-auto mt-8">
            <Card className="border-primary/10 bg-gradient-to-r from-primary/5 to-primary/10">
              <CardContent className="p-6">
                <p className="text-muted-foreground leading-relaxed text-center">
                  <strong className="text-foreground">Maximum Liability:</strong> In no event shall Sweet Dessert's 
                  total liability exceed the amount paid by you for the specific order giving rise to the claim. 
                  We shall not be liable for any indirect, incidental, special, or consequential damages.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Governing Law & Disputes */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold text-foreground">
                <AuroraText>Legal Framework</AuroraText>
              </h2>
            </div>

            <div className="space-y-8">
              <Card className="border-primary/10">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Gavel className="h-6 w-6 text-primary" />
                    <CardTitle>Governing Law</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    These Terms of Service are governed by the laws of the State of [Your State] and the United States of America, 
                    without regard to conflict of law principles. Any legal action or proceeding relating to these terms 
                    shall be brought exclusively in the courts of [Your County], [Your State].
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/10">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Scale className="h-6 w-6 text-primary" />
                    <CardTitle>Dispute Resolution</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    We encourage resolution of disputes through direct communication. If a dispute cannot be resolved directly, 
                    we agree to pursue mediation before resorting to litigation. Both parties agree to act in good faith 
                    to resolve any disputes amicably and efficiently.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-primary/5 rounded-lg">
                      <div className="font-medium text-foreground">Step 1</div>
                      <div className="text-muted-foreground">Direct Communication</div>
                    </div>
                    <div className="text-center p-3 bg-primary/5 rounded-lg">
                      <div className="font-medium text-foreground">Step 2</div>
                      <div className="text-muted-foreground">Mediation</div>
                    </div>
                    <div className="text-center p-3 bg-primary/5 rounded-lg">
                      <div className="font-medium text-foreground">Step 3</div>
                      <div className="text-muted-foreground">Legal Action</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Changes */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl font-bold text-foreground">
            <AuroraText>Questions About These Terms?</AuroraText>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            We're here to clarify any questions you may have about our Terms of Service. 
            Your understanding and compliance help us provide the best possible service.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link to="/contact">
              <ShimmerButton variant="chocolate" size="lg">
                <Mail className="h-5 w-5 mr-2" />
                Contact Legal Team
              </ShimmerButton>
            </Link>
            <Button variant="outline" size="lg" className="border-primary/30">
              <FileText className="h-5 w-5 mr-2" />
              Download PDF
            </Button>
          </div>

          <div className="text-sm text-muted-foreground mt-8 space-y-2 max-w-3xl mx-auto">
            <p>
              We reserve the right to modify these Terms of Service at any time. Material changes will be 
              communicated via email or prominent notice on our website at least 30 days before taking effect.
            </p>
            <p>
              Continued use of our services after changes constitutes acceptance of the revised terms.
            </p>
            <p className="font-medium pt-4">
              Sweet Dessert LLC | 123 Sweet Street, Dessert City, DC 12345 | legal@sweetdessert.com | (555) 123-4567
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfServicePage;