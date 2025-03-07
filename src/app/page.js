import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Star,
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
  Truck,
  PhoneCall,
  Shirt,
  Timer,
  Zap,
  Smartphone,
  Mail,
  MapPinned,
  // Import current social media icons
  Twitter,
  Facebook,
  Instagram
} from "lucide-react"
import { Navbar } from "@/components/ui/navbar"
import { AnimatedHero } from "@/components/ui/animated-hero"
import { ServicesSection } from "@/components/services-section.jsx"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <AnimatedHero />

      {/* How It Works Section */}
      <section className="py-32 bg-background relative">
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30 transition-colors font-medium px-4 py-1.5">
              Simple Process
            </Badge>
            <h2 className="text-4xl font-bold mb-4 tracking-tight">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our laundry service is designed to be effortless for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connection lines between steps (visible on md screens and up) */}
            <div className="hidden md:block absolute top-1/4 left-1/3 w-1/3 h-0.5 bg-gradient-to-r from-primary/50 to-primary/50 z-0"></div>
            <div className="hidden md:block absolute top-1/4 right-1/3 w-1/3 h-0.5 bg-gradient-to-r from-primary/50 to-primary/50 z-0"></div>

            {[
              {
                step: "1",
                title: "Schedule Pickup",
                description: "Book a convenient time for us to collect your laundry",
                icon: <Smartphone className="h-8 w-8" />,
              },
              {
                step: "2",
                title: "We Clean & Care",
                description: "Your clothes receive professional treatment",
                icon: <Shirt className="h-8 w-8" />,
              },
              {
                step: "3",
                title: "Delivery",
                description: "We return your fresh laundry to your doorstep",
                icon: <Truck className="h-8 w-8" />,
              },
            ].map((step, index) => (
              <div key={index} className="relative z-10">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary relative">
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">
                      {step.step}
                    </span>
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Schedule Now
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section with Gradient Border */}
      <section className="py-32 bg-muted/30 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%230ea5e9\' fillOpacity=\'1\' fillRule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '20px 20px' }}></div>
        <div className="container mx-auto px-6 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "10K+", label: "Happy Customers", icon: <Sparkles className="h-6 w-6 text-primary" /> },
              { number: "24/7", label: "Customer Support", icon: <PhoneCall className="h-6 w-6 text-primary" /> },
              { number: "99%", label: "Satisfaction Rate", icon: <Star className="h-6 w-6 text-primary" /> },
              { number: "50+", label: "Service Locations", icon: <MapPin className="h-6 w-6 text-primary" /> },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/20 hover:shadow-lg hover:translate-y-[-5px] transition-all duration-300"
              >
                <div className="flex justify-center mb-4">{stat.icon}</div>
                <h3 className="text-4xl font-bold text-primary mb-2">{stat.number}</h3>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <ServicesSection />

      {/* Features Section with Image */}
      <section className="py-32 bg-muted/30 relative overflow-hidden">
        <div className="container mx-auto px-6 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30 transition-colors font-medium px-4 py-1.5">
                Why Choose Us
              </Badge>
              <h2 className="text-4xl font-bold mb-6 tracking-tight">The Smart Choice for Your Laundry</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Experience the perfect blend of technology and service excellence with our modern laundry solutions.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    icon: <Clock className="h-5 w-5" />,
                    title: "Fast Service",
                    description: "24-hour turnaround time",
                  },
                  {
                    icon: <Shield className="h-5 w-5" />,
                    title: "Secure Handling",
                    description: "Protected garment care",
                  },
                  {
                    icon: <Truck className="h-5 w-5" />,
                    title: "Free Delivery",
                    description: "Doorstep service",
                  },
                  {
                    icon: <Sparkles className="h-5 w-5" />,
                    title: "Premium Quality",
                    description: "Guaranteed satisfaction",
                  },
                ].map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="p-2 rounded-full bg-primary/10 text-primary">{feature.icon}</div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="mt-8 bg-primary hover:bg-primary/90">Learn More About Us</Button>
            </div>

            <div className="order-1 md:order-2 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent z-10"></div>
                <Image
                  src="https://images.unsplash.com/photo-1521656693074-0ef32e80a5d5?auto=format&fit=crop&q=80"
                  width={800}
                  height={600}
                  alt="Laundry Service"
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-6 bg-primary text-white p-4 rounded-xl shadow-lg z-20">
                <div className="text-3xl font-bold">15%</div>
                <div className="text-sm">First Order Discount</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30 transition-colors font-medium px-4 py-1.5">
              Testimonials
            </Badge>
            <h2 className="text-4xl font-bold mb-4 tracking-tight">What Our Customers Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Regular Customer",
                avatar: "/placeholder.svg?height=100&width=100",
                rating: 5,
                comment:
                  "The best laundry service I've ever used. Quick, professional, and my clothes have never looked better!",
              },
              {
                name: "Mike Thompson",
                role: "Business Owner",
                avatar: "/placeholder.svg?height=100&width=100",
                rating: 5,
                comment:
                  "Great attention to detail and excellent customer service. They handle all our office linens and staff uniforms perfectly.",
              },
              {
                name: "Emily Davis",
                role: "Working Professional",
                avatar: "/placeholder.svg?height=100&width=100",
                rating: 5,
                comment:
                  "Love the convenience and quality of their service. The app makes scheduling pickups so easy, and the results are always perfect.",
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border hover:border-primary/20"
              >
                <CardContent className="pt-8 relative">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="rounded-full border-4 border-background overflow-hidden w-16 h-16">
                      <Image
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=0ea5e9&color=fff&size=64`}
                        width={64}
                        height={64}
                        alt={testimonial.name}
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex justify-center mb-4 pt-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 text-center italic">"{testimonial.comment}"</p>
                  <div className="text-center">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* View more testimonials button */}
          <div className="text-center mt-12">
            <Button variant="outline">View More Testimonials</Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30 transition-colors font-medium px-4 py-1.5">
              Service Rates
            </Badge>
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No hidden fees - just straightforward pricing for all your laundry needs
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
                  "Basic stain treatment",
                ],
                popular: false,
              },
              {
                name: "Dry Cleaning",
                price: "8.99",
                unit: "per piece",
                features: [
                  "Professional dry cleaning",
                  "Pressing included",
                  "Delicate fabric care",
                  "Advanced stain removal",
                ],
                popular: true,
              },
              {
                name: "Express Service",
                price: "6.99",
                unit: "per kg",
                features: ["Same-day service", "Priority processing", "Express delivery", "WhatsApp updates"],
                popular: false,
              },
            ].map((service, index) => (
              <Card
                key={index}
                className={`relative group hover:shadow-xl transition-all duration-300 ${service.popular ? "border-primary shadow-xl md:scale-105 z-10" : ""
                  }`}
              >
                {service.popular && (
                  <div className="absolute -top-8 inset-x-0 flex justify-center">
                    <Badge className="bg-primary  px-4 py-1.5 text-sm font-medium ">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardContent className={`p-8 ${service.popular ? "pt-10" : "pt-8"}`}>
                  <h3 className="text-xl font-semibold mb-4 text-center">{service.name}</h3>
                  <div className="mb-6 text-center">
                    <span className="text-4xl font-bold text-primary">${service.price}</span>
                    <span className="text-muted-foreground"> {service.unit}</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-muted-foreground">
                        <CheckCircle2 className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${service.popular ? "bg-primary hover:bg-primary/90" : ""}`}
                    variant={service.popular ? "default" : "outline"}
                    size="lg"
                  >
                    Choose Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Services */}
          <div className="mt-20">
            <h3 className="text-2xl font-semibold text-center mb-8">Additional Services</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { service: "Ironing Only", price: "2.99", unit: "per piece" },
                { service: "Stain Treatment", price: "3.99", unit: "per stain" },
                { service: "Heavy Items (Curtains, Blankets)", price: "12.99", unit: "per kg" },
                { service: "Alterations & Repairs", price: "from 5.99", unit: "per item" },
                { service: "Steam Press", price: "3.99", unit: "per piece" },
                { service: "Express Delivery", price: "4.99", unit: "per delivery" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-5 bg-card rounded-lg border hover:border-primary/20 hover:shadow-md transition-all"
                >
                  <span className="font-medium">{item.service}</span>
                  <Badge variant="outline" className="text-primary border-primary/30 whitespace-nowrap">
                    ${item.price} {item.unit}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Minimum Order Note */}
          <div className="mt-12 text-center text-muted-foreground bg-card/50 p-6 rounded-lg border max-w-2xl mx-auto">
            <p className="font-medium text-foreground mb-2">Important Information</p>
            <p>Minimum order: 3kg for regular wash & fold services</p>
            <p className="mt-2">Free pickup & delivery for orders above $30</p>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30 transition-colors font-medium px-4 py-1.5">
                Mobile App
              </Badge>
              <h2 className="text-4xl font-bold mb-6 tracking-tight">Download Our App for Easy Scheduling</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Get the convenience of our laundry service right in your pocket. Schedule pickups, track orders, and
                manage payments with ease.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {[
                  {
                    icon: (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-apple"
                      >
                        <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
                        <path d="M10 2c1 .5 2 2 2 5" />
                      </svg>
                    ),
                    textTop: "Download on the",
                    textBottom: "App Store",
                    bgColor: "bg-primary",
                    hoverColor: "hover:bg-primary/90",
                  },
                  {
                    icon: (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-play"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    ),
                    textTop: "GET IT ON",
                    textBottom: "Google Play",
                    bgColor: "bg-violet",
                    hoverColor: "hover:bg-violet/90",
                  },
                ].map((btn, index) => (
                  <Button
                    key={index}
                    className={`${btn.bgColor} ${btn.hoverColor} text-white flex items-center gap-3 h-[56px] px-6 transition-all duration-300 shadow-md rounded-md`}
                    variant="default"
                  >
                    {btn.icon}
                    <div className="text-left">
                      <div className="text-sm opacity-80">{btn.textTop}</div>
                      <div className="text-lg font-semibold leading-none">{btn.textBottom}</div>
                    </div>
                  </Button>
                ))}
              </div>


              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background overflow-hidden">
                      <Image
                        src={[
                          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop',
                          'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=32&h=32&fit=crop',
                          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop'
                        ][i]}
                        width={32}
                        height={32}
                        alt={[
                          'Smiling woman with red hair',
                          'Man in grey shirt',
                          'Woman with blonde hair'
                        ][i]}
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">4.9/5</span> from over 2,000 reviews
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative mx-auto w-[280px]">
                {/* Phone frame mockup */}
                <div className="relative rounded-[40px] overflow-hidden border-[14px] border-gray-900 shadow-2xl bg-gray-900 w-[280px] h-[580px]">
                  {/* App screenshot - Updated URL */}
                  <Image
                    src="https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&q=80"
                    width={600}
                    height={1200}
                    alt="Mobile App"
                    className="object-cover w-full h-full rounded-3xl"
                  />
                  {/* Phone notch */}
                  <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-xl"></div>
                </div>
                {/* Phone button */}
                <div className="absolute right-[-2px] top-32 h-12 w-1 bg-gray-800 rounded-l-lg"></div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 bg-card p-4 rounded-xl shadow-lg border border-border">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Real-time tracking</span>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg border border-border">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Easy scheduling</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-primary-foreground/5 to-transparent opacity-20"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Try Now & Get 15% Off Your First Order!</h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Join thousands of satisfied customers and experience the convenience of our professional laundry service
            today.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold px-8 py-6 text-base shadow-lg transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px]"
            >
              Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          {/* Floating elements for visual interest */}
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-primary-foreground/10"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-primary-foreground/10"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <h4 className="text-white text-lg font-semibold mb-6">About Us</h4>
              <p className="text-sm mb-6">
                Professional laundry services committed to quality and convenience. We've been serving our community
                with excellence since 2010.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </Link>
              </div>
            </div>
            <div>
              <h4 className="text-white text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="hover:text-white transition-colors">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-lg font-semibold mb-6">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/refund" className="hover:text-white transition-colors">
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-lg font-semibold mb-6">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <MapPinned className="h-5 w-5 text-primary" />
                  <span>1234 Laundry Street, City, State 12345</span>
                </li>
                <li className="flex items-center gap-3">
                  <PhoneCall className="h-5 w-5 text-primary" />
                  <span>(123) 456-7890</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>info@laundry.com</span>
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Mon-Sat: 8AM - 8PM</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} Laundry Management. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

