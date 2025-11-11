import React from 'react';
import { 
  Accessibility,
  Eye,
  Ear,
  Hand,
  Brain,
  Heart,
  Zap,
  CheckCircle,
  Monitor,
  Keyboard,
  Mouse,
  Smartphone,
  Volume2,
  Type,
  Contrast,
  ZoomIn,
  Navigation,
  HelpCircle,
  Mail,
  Phone,
  FileText,
  Award,
  Users,
  Calendar,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuroraText } from '@/components/ui/aurora-text';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { Link } from 'react-router-dom';

const AccessibilityPage = () => {
  const lastUpdated = "September 18, 2025";

  const accessibilityCommitments = [
    {
      icon: Eye,
      title: "Visual Accessibility",
      description: "High contrast ratios, scalable fonts, and screen reader compatibility ensure everyone can enjoy our visual content.",
      color: "from-blue-500/20 to-indigo-500/20",
      features: ["Screen reader support", "High contrast mode", "Scalable text", "Alt text for images"]
    },
    {
      icon: Ear,
      title: "Audio Accessibility",
      description: "Captions, transcripts, and visual alternatives ensure audio content is accessible to all users.",
      color: "from-purple-500/20 to-pink-500/20",
      features: ["Video captions", "Audio descriptions", "Visual sound indicators", "Volume controls"]
    },
    {
      icon: Hand,
      title: "Motor Accessibility",
      description: "Keyboard navigation, large click targets, and flexible interaction methods accommodate all abilities.",
      color: "from-emerald-500/20 to-teal-500/20",
      features: ["Keyboard navigation", "Large buttons", "Voice control", "Touch alternatives"]
    },
    {
      icon: Brain,
      title: "Cognitive Accessibility",
      description: "Clear language, consistent navigation, and helpful instructions make our content easy to understand.",
      color: "from-amber-500/20 to-orange-500/20",
      features: ["Simple language", "Clear instructions", "Consistent layout", "Progress indicators"]
    }
  ];

  const wcagCompliance = [
    {
      level: "A",
      title: "Essential Access",
      description: "Basic accessibility features that ensure core functionality is available to all users.",
      items: ["Alt text for images", "Keyboard navigation", "Proper heading structure", "Form labels"],
      color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
    },
    {
      level: "AA",
      title: "Enhanced Access", 
      description: "Higher standard of accessibility with improved usability for diverse needs and assistive technologies.",
      items: ["4.5:1 contrast ratio", "Text resizing to 200%", "Focus indicators", "Error identification"],
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
    },
    {
      level: "AAA",
      title: "Optimal Access",
      description: "The highest level of accessibility compliance for an inclusive experience for all users.",
      items: ["7:1 contrast ratio", "No flashing content", "Context help available", "Advanced navigation"],
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
    }
  ];

  const assistiveTech = [
    {
      icon: Monitor,
      title: "Screen Readers",
      description: "NVDA, JAWS, VoiceOver, and TalkBack",
      compatibility: "Full Support"
    },
    {
      icon: Keyboard,
      title: "Keyboard Navigation",
      description: "Tab, arrow keys, and shortcuts",
      compatibility: "Fully Navigable"
    },
    {
      icon: Mouse,
      title: "Alternative Pointing",
      description: "Eye-tracking, head mouse, switch access",
      compatibility: "Compatible"
    },
    {
      icon: Volume2,
      title: "Voice Control",
      description: "Dragon, Voice Access, Voice Control",
      compatibility: "Supported"
    },
    {
      icon: ZoomIn,
      title: "Magnification Tools",
      description: "ZoomText, Magnifier, browser zoom",
      compatibility: "Optimized"
    },
    {
      icon: Smartphone,
      title: "Mobile Accessibility",
      description: "iOS VoiceOver, Android TalkBack",
      compatibility: "Native Support"
    }
  ];

  const accessibilityFeatures = [
    {
      category: "Navigation & Structure",
      icon: Navigation,
      features: [
        "Logical heading hierarchy (H1-H6)",
        "Skip navigation links",
        "Consistent navigation structure",
        "Breadcrumb navigation",
        "Site search functionality",
        "Sitemap for easy content discovery"
      ]
    },
    {
      category: "Visual Design",
      icon: Eye,
      features: [
        "High contrast color schemes",
        "Minimum 4.5:1 contrast ratios",
        "Scalable text up to 200%", 
        "Responsive design for all devices",
        "Clear focus indicators",
        "No color-only information"
      ]
    },
    {
      category: "Interactive Elements",
      icon: Hand,
      features: [
        "Large clickable areas (44x44px minimum)",
        "Keyboard accessible all functions",
        "Clear focus management",
        "Descriptive link text",
        "Form validation with clear errors",
        "Time-out warnings and extensions"
      ]
    },
    {
      category: "Content & Media",
      icon: FileText,
      features: [
        "Alternative text for all images",
        "Captions for video content",
        "Audio descriptions available",
        "Plain language writing",
        "Consistent terminology",
        "Downloadable content in multiple formats"
      ]
    }
  ];

  const supportOptions = [
    {
      icon: Phone,
      title: "Accessibility Hotline",
      description: "Speak directly with our accessibility support team",
      contact: "(555) 123-ACCESS",
      hours: "Mon-Fri 9AM-5PM EST"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send detailed questions or feedback about accessibility",
      contact: "accessibility@sweetdessert.com",
      hours: "Response within 24 hours"
    },
    {
      icon: HelpCircle,
      title: "Live Chat",
      description: "Get immediate help with accessibility questions",
      contact: "Available on all pages",
      hours: "Mon-Sat 8AM-8PM EST"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20">
        <div className="container mx-auto px-4 text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Accessibility className="h-10 w-10 text-primary" />
          </div>
          
          <Badge variant="default" className="text-lg px-6 py-2 bg-primary/20 text-primary border-primary/30">
            ♿ Inclusive Design
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            <AuroraText>Accessibility Statement</AuroraText>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            At Sweet Dessert, we believe everyone deserves access to sweetness. We're committed to creating 
            an inclusive digital experience that welcomes all customers, regardless of their abilities or 
            assistive technologies they use.
          </p>

          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mt-8">
            <Calendar className="h-4 w-4" />
            <span>Last Updated: {lastUpdated}</span>
          </div>
        </div>
      </section>

      {/* Our Commitment */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-primary/10 bg-gradient-to-r from-primary/5 to-primary/10">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Heart className="h-6 w-6 text-primary" />
                  <CardTitle className="text-2xl">Our Accessibility Promise</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Sweet Dessert is committed to ensuring digital accessibility for people with disabilities. 
                  We continually improve the user experience for everyone and apply the relevant accessibility 
                  standards to achieve these goals.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards 
                  and are actively working toward Level AAA compliance in key areas. Our goal is to provide 
                  equal access and opportunity to all visitors, ensuring that everyone can enjoy our sweet offerings.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Accessibility Areas */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              <AuroraText>Our Accessibility Focus Areas</AuroraText>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We address accessibility across all dimensions to ensure an inclusive experience for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {accessibilityCommitments.map((commitment, index) => {
              const IconComponent = commitment.icon;
              return (
                <Card key={index} className="border-primary/10 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6 space-y-4">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${commitment.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{commitment.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {commitment.description}
                    </p>
                    <div className="pt-2">
                      <h4 className="text-sm font-medium text-foreground mb-2">Key Features:</h4>
                      <ul className="space-y-1">
                        {commitment.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <CheckCircle className="h-3 w-3 text-emerald-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* WCAG Compliance */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              <AuroraText>WCAG 2.1 Compliance Levels</AuroraText>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We follow the Web Content Accessibility Guidelines to ensure our website meets international 
              accessibility standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {wcagCompliance.map((level, index) => (
              <Card key={index} className="border-primary/10 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-3">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <span>Level {level.level}</span>
                    </CardTitle>
                    <Badge className={level.color}>
                      WCAG {level.level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{level.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {level.description}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">Compliance Features:</h4>
                    <ul className="space-y-2">
                      {level.items.map((item, idx) => (
                        <li key={idx} className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Assistive Technology Support */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              <AuroraText>Assistive Technology Support</AuroraText>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our website is designed to work seamlessly with a wide range of assistive technologies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {assistiveTech.map((tech, index) => {
              const IconComponent = tech.icon;
              return (
                <Card key={index} className="border-primary/10 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                        {tech.compatibility}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">{tech.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {tech.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Accessibility Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              <AuroraText>Accessibility Features</AuroraText>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive accessibility features built into every aspect of our website.
            </p>
          </div>

          <div className="space-y-8">
            {accessibilityFeatures.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <Card key={index} className="border-primary/10">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{section.category}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {section.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testing & Feedback */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold text-foreground">
                <AuroraText>Continuous Testing & Improvement</AuroraText>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-primary/10">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Target className="h-6 w-6 text-primary" />
                    <CardTitle>Our Testing Process</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    We conduct regular accessibility audits using both automated tools and manual testing 
                    with real assistive technologies. Our team includes accessibility experts and users 
                    with disabilities who help ensure our standards meet real-world needs.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span className="text-foreground">Monthly automated accessibility scans</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span className="text-foreground">Quarterly manual testing with assistive tech</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span className="text-foreground">User feedback integration</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span className="text-foreground">Third-party accessibility audits</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/10">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Users className="h-6 w-6 text-primary" />
                    <CardTitle>User Feedback</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    Your feedback is invaluable in helping us improve accessibility. We welcome reports 
                    of accessibility barriers and suggestions for improvement. Every report is reviewed 
                    and addressed by our accessibility team.
                  </p>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start border-primary/30">
                      <Mail className="h-4 w-4 mr-2" />
                      Report Accessibility Issue
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-primary/30">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Request Accessibility Help
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-primary/30">
                      <FileText className="h-4 w-4 mr-2" />
                      Suggest Improvements
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              <AuroraText>Accessibility Support</AuroraText>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Need help accessing our website or placing an order? We're here to assist you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportOptions.map((option, index) => {
              const IconComponent = option.icon;
              return (
                <Card key={index} className="border-primary/10 hover:shadow-lg transition-all duration-300 text-center">
                  <CardContent className="p-6 space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-4">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{option.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {option.description}
                    </p>
                    <div className="space-y-2 pt-2">
                      <div className="text-lg font-medium text-primary">{option.contact}</div>
                      <div className="text-sm text-muted-foreground">{option.hours}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Alternative Formats */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-bold text-foreground">
              <AuroraText>Alternative Formats Available</AuroraText>
            </h2>
            <p className="text-muted-foreground text-lg">
              We can provide information in alternative formats upon request to ensure accessibility for all users.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-primary/10 p-4 text-center">
                <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-sm font-medium text-foreground">Large Print</div>
              </Card>
              <Card className="border-primary/10 p-4 text-center">
                <Volume2 className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-sm font-medium text-foreground">Audio Format</div>
              </Card>
              <Card className="border-primary/10 p-4 text-center">
                <Type className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-sm font-medium text-foreground">Braille</div>
              </Card>
              <Card className="border-primary/10 p-4 text-center">
                <Hand className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-sm font-medium text-foreground">Sign Language</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl font-bold text-foreground">
            <AuroraText>Help Us Serve You Better</AuroraText>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            Accessibility is an ongoing journey. Your feedback helps us create a more inclusive 
            experience for everyone. Let us know how we can better serve you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link to="/contact">
              <ShimmerButton variant="chocolate" size="lg">
                <Accessibility className="h-5 w-5 mr-2" />
                Contact Accessibility Team
              </ShimmerButton>
            </Link>
            <Button variant="outline" size="lg" className="border-primary/30">
              <FileText className="h-5 w-5 mr-2" />
              Download Accessibility Guide
            </Button>
          </div>

          <div className="text-sm text-muted-foreground mt-8 space-y-2">
            <p>
              We are committed to providing equal access and opportunity to all. If you encounter 
              any accessibility barriers, please let us know so we can address them promptly.
            </p>
            <p className="font-medium">
              Sweet Dessert Accessibility Team | accessibility@sweetdessert.com | (555) 123-ACCESS
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccessibilityPage;