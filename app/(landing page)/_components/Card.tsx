import React from 'react';

interface CardProps {
  title: string;
  description: string;
  icon?: string;
}

const ServiceCard: React.FC<CardProps> = ({ title, description, icon }) => {
  return (
    <div className="bg-gradient-to-r from-blue-900 to-navy bg-opacity-10 animate-fade-in-up backdrop-filter backdrop-blur-lg rounded-xl p-6 transition duration-300 transform hover:scale-105 hover:bg-opacity-20 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
};

export default ServiceCard;