import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-6 h-6 border-4 border-navy border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;
