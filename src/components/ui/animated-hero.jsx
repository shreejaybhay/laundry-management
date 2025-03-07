'use client';

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export function AnimatedHero() {
  return (
    <div className="relative w-full min-h-screen pt-16"> {/* Added pt-16 for navbar space */}
      {/* Background Image Container */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="https://i.postimg.cc/WpXvDFfW/steptodown-com840353.jpg"
          alt="Laundry Service"
          fill
          className="object-cover opacity-40"
          priority
          sizes="100vw"
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/60 to-blue-400/50" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center"
      >
        <Badge className="mb-6 bg-white/10 text-white hover:bg-white/20 transition-colors">
          ✨ Special Offer: Get 10% Off Your First Order
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
          Get Your Laundry Done
          <span className="block">with Ease!</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-white/90">
          Professional laundry & dry cleaning services at your doorstep. 
          Experience the convenience of modern laundry service.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            variant="default"
            className="bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Book Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-white text-white hover:bg-white/10 transition-colors"
          >
            Learn More
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
