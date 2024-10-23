'use client';

import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import ServiceCard from "./Card";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Homepage = () => {
  const carouselImages = [
    { src: "/b1.jpg", alt: "Coworking space 4" },
    { src: "/c2.jpg", alt: "Coworking space 2" },
    { src: "/c3.jpg", alt: "Coworking space 3" },
    { src: "/huboutside.jpg", alt: "Coworking space 5" },
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  return (
    <div className="min-h-screen bg-white mx-8 px-4">
      <header className="flex flex-col lg:flex-row items-center justify-between py-16 gap-8 mb-10 -mt-10 lg:mt-0">
        <div className="w-full lg:w-1/2 text-left">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-navy">
            CoWorking Space
          </h1>
          <p className="text-lg text-navy/65 mb-6">
            Elevate your work experience. Find and book your ideal coworking
            space today.
          </p>
          <Link
            href="/login"
            className="inline-block bg-white text-navy border-2 border-navy font-medium py-2 px-6 rounded-md hover:bg-navy hover:text-white transition-colors duration-300 mb-6"
          >
            Book now
          </Link>
        </div>

        <div className="relative w-full ml-10 lg:ml-0 lg:w-1/2 max-w-xl">
          <div className="absolute -top-8 -right-4 w-48 h-32 bg-gradient-to-r from-blue-900 to-navy rounded-r-full" />
          <div className="absolute -top-4 -right-0 w-48 h-32 bg-transparent border border-blue-700 rounded-r-full" />

          <div className="absolute -bottom-8 -left-14 w-48 h-32 bg-gradient-to-r from-blue-900 to-navy rounded-l-full" />
          <div className="absolute -bottom-12 -left-10 w-48 h-32 bg-transparent border border-blue-700 rounded-l-full" />

          <div className="relative z-10 pr-10">
            <Image
              src={carouselImages[currentImageIndex].src}
              alt={carouselImages[currentImageIndex].alt}
              width={600}
              height={400}
              className="rounded-lg shadow-md w-full transition-opacity duration-1000"
            />
          </div>
        </div>
      </header>

      <section className="mb-16 py-10 animate-fade-in">
        <h2 className="text-3xl font-bold mb-8 text-center animate-fade-in-down text-navy">
          Our Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ServiceCard
            title="Browse Spaces"
            description="Discover a diverse range of inspiring workspaces tailored to your needs."
            icon="🔍"
          />
          <ServiceCard
            title="Easy Booking"
            description="Seamlessly reserve your space with our user-friendly booking system."
            icon="📅"
          />
          <ServiceCard
            title="Secure Payment"
            description="Experience worry-free transactions with our trusted payment partners."
            icon="🔒"
          />
        </div>
      </section>

      <section className="mb-16 py-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-navy">
            Explore our Space
          </h2>

          <div className="relative px-8">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {carouselImages.map((image, index) => (
                  <CarouselItem
                    key={index}
                    className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
                  >
                    <Card className="border">
                      <CardContent className="p-1">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                          <Image
                            src={image.src}
                            alt={image.alt}
                            width={400}
                            height={300}
                            className="object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <div className="absolute -left-4 top-1/2 -translate-y-1/2">
                <CarouselPrevious className="h-12 w-12 border-2 border-navy text-navy hover:bg-navy hover:text-white" />
              </div>
              <div className="absolute -right-4 top-1/2 -translate-y-1/2">
                <CarouselNext className="h-12 w-12 border-2 border-navy text-navy hover:bg-navy hover:text-white" />
              </div>
            </Carousel>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/sign-up"
              className="inline-block bg-white text-navy border-2 border-navy font-medium py-2 px-6 rounded-md hover:bg-navy hover:text-white transition-colors duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
