"use client";

import React, { useRef } from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function AdminProductForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [sku, setSku] = useState("");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState("active");
  const [images, setImages] = useState([]);
  const [tags, setTags] = useState("");
  const [sizes, setSizes] = useState(["S", "M", "L", "XL"]);
  const [colors, setColors] = useState(["Black", "White", "Blue"]);

  // Refs for file inputs
  const fileInputRefs = useRef([]);

  const handleAddSize = () => {
    setSizes([...sizes, ""]);
  };

  const handleSizeChange = (index, value) => {
    const newSizes = [...sizes];
    newSizes[index] = value;
    setSizes(newSizes);
  };

  const handleRemoveSize = (index) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const handleAddColor = () => {
    setColors([...colors, ""]);
  };

  const handleColorChange = (index, value) => {
    const newColors = [...colors];
    newColors[index] = value;
    setColors(newColors);
  };

  const handleRemoveColor = (index) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const handleAddImage = () => {
    setImages([...images, ""]);
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleImageUrlChange = (index, url) => {
    const newImages = [...images];
    newImages[index] = url;
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Create a product object instead of FormData
      const productData = {
        name: name,
        description: description,
        price: price,
        category: category,
        stock: stock,
        featured: featured,
        status: status,
        tags: tags,
        sizes: sizes,
        colors: colors
      };
      
      // Add optional fields only if they exist
      if (compareAtPrice) productData.compareAtPrice = compareAtPrice;
      if (sku) productData.sku = sku;
      
      // Handle images - this will depend on your backend implementation
      // If your backend expects image URLs:
      productData.images = images.map(image => {
        // If images are already URLs, return them
        if (typeof image === 'string') return image;
        // If you're using some kind of preview URLs
        if (image && image.preview) return image.preview;
        // You might need to handle this differently based on your setup
      }).filter(img => img); // Filter out any undefined values
      
      // Send to backend with token
      const response = await fetch("http://localhost:8000/products", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData),
      });
      
      // Improved error handling
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create product");
      }
      
      const result = await response.json();
      
      toast.success("Product created", {
        description: "The product has been created successfully.",
      });
      
      router.push("/admin/products");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error", {
        description: error.message || "There was an error creating the product.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };  
  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="men">Men</SelectItem>
                  <SelectItem value="women">Women</SelectItem>
                  <SelectItem value="footwear">Footwear</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Enter product description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">
                Price ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="compareAtPrice">Compare at Price ($)</Label>
              <Input
                id="compareAtPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                To show a reduced price, set this higher than the actual price
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">
                Stock Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                placeholder="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                placeholder="Enter SKU"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between space-x-2 md:col-span-2">
              <div className="space-y-0.5">
                <Label htmlFor="featured">Featured Product</Label>
                <p className="text-sm text-muted-foreground">
                  Featured products appear on the homepage
                </p>
              </div>
              <Switch
                id="featured"
                checked={featured}
                onCheckedChange={setFeatured}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="images" className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Product Images</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddImage}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Image
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {images.map((imageUrl, index) => (
                <div key={index} className="relative rounded-md border p-2">
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt={`Product image ${index + 1}`}
                    className="aspect-square w-full rounded-md object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                    <span className="sr-only">Remove image</span>
                  </Button>
                  <div className="mt-2">
                    <Input
                      type="url"
                      placeholder="Enter image URL"
                      value={imageUrl}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="variants" className="space-y-6 pt-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="Enter tags separated by commas"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Tags help customers find your products through search and
                filtering
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Sizes</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSize}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Size
                </Button>
              </div>

              <div className="space-y-2">
                {sizes.map((size, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={size}
                      onChange={(e) => handleSizeChange(index, e.target.value)}
                      placeholder="Enter size"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSize(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove size</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Colors</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddColor}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Color
                </Button>
              </div>

              <div className="space-y-2">
                {colors.map((color, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={color}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      placeholder="Enter color"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveColor(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove color</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input id="metaTitle" placeholder="Enter meta title" />
              <p className="text-xs text-muted-foreground">
                Shown in search engine results and browser tabs
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                placeholder="Enter meta description"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Shown in search engine results
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions (cm)</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input placeholder="Length" />
                <Input placeholder="Width" />
                <Input placeholder="Height" />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end space-x-4">
        <Button type="button" variant="outline">
          Save as Draft
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
            </>
          ) : (
            "Create Product"
          )}
        </Button>
      </div>
    </form>
  );
}
