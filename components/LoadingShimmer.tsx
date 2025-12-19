
import React from 'react';

const LoadingShimmer: React.FC = () => {
  return (
    <div className="p-4 grid grid-cols-3 gap-0.5 animate-pulse">
      {[...Array(18)].map((_, i) => (
        <div key={i} className="aspect-square bg-gray-200 dark:bg-stone-800 rounded-sm" />
      ))}
    </div>
  );
};

export default LoadingShimmer;
