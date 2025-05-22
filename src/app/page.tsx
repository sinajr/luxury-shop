
"use client";

import React, { useRef, useState, useEffect } from 'react'; // Added useState, useEffect
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, ShoppingBag, Watch, Zap } from 'lucide-react';
import { ProductCard } from '@/components/products/product-card';
import { fetchAllProducts } from '@/services/productService'; // Import RTDB service
import type { Product } from '@/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { ParticlesBackground } from '@/components/layout/particles-background';
import { INTERACTIVE_BOX_PARTICLE_OPTIONS } from '@/config/particles-options';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

interface HeroSlide {
  id: string;
  imageUrl: string;
  altText: string;
  title: React.ReactNode;
  subtitle: string;
  dataAiHint: string;
}

const heroSlides: HeroSlide[] = [
  {
    id: 'slide1',
    imageUrl: 'https://picsum.photos/seed/luxurygoods/1200/400',
    altText: 'Showcase of Luxury Goods',
    title: <>Welcome to <span className="text-accent">Elite Stuff Trade</span></>,
    subtitle: 'Explore an exclusive collection of luxury watches, high-end sneakers, and designer apparel.',
    dataAiHint: 'luxury items watch'
  },
  {
    id: 'slide2',
    imageUrl: 'https://picsum.photos/seed/eleganttime/1200/400',
    altText: 'Elegant Timepieces',
    title: <>Discover <span className="text-accent">Timeless Elegance</span></>,
    subtitle: 'Curated watches from world-renowned brands like Rolex, Patek Philippe, and more.',
    dataAiHint: 'elegant watches'
  },
  {
    id: 'slide3',
    imageUrl: 'https://picsum.photos/seed/fashionforward/1200/400',
    altText: 'Fashion Forward Apparel',
    title: <>Step Up Your <span className="text-accent">Style Game</span></>,
    subtitle: 'The latest trends in designer apparel and exclusive sneaker drops.',
    dataAiHint: 'designer fashion'
  },
];

