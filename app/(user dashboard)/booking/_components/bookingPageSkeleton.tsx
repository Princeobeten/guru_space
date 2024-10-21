export const BookingPageSkeleton = () => {
  return (
    <div className="min-h-screen w-full bg-gray-50 py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          {/* Header Section */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded-md w-1/3 mb-4"></div>
          </div>

          {/* Calendar Skeleton */}
          <div className="mb-8">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="grid grid-cols-7 gap-2">
              {/* {[...Array(5)].map((_, i) => (
                <div key={`header-${i}`} className="h-8 bg-gray-100 rounded"></div>
              ))} */}
              {[...Array(25)].map((_, i) => (
                <div key={`day-${i}`} className="h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>

          {/* Time Selection Skeleton */}
          <div className="space-y-6">
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded-md"></div>
            </div>

            {/* Duration Skeleton */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded-md"></div>
            </div>

            {/* Booking Type Toggle Skeleton */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-48"></div>
              </div>
              <div className="h-6 w-11 bg-gray-200 rounded-full"></div>
            </div>

            {/* Number of Seats Skeleton */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded-md"></div>
            </div>

            {/* Price Calculator Skeleton */}
            <div className="border rounded-lg p-6">
              <div className="h-5 bg-gray-200 rounded w-36 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mt-4"></div>
              </div>
            </div>

            {/* Button Skeleton */}
            <div className="h-12 bg-gray-200 rounded-md w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};