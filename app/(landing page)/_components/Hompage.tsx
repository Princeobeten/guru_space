import Link from 'next/link'
import React from 'react'
import Card from './Card'

const Homepage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-blue-900 text-white">
       <div className="relative z-10">
        <div className="container mx-auto px-4 py-16">
          <header className="text-center mb-16">
            <h1 className="text-5xl font-extrabold mb-4 animate-fade-in-down">
              <span className="text-white">
                CoWorking Space
              </span>
            </h1>
            <p className="text-xl max-w-2xl mx-auto animate-fade-in-up bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700">
              Elevate your work experience. Find and book your ideal coworking space today.
            </p>
          </header>

          <section className="mb-16 animate-fade-in">
            <h2 className="text-3xl font-bold mb-8 text-center animate-fade-in-down">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card 
                title="Browse Spaces" 
                description="Discover a diverse range of inspiring workspaces tailored to your needs."
                icon="🔍"
              />
              <Card 
                title="Easy Booking" 
                description="Seamlessly reserve your space with our user-friendly booking system."
                icon="📅"
              />
              <Card 
                title="Secure Payment" 
                description="Experience worry-free transactions with our trusted payment partners."
                icon="🔒"
              />
            </div>
          </section>
          
          <section className="text-center animate-fade-in-up pt-[-50px]">
            <Link href="/login" className="animate-fade-in-up inline-block bg-gradient-to-r from-bule-400 to-blue-900 text-white font-bold py-4 px-8 rounded-full text-xl hover:from-blue-900 hover:to-blue-900 transition duration-300 transform hover:scale-105 hover:shadow-lg">
              Explore Spaces
            </Link>
          </section>
        </div>
      </div>
      
      </div>
  );
}

export default Homepage