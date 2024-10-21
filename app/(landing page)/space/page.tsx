"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaMapMarkerAlt } from 'react-icons/fa'

const SpacePage = () => {
  const [filter, setFilter] = useState('all')

  const spaces = [
    { id: 1, name: 'Co Space 1', type: '4 Seats', price: 300, image: '/c1.jpg', location: 'Etta Agbo' },
    { id: 2, name: 'Co Space 2', type: '4 Seats', price: 300, image: '/c2.jpg', location: 'Etta Agbo' },
    { id: 3, name: 'Co Space 3', type: '4 Seats', price: 300, image: '/c3.jpg', location: 'Etta Agbo' },
    { id: 4, name: 'Conference Room', type: '8 Seats', price: 300, image: '/b1.jpg', location: 'Etta Agbo' },
  ]

  const filteredSpaces = filter === 'all' ? spaces : spaces.filter(space => space.type === filter)

  return (
      <div className="min-h-screen bg-gradient-to-br from-navy to-blue-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r text-white animate-fade-in-down">
            Explore Our Spaces
          </h1>

          <div className="flex justify-center mb-8 space-x-4 animate-fade-in-up">
            <button 
              onClick={() => setFilter('all')} 
              className={`px-4 py-2 rounded-full ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-blue-900 text-blue-200'} hover:bg-blue-700 transition duration-300`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('4 Seats')} 
              className={`px-4 py-2 rounded-full ${filter === '4 Seats' ? 'bg-blue-500 text-white' : 'bg-blue-900 text-blue-200'} hover:bg-blue-700 transition duration-300`}
            >
              Co Space (4 Seats)
            </button>
            <button 
              onClick={() => setFilter('8 Seats')} 
              className={`px-4 py-2 rounded-full ${filter === '8 Seats' ? 'bg-blue-500 text-white' : 'bg-blue-900 text-blue-200'} hover:bg-blue-700 transition duration-300`}
            >
              Conference Room (8 Seats)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-down">
            {filteredSpaces.map(space => (
              <div key={space.id} className="bg-blue-800 bg-opacity-50 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
                <div className="relative h-48">
                  <Image 
                    src={space.image} 
                    alt={space.name} 
                    layout="fill" 
                    objectFit="cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-white">{space.name}</h3>
                  <p className="text-white mb-2">{space.type[0]} <span className='text-blue-300'>Seats Capacity</span></p>
                  <p className="text-blue-300 mb-4 flex items-center">
                    <FaMapMarkerAlt className="text-white mr-2" /> {space.location}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg lg:text-xl font-bold text-white">NGN{space.price} - 1 hr / seat</span>
                    <Link href="/bookSpaces" className="binline-block bg-gradient-to-r from-bule-400 from-blue-700 to-blue-800 text-white font-medium text-sm lg:text-md py-2 px-4 rounded-full  transition duration-300 transform hover:scale-105 hover:shadow-lg">
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  )
}

export default SpacePage
