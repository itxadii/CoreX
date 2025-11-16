import React from 'react';

const ResponseLoader: React.FC = () => {
  return (
    // This wrapper aligns the loader to the start, like an AI message
    <div className="flex justify-start w-full my-2">
      <div 
        className="
          w-8 h-8        /* Size of the loader */
          rounded-full    /* Makes it a circle */
          animate-spin      /* Tailwind's rotation animation */
        " 
        style={{
          // 1. This creates the 4-color quadrants
          // We use the hex codes for the colors from your image
          background: 'conic-gradient(#fecaca 0% 25%, #a7f3d0 25% 50%, #fef08a 50% 75%, #bae6fd 75% 100%)',
          
          // 2. This uses a mask to cut the hole in the middle, turning it into a ring.
          // It creates a circle that is transparent in the center (65%)
          // and opaque on the outside, which acts as our "donut" shape.
          maskImage: 'radial-gradient(circle, transparent 65%, black 65%)',
          WebkitMaskImage: 'radial-gradient(circle, transparent 65%, black 65%)'
        }}
      />
    </div>
  );
};

export default ResponseLoader;