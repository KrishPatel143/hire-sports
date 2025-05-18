"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
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

export default function AdminProductEditForm({ initialData }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [sku, setSku] = useState("");
  const [featured, setFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState([]);
  const [tags, setTags] = useState("");
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  // Meta fields
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [weight, setWeight] = useState("");
  const [dimensions, setDimensions] = useState({
    length: "",
    width: "",
    height: "",
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await fetch("http://localhost:8000/categories");

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();

        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          setCategories([
            { _id: "men", name: "Men" },
            { _id: "women", name: "Women" },
            { _id: "footwear", name: "Footwear" },
            { _id: "accessories", name: "Accessories" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback categories
        setCategories([
          { _id: "men", name: "Men" },
          { _id: "women", name: "Women" },
          { _id: "footwear", name: "Footwear" },
          { _id: "accessories", name: "Accessories" },
        ]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Initialize form with product data
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setPrice(initialData.price?.toString() || "");
      setCompareAtPrice(initialData.compareAtPrice?.toString() || "");
      setCategory(initialData.category || "");
      setStock(initialData.stock?.toString() || "");
      setSku(initialData.sku || "");
      setFeatured(initialData.featured || false);
      setIsActive(
        initialData.isActive !== undefined ? initialData.isActive : true
      );

      if (initialData.images && Array.isArray(initialData.images)) {
        setImages(initialData.images);
      }

      if (initialData.tags) {
        setTags(
          Array.isArray(initialData.tags)
            ? initialData.tags.join(", ")
            : initialData.tags
        );
      }

      if (initialData.sizes && Array.isArray(initialData.sizes)) {
        setSizes(initialData.sizes);
      } else {
        setSizes(["S", "M", "L", "XL"]);
      }

      if (initialData.colors && Array.isArray(initialData.colors)) {
        setColors(initialData.colors);
      } else {
        setColors(["Black", "White", "Blue"]);
      }

      setMetaTitle(initialData.metaTitle || "");
      setMetaDescription(initialData.metaDescription || "");
      setWeight(initialData.weight?.toString() || "");

      if (initialData.dimensions) {
        setDimensions({
          length: initialData.dimensions.length?.toString() || "",
          width: initialData.dimensions.width?.toString() || "",
          height: initialData.dimensions.height?.toString() || "",
        });
      }
    }
  }, [initialData]);

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
      const token = localStorage.getItem("token") || "";

      // Convert form values to appropriate types
      const numericPrice = parseFloat(price) || 0;
      const numericStock = parseInt(stock, 10) || 0;
      const numericCompareAtPrice = compareAtPrice
        ? parseFloat(compareAtPrice)
        : undefined;

      // Create product data object
      const productData = {
        name,
        description,
        price: numericPrice,
        category,
        stock: numericStock,
        isActive: status === "active",
        images: images.filter((img) => img),
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        sizes: sizes.filter((size) => size.trim() !== ""),
        colors: colors.filter((color) => color.trim() !== ""),
        metaTitle,
        metaDescription,
        featured,
      };

      // Add optional fields only if they exist
      if (numericCompareAtPrice)
        productData.compareAtPrice = numericCompareAtPrice;
      if (sku) productData.sku = sku;
      if (weight) productData.weight = parseFloat(weight);

      if (dimensions.length || dimensions.width || dimensions.height) {
        productData.dimensions = {
          length: dimensions.length ? parseFloat(dimensions.length) : undefined,
          width: dimensions.width ? parseFloat(dimensions.width) : undefined,
          height: dimensions.height ? parseFloat(dimensions.height) : undefined,
        };
      }

      // Use the correct URL based on your router configuration
      // Based on your router, the endpoint should be without 'api/' prefix
      const url = `http://localhost:8000/products/${initialData._id}`;

      console.log("Sending update to:", url);
      console.log("Product data:", JSON.stringify(productData, null, 2));

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(errorData.message || "Failed to update product");
      }

      const result = await response.json();
      console.log("Update successful:", result);

      toast.success("Product updated successfully");

      // Redirect after successful update
      router.push("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.message || "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const status = isActive ? "active" : "draft";

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
                  <SelectValue
                    placeholder={
                      isLoadingCategories
                        ? "Loading categories..."
                        : "Select category"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
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
              <Select
                value={status}
                onValueChange={(value) => setIsActive(value === "active")}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        {/* Image tab content */}
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
                      onChange={(e) =>
                        handleImageUrlChange(index, e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              ))}

              {images.length === 0 && (
                <div className="col-span-full text-center p-6 border rounded-md">
                  <p className="text-muted-foreground">
                    No images added yet. Click "Add Image" to add product
                    images.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Variants tab */}
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

                {sizes.length === 0 && (
                  <p className="text-muted-foreground">
                    No sizes added yet. Click "Add Size" to add product sizes.
                  </p>
                )}
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

                {colors.length === 0 && (
                  <p className="text-muted-foreground">
                    No colors added yet. Click "Add Color" to add product
                    colors.
                  </p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Advanced tab */}
        <TabsContent value="advanced" className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                placeholder="Enter meta title"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
              />
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
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
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
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions (cm)</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Length"
                  value={dimensions.length}
                  onChange={(e) =>
                    setDimensions({ ...dimensions, length: e.target.value })
                  }
                />
                <Input
                  placeholder="Width"
                  value={dimensions.width}
                  onChange={(e) =>
                    setDimensions({ ...dimensions, width: e.target.value })
                  }
                />
                <Input
                  placeholder="Height"
                  value={dimensions.height}
                  onChange={(e) =>
                    setDimensions({ ...dimensions, height: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Product"
          )}
        </Button>
      </div>
    </form>
  );
}
