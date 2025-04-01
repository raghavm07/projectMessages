import React from "react";

const CardListSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 cursor-pointer">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className=" bg-white shadow-md rounded-xl overflow-hidden transform transition duration-300 animate-pulse"
        >
          {/* Image placeholder */}
          <div className="w-full h-48 bg-gray-300"></div>
          {/* Content placeholders */}
          <div className="p-6">
            <div className="h-6 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default CardListSkeleton;
