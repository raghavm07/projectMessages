import React from "react";
import { useNavigate } from "react-router-dom";

const GreetingCardSkeleton = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center space-y-6 bg-gradient-to-br from-indigo-500 to-purple-600">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center w-full p-4">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg"
        >
          Home
        </button>
        <div className="w-48 h-8 bg-gray-300 rounded-lg animate-pulse"></div>
        <div className="flex space-x-4">
          {/* {Array(4)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="w-24 h-10 bg-gray-300 rounded-lg animate-pulse"
              ></div>
            ))} */}
        </div>
      </div>

      {/* Card Skeleton */}
      <div
        className="relative bg-gray-200 rounded-lg shadow-lg animate-pulse"
        style={{
          height: "600px",
          width: "800px",
        }}
      >
        {/* Skeleton for draggable text items */}
        {/* {Array(3)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className="absolute bg-gray-400 rounded-md px-4 py-2"
              style={{
                top: `${50 + index * 80}px`,
                left: `${50 + index * 50}px`,
                width: "150px",
                height: "30px",
              }}
            ></div>
          ))} */}
      </div>

      {/* Loading Indicator */}
      {/* <div className="fixed inset-[-5vh] bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="text-white text-xl">Loading...</div>
      </div> */}
    </div>
  );
};

export default GreetingCardSkeleton;