export default function HomePage() {
  const autoplayPlugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true }));
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoadingProducts(true);
      const allProducts = await fetchAllProducts();
      setFeaturedProducts(allProducts.slice(0, 8)); // Take first 8 for featured
      setIsLoadingProducts(false);
    };
    loadProducts();
  }, []);

  return (
    <div className="space-y-16 py-8 md:py-12">
      {/* Hero Section - Carousel */}
      <section className="text-center">
        <Carousel
          plugins={[autoplayPlugin.current]}
          className="w-full rounded-lg overflow-hidden shadow-2xl mb-8"
          opts={{
            loop: true,
          }}
        >
          <CarouselContent>
            {heroSlides.map((slide, index) => (
              <CarouselItem key={slide.id}>
                <div className="relative w-full h-64 md:h-96">
                  <Image
                    src={slide.imageUrl}
                    alt={slide.altText}
                    fill
                    sizes="(max-width: 768px) 100vw, 1200px"
                    className="object-cover"
                    priority={index === 0}
                    data-ai-hint={slide.dataAiHint}
                  />
                  <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center p-4">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
                      {slide.title}
                    </h1>
                    <p className="mt-4 max-w-3xl text-lg md:text-xl text-neutral-200">
                      {slide.subtitle}
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transform hover:scale-105 transition-transform">
            <Link href="/advisor">
              <Sparkles className="mr-2 h-5 w-5" /> Get Personalized Advice
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="shadow-lg transform hover:scale-105 transition-transform">
            <Link href="/products">
              <ShoppingBag className="mr-2 h-5 w-5" /> Explore Collection
            </Link>
          </Button>
        </div>
      </section>

      {/* Interactive Logo Box Section - Full Screen Viewport Centered */}
      <section
        className="relative w-screen h-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden flex items-center justify-center"
      >
        <div
          id="interactive-logo-box"
          className="relative w-full h-full flex items-center justify-center" 
        >
          <ParticlesBackground
            containerId="home-logo-particles"
            className="absolute top-0 left-0 w-full h-full -z-10" 
            optionsOverride={INTERACTIVE_BOX_PARTICLE_OPTIONS}
          />
          <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
            <Image
              src="/logo.png"
              alt="Elite Stuff Trade Logo"
              width={400} 
              height={387} 
              className="h-36 sm:h-48 md:h-56 w-auto drop-shadow-2xl"
            />
            <p className="mt-4 text-center text-lg md:text-xl text-foreground/90 font-semibold bg-background/70 backdrop-blur-sm px-4 py-2 rounded-md">
              Curated Luxury. Unrivaled Experience.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="py-12 bg-card rounded-lg shadow-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Featured Collections
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Discover curated selections from the world's most sought-after luxury brands.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <InfoCard
              title="Luxury Timepieces"
              description="Explore iconic watches from Rolex, Patek Philippe, and Audemars Piguet."
              imageUrl="https://picsum.photos/seed/watches/400/300"
              dataAiHint="luxury watch"
            />
            <InfoCard
              title="High-End Sneakers"
              description="Find limited edition Nikes, Adidas Yeezys, and designer collaborations."
              imageUrl="https://picsum.photos/seed/sneakers/400/300"
              dataAiHint="designer sneakers"
            />
            <InfoCard
              title="Designer Apparel"
              description="Shop the latest collections from Gucci, Prada, Balenciaga, and more."
              imageUrl="https://picsum.photos/seed/apparel/400/300"
              dataAiHint="designer clothing"
            />
          </div>
        </div>
      </section>

      {/* Featured Products Section - Carousel */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Our Featured Selection
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Handpicked luxury items, curated just for you.
            </p>
          </div>
          {isLoadingProducts ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : featuredProducts.length > 0 ? (
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full max-w-xs sm:max-w-2xl md:max-w-4xl lg:max-w-6xl mx-auto"
            >
              <CarouselContent className="-ml-1">
                {featuredProducts.map(product => (
                  <CarouselItem key={product.id} className="pl-1 md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <ProductCard product={product} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 hidden sm:flex" />
              <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 hidden sm:flex" />
            </Carousel>
          ) : (
            <p className="text-center text-muted-foreground">No featured products available at the moment.</p>
          )}
          <div className="mt-10 text-center">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transform hover:scale-105 transition-transform">
              <Link href="/products">
                <ShoppingBag className="mr-2 h-5 w-5" /> Explore Full Collection
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Style Advisor Promotional Section - MOVED TO THE END */}
      <section className="my-16 p-8 bg-card rounded-lg shadow-xl text-center border border-accent/30">
        <Sparkles className="mx-auto h-12 w-12 text-accent mb-4" />
        <h2 className="text-3xl font-bold text-primary mb-3">
          Need Style Guidance?
        </h2>
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
          Discover your perfect luxury look. Our AI Style Advisor offers personalized recommendations for watches, sneakers, apparel, and more, tailored to your unique taste.
        </p>
        <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transform hover:scale-105 transition-transform">
          <Link href="/advisor">
            <Sparkles className="mr-2 h-5 w-5" /> Try the AI Style Advisor
          </Link>
        </Button>
      </section>

    </div>
  );
}

interface InfoCardProps {
  title: string;
  description: string;
  imageUrl: string;
  dataAiHint: string;
}

function InfoCard({ title, description, imageUrl, dataAiHint }: InfoCardProps) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="relative w-full h-40 rounded-md overflow-hidden mb-4">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
          className="object-cover"
          data-ai-hint={dataAiHint}
        />
      </div>
      <h3 className="text-xl font-semibold text-primary mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function CardSkeleton() { // Simple skeleton for product cards
  return (
    <div className="flex flex-col space-y-3 p-4 border rounded-lg shadow-md bg-card">
      <Skeleton className="h-[180px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-1/4 mt-2" />
      </div>
      <Skeleton className="h-9 w-full mt-4" />
    </div>
  );
}
