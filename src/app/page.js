import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Star, Clock, CreditCard, MapPin, ArrowRight, CheckCircle2,
  Sparkles, Shield, Truck, PhoneCall, Shirt, Timer, Zap
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { AnimatedHero } from "@/components/ui/animated-hero";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <AnimatedHero />

      {/* Stats Section with Gradient Border */}
      <section className="py-16 bg-background relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "10K+", label: "Happy Customers", icon: <Sparkles className="h-6 w-6 text-primary" /> },
              { number: "24/7", label: "Customer Support", icon: <PhoneCall className="h-6 w-6 text-primary" /> },
              { number: "99%", label: "Satisfaction Rate", icon: <Star className="h-6 w-6 text-primary" /> },
              { number: "50+", label: "Service Locations", icon: <MapPin className="h-6 w-6 text-primary" /> },
            ].map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/20 transition-all duration-300">
                <div className="flex justify-center mb-4">{stat.icon}</div>
                <h3 className="text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </h3>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
              Our Services
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Professional Laundry Solutions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive laundry services tailored to your needs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shirt className="h-8 w-8" />,
                title: "Dry Cleaning",
                description: "Professional care for your delicate garments",
                features: ["Stain removal", "Pressing", "Fabric protection"]
              },
              {
                icon: <Timer className="h-8 w-8" />,
                title: "Express Wash",
                description: "Quick turnaround for urgent requirements",
                features: ["3-hour service", "Free pickup", "Quality check"]
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Premium Care",
                description: "Specialized treatment for luxury items",
                features: ["Hand washing", "Expert handling", "Premium products"]
              },
            ].map((service, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 overflow-hidden">
                <CardContent className="pt-6">
                  <div className="mb-4 inline-flex p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6 group-hover:bg-primary/90 transition-colors">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with Animation */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-primary/5" />
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50">
              Why Choose Us
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              The Smart Choice for Your Laundry
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the perfect blend of technology and service
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: <Clock className="h-8 w-8" />,
                title: "Fast Service",
                description: "24-hour turnaround time",
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Secure Handling",
                description: "Protected garment care",
              },
              {
                icon: <Truck className="h-8 w-8" />,
                title: "Free Delivery",
                description: "Doorstep service",
              },
              {
                icon: <Sparkles className="h-8 w-8" />,
                title: "Premium Quality",
                description: "Guaranteed satisfaction",
              },
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border hover:border-primary/20">
                <CardContent className="pt-6">
                  <div className="mb-4 inline-flex p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
              Testimonials
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              What Our Customers Say
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                rating: 5,
                comment: "The best laundry service I've ever used. Quick and professional!",
              },
              {
                name: "Mike Thompson",
                rating: 5,
                comment: "Great attention to detail and excellent customer service.",
              },
              {
                name: "Emily Davis",
                rating: 5,
                comment: "Love the convenience and quality of their service.",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.comment}"</p>
                  <p className="font-semibold">{testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50">
              Service Rates
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Weight-Based Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transparent per-kilogram pricing for all your laundry needs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Regular Wash & Fold",
                price: "4.99",
                unit: "per kg",
                features: [
                  "Machine wash & tumble dry",
                  "Folding service included",
                  "48-hour turnaround",
                  "Basic stain treatment"
                ],
                popular: false
              },
              {
                name: "Dry Cleaning",
                price: "8.99",
                unit: "per piece",
                features: [
                  "Professional dry cleaning",
                  "Pressing included",
                  "Delicate fabric care",
                  "Advanced stain removal"
                ],
                popular: true
              },
              {
                name: "Express Service",
                price: "6.99",
                unit: "per kg",
                features: [
                  "Same-day service",
                  "Priority processing",
                  "Express delivery",
                  "WhatsApp updates"
                ],
                popular: false
              }
            ].map((service, index) => (
              <Card 
                key={index} 
                className={`relative group hover:shadow-lg transition-all duration-300 ${
                  service.popular ? 'border-primary shadow-lg scale-105' : ''
                }`}
              >
                {service.popular && (
                  <Badge className="absolute top-4 right-4 bg-primary hover:bg-primary/90">
                    Most Popular
                  </Badge>
                )}
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{service.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-primary">${service.price}</span>
                    <span className="text-muted-foreground"> {service.unit}</span>
                  </div>
                  <ul className="space-y-3">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-muted-foreground">
                        <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full mt-6 ${service.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={service.popular ? 'default' : 'outline'}
                  >
                    Choose Service
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Additional Services */}
          <div className="mt-16">
            <h3 className="text-2xl font-semibold text-center mb-8">Additional Services</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { service: "Ironing Only", price: "2.99", unit: "per piece" },
                { service: "Stain Treatment", price: "3.99", unit: "per stain" },
                { service: "Heavy Items (Curtains, Blankets)", price: "12.99", unit: "per kg" },
                { service: "Alterations & Repairs", price: "from 5.99", unit: "per item" },
                { service: "Steam Press", price: "3.99", unit: "per piece" },
                { service: "Express Delivery", price: "4.99", unit: "per delivery" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-card rounded-lg border">
                  <span className="font-medium">{item.service}</span>
                  <span className="text-muted-foreground">
                    ${item.price} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Minimum Order Note */}
          <div className="mt-12 text-center text-muted-foreground">
            <p>Minimum order: 3kg for regular wash & fold services</p>
            <p className="mt-2">Free pickup & delivery for orders above $30</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Try Now & Get 10% Off Your First Order!
          </h2>
          <p className="text-xl mb-8">
            Join thousands of satisfied customers today
          </p>
          <Link href="/signup">
            <Button 
              size="lg" 
              className="bg-white text-black hover:bg-white/90 font-semibold"
            >
              Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white text-lg font-semibold mb-4">About Us</h4>
              <p className="text-sm">
                Professional laundry services committed to quality and convenience.
              </p>
            </div>
            <div>
              <h4 className="text-white text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/services" className="hover:text-white">Services</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/refund" className="hover:text-white">Refund Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li>1234 Laundry Street</li>
                <li>City, State 12345</li>
                <li>Phone: (123) 456-7890</li>
                <li>Email: info@laundry.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} Laundry Management. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
