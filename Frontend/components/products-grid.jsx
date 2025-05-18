"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import AddToCartButton from "@/components/add-to-cart-button";

// Create a new ProductCard component to handle image switching
function ProductCard({ product }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0] || null
  );

  return (
    <Card key={product._id} className="overflow-hidden group">
      <Link href={`/products/${product._id}`}>
        <div className="aspect-square overflow-hidden relative">
          <img
            src={product.images[currentImage]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/products/${product._id}`}>
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-2">
          <p className="font-bold">${product.price.toFixed(2)}</p>
          {product.compareAtPrice && (
            <p className="text-sm text-gray-500 line-through">
              ${product.compareAtPrice.toFixed(2)}
            </p>
          )}
        </div>

        {/* Color selection */}
        {product.colors && product.colors.length > 0 && (
          <div className="mt-3">
            <div className="flex gap-2 mt-1">
              {product.colors.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full border ${
                    selectedColor === color
                      ? "ring-2 ring-primary ring-offset-2"
                      : ""
                  }`}
                  style={{
                    backgroundColor: getColorHex(color),
                    borderColor: isLightColor(color)
                      ? "#d1d5db"
                      : getColorHex(color),
                  }}
                  onClick={() => setSelectedColor(color)}
                  aria-label={color}
                />
              ))}
            </div>
          </div>
        )}

        {/* Image navigation if multiple images */}
        {product.images.length > 1 && (
          <div className="flex mt-3 gap-2">
            {product.images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${
                  currentImage === index
                    ? "bg-primary"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
                onClick={() => setCurrentImage(index)}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <AddToCartButton productId={product._id} />
      </CardFooter>
    </Card>
  );
}

// Helper function to get appropriate color hex values
function getColorHex(colorName) {
  const colorMap = {
    Black: "#000000",
    White: "#ffffff",
    Red: "#ef4444",
    Blue: "#3b82f6",
    Green: "#22c55e",
    Yellow: "#eab308",
    Purple: "#a855f7",
    Pink: "#ec4899",
    Gray: "#6b7280",
    Orange: "#f97316",
    Brown: "#92400e",
  };

  return colorMap[colorName] || "#6b7280"; // Default to gray if color not found
}

// Helper function to determine if a color is light (for border visibility)
function isLightColor(colorName) {
  return ["White", "Yellow"].includes(colorName);
}

// Create a client component wrapper for the grid
export default function ProductsGrid({
  products = [],
  total = 0,
  category,
  sort = "newest",
  minPrice,
  maxPrice,
  page = 1,
}) {
  const limit = 12;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-8">
      {products.length === 0 ? (
        <div className="text-center p-8">
          <h3 className="text-lg font-medium">No products found</h3>
          <p className="text-muted-foreground mt-2">
            Try changing your filters or search terms.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href={`/products?page=${i + 1}${
                        category ? `&category=${category}` : ""
                      }${sort ? `&sort=${sort}` : ""}`}
                      isActive={page === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
