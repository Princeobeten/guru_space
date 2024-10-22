import React from 'react';

const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen mb-10 py-20 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Information Section Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name Input Skeleton */}
              <div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
              
              {/* Last Name Input Skeleton */}
              <div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            
            {/* Phone Input Skeleton */}
            <div>
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            {/* Email Input Skeleton */}
            <div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            {/* Submit Button Skeleton */}
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Password Reset Section Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="h-16 w-full bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Terms Section Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-16 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;