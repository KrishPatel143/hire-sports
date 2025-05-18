"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductImageGallery({ images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayImages, setDisplayImages] = useState([]);

  useEffect(() => {
    // Ensure images is properly flattened and filtered
    // Sometimes images might be nested arrays or contain undefined values
    let processedImages = [];

    if (Array.isArray(images)) {
      // Flatten in case images is an array of arrays
      processedImages = images
        .flat()
        .filter((img) => img && typeof img === "string");
    }

    setDisplayImages(
      processedImages.length > 0 ? processedImages : ["/placeholder.svg"]
    );
  }, [images]);

  const goToPrevious = () => {
    setCurrentIndex(
      currentIndex === 0 ? displayImages.length - 1 : currentIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex(
      currentIndex === displayImages.length - 1 ? 0 : currentIndex + 1
    );
  };

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  if (!displayImages.length) {
    return (
      <div className="aspect-square w-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main image with navigation */}
      <div className="relative aspect-square bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
        <img
          src={displayImages[currentIndex]}
          alt="Product image"
          className="h-full w-full object-contain"
        />

        {displayImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-black/70 rounded-full hover:bg-white/90 dark:hover:bg-black/90"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">Previous image</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-black/70 rounded-full hover:bg-white/90 dark:hover:bg-black/90"
              onClick={goToNext}
            >
              <ChevronRight className="h-6 w-6" />
              <span className="sr-only">Next image</span>
            </Button>

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {currentIndex + 1} / {displayImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                index === currentIndex
                  ? "border-primary"
                  : "border-transparent hover:border-gray-300 dark:hover:border-gray-700"
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
