"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/service-card"; // Fixed import path
import { Shirt, Timer, Zap, Sparkles, Home, Briefcase } from 'lucide-react';
import { motion } from "framer-motion";

const categories = [
  { id: "all", label: "All Services" },
  { id: "personal", label: "Personal" },
  { id: "business", label: "Business" },
  { id: "specialty", label: "Specialty" },
];

const services = [
  {
    id: 1,
    icon: <Shirt className="h-8 w-8 text-white" />,
    title: "Dry Cleaning",
    description: "Professional care for your delicate garments with eco-friendly solvents and expert handling.",
    features: ["Stain removal", "Pressing included", "Fabric protection", "48-hour service"],
    imageSrc: "https://images.unsplash.com/photo-1489274495757-95c7c837b101?auto=format&fit=crop&q=80&w=1920",
    category: "personal",
    popular: true
  },
  {
    id: 2,
    icon: <Timer className="h-8 w-8 text-white" />,
    title: "Express Wash",
    description: "Quick turnaround for urgent requirements with our premium express service.",
    features: ["3-hour service", "Free pickup", "Quality check", "SMS notifications"],
    imageSrc: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&q=80&w=1920",
    category: "personal"
  },
  {
    id: 3,
    icon: <Zap className="h-8 w-8 text-white" />,
    title: "Premium Care",
    description: "Specialized treatment for luxury items and delicate fabrics that require extra attention.",
    features: ["Hand washing", "Expert handling", "Premium products", "Protective packaging"],
    imageSrc: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&q=80&w=1920",
    category: "specialty"
  },
  {
    id: 4,
    icon: <Home className="h-8 w-8 text-white" />,
    title: "Home Linens",
    description: "Complete care for all your home textiles including bedding, curtains, and upholstery.",
    features: ["Deep cleaning", "Stain treatment", "Fabric softening", "Careful folding"],
    imageSrc: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1920",
    category: "specialty"
  },
  {
    id: 5,
    icon: <Briefcase className="h-8 w-8 text-white" />,
    title: "Business Uniforms",
    description: "Professional laundering and maintenance for company uniforms and workwear.",
    features: ["Bulk discounts", "Consistent quality", "Inventory management", "Scheduled service"],
    imageSrc: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=1920",
    category: "business"
  },
  {
    id: 6,
    icon: <Sparkles className="h-8 w-8 text-white" />,
    title: "Wedding Gown Care",
    description: "Specialized cleaning and preservation for wedding dresses and formal attire.",
    features: ["Preservation box", "Stain removal", "Hand finishing", "Lifetime guarantee"],
    imageSrc: "https://images.unsplash.com/photo-1549416878-b9ca95e26903?auto=format&fit=crop&q=80&w=1920",
    category: "specialty"
  }
];

export function ServicesSection() {
  const [activeCategory, setActiveCategory] = useState("all");
  
  const filteredServices = activeCategory === "all" 
    ? services 
    : services.filter(service => service.category === activeCategory);

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-primary font-medium tracking-wider text-sm uppercase">Our Services</span>
          <h2 className="mt-3 text-4xl font-bold tracking-tight">Professional Laundry Solutions</h2>
          <div className="mt-8 inline-flex bg-muted rounded-lg p-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  px-6 py-2.5 text-sm font-medium rounded-md transition-all
                  ${activeCategory === category.id 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-foreground/80'}
                `}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => (
            <div 
              key={service.id}
              className="relative bg-card rounded-xl border shadow-sm"
            >
              <div className="relative">
                <div className="aspect-[16/9] rounded-t-xl overflow-hidden">
                  <img
                    src={service.imageSrc}
                    alt={service.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-t-xl" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary rounded-lg">
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white">{service.title}</h3>
                  </div>
                </div>
                {service.popular && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-primary/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                      Popular
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <p className="text-muted-foreground mb-4">{service.description}</p>
                <ul className="space-y-3">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-foreground/80">
                      <div className="h-5 w-5 mr-3 rounded-full bg-primary/10 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button 
            size="lg"
            className="bg-primary text-white hover:bg-primary/90 px-8"
          >
            Explore All Services
          </Button>
        </div>
      </div>
    </section>
  );
}
