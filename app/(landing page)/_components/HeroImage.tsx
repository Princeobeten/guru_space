import Image from 'next/image';

const CurvedBackground = () => {
  return (
    <div className="relative w-max max-w-xl mx-auto my-20">
      {/* Top curved shape */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-900 rounded-r-full opacity-80" />
      
      {/* Bottom curved shape */}
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-blue-900 rounded-l-full opacity-80" />
      
      {/* Content container */}
      <div className="relative z-10 p-4">
        <Image
          src="/huboutside.jpg"
          alt="Meeting room"
          width={800}
          height={600}
          className="rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};

export default CurvedBackground;