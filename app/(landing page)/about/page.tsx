import Image from 'next/image'
import React from 'react'

const page = () => {
  return (
   <div className="text-center min-h-screen bg-gradient-to-br from-navy to-blue-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-center animate-fade-in-down mb-8 bg-clip-text text-transparent bg-gradient-to-r text-white">
          About Our Coworking Space
        </h1>

        <div className="lg:text-left grid grid-cols-1 md:grid-cols-2 gap-8 pt-2 mb-16">
          <div className="space-y-4 animate-fade-in-up">
            <p className="text-white">
              Welcome to our innovative coworking space, where creativity meets productivity. We've designed an environment that fosters collaboration, inspiration, and growth for professionals from all walks of life.
            </p>
            <p className="text-white">
              Our state-of-the-art facilities offer a perfect blend of comfort and functionality, ensuring that you have everything you need to succeed in your work endeavors.
            </p>
            <p className="text-white">
              Whether you're a freelancer, a startup, or an established business, our diverse range of spaces cater to all your needs, from quiet focus areas to vibrant collaborative zones.
            </p>
          </div>
          <div className="relative h-64 md:h-auto animate-fade-in-up">
            <Image 
              src="/huboutside.jpg" 
              alt="Our main coworking area" 
              layout="fill" 
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="lg:text-left hover:scale-105  animate-fade-in-up bg-blue-800 bg-opacity-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-white">Modern Amenities</h3>
            <p className="text-blue-300">High-speed internet, ergonomic furniture, and the latest tech equipment to support your work.</p>
          </div>
          <div className="lg:text-left hover:scale-105  animate-fade-in-down bg-blue-800 bg-opacity-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-white">Community Events</h3>
            <p className="text-blue-300">Regular networking sessions, workshops, and social events to help you connect and grow.</p>
          </div>
          <div className="lg:text-left hover:scale-105  animate-fade-in-up bg-blue-800 bg-opacity-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-white">Flexible Plans</h3>
            <p className="text-blue-300">Choose from a variety of membership options to suit your unique needs and schedule.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page
