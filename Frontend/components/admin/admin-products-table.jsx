"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpDown, Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function AdminProductsTable({
  filters,
  pagination,
  setPagination,
  sortBy,
  onSort,
  onPageChange,
}) {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null); // Add token state

  const fetchProducts = async (page = pagination.currentPage) => {
    try {
      setIsLoading(true);

      // Build query parameters from filters
      const queryParams = new URLSearchParams();
      queryParams.append("page", page);

      if (filters.search) queryParams.append("search", filters.search);

      if (filters.category) queryParams.append("category", filters.category);

      if (filters.status) {
        switch (filters.status) {
          case "active":
            queryParams.append("isActive", true);
            break;
          case "inactive":
            queryParams.append("isActive", false);
            break;
          case "low-stock":
            queryParams.append("lowStock", true);
            break;
          case "out-of-stock":
            queryParams.append("inStock", false);
            break;
        }
      }

      // Handle price range
      if (filters.priceRange) {
        if (filters.priceRange[0] > 0)
          queryParams.append("minPrice", filters.priceRange[0]);
        if (filters.priceRange[1] < 500)
          queryParams.append("maxPrice", filters.priceRange[1]);
      }

      // Handle stock filter mapping
      if (filters.stock) {
        switch (filters.stock) {
          case "in-stock":
            queryParams.append("inStock", true);
            break;
          case "low-stock":
            queryParams.append("lowStock", true);
            break;
          case "out-of-stock":
            queryParams.append("inStock", false);
            break;
        }
      }

      // Handle sorting
      if (sortBy.column) {
        const sortMapping = {
          name: "name",
          price: "price",
          stock: "stock",
          category: "category",
        };

        const direction = sortBy.direction === "asc" ? "-asc" : "-desc";
        const sortField = sortMapping[sortBy.column] || "createdAt";

        queryParams.append("sortBy", `${sortField}${direction}`);
      }

      const apiUrl = `http://localhost:8000/admin/all/products?${queryParams.toString()}`;
      console.log("Fetching products from:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      console.log("Products data:", data);

      setProducts(data.products);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalProducts: data.totalProducts,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  // Fetch products when filters, pagination or token changes
  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token, filters, pagination.currentPage, sortBy]);

  // Sort products
  const handleSort = (column) => {
    const newDirection =
      sortBy.column === column && sortBy.direction === "asc" ? "desc" : "asc";
    onSort(column, newDirection);
  };

  // Toggle product active status
  const handleToggleStatus = async (id) => {
    try {
      const productToUpdate = products.find((p) => p._id === id);
      if (!productToUpdate) return;

      const response = await fetch(`http://localhost:8000/products/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...productToUpdate,
          isActive: !productToUpdate.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update product status");
      }

      const updatedProduct = await response.json();

      setProducts(
        products.map((product) =>
          product._id === id
            ? { ...product, isActive: updatedProduct.isActive }
            : product
        )
      );

      toast.success("Product status updated successfully");
    } catch (error) {
      console.error("Error updating product status:", error);
      toast.error("Failed to update product status");
    }
  };

  // Delete a single product
  const handleDeleteProduct = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts(products.filter((product) => product._id !== id));
      setSelectedProducts(
        selectedProducts.filter((productId) => productId !== id)
      );

      toast.success("Product deleted successfully");

      // Refetch if the current page is empty after deletion
      if (products.length === 1 && pagination.currentPage > 1) {
        onPageChange(pagination.currentPage - 1);
      } else {
        fetchProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  // Select/Deselect all products
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProducts(products.map((product) => product._id));
    } else {
      setSelectedProducts([]);
    }
  };

  // Select/Deselect individual product
  const handleSelectProduct = (id, checked) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, id]);
    } else {
      setSelectedProducts(
        selectedProducts.filter((productId) => productId !== id)
      );
    }
  };

  // Delete selected products
  const handleDeleteSelected = async () => {
    try {
      // Concurrent delete of selected products
      const deletePromises = selectedProducts.map((id) =>
        fetch(`http://localhost:8000/products/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      );

      const responses = await Promise.all(deletePromises);

      // Check if all deletions were successful
      const allSuccessful = responses.every((response) => response.ok);

      if (!allSuccessful) {
        throw new Error("Failed to delete some products");
      }

      setProducts(
        products.filter((product) => !selectedProducts.includes(product._id))
      );
      setSelectedProducts([]);

      toast.success(`${selectedProducts.length} products deleted successfully`);

      // Refetch products to update display
      fetchProducts();
    } catch (error) {
      console.error("Error deleting selected products:", error);
      toast.error("Failed to delete selected products");
    }
  };

  // Get status badge based on product status
  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge
        variant="outline"
        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      >
        Active
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      >
        Inactive
      </Badge>
    );
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (pagination.currentPage > 1) {
      onPageChange(pagination.currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      onPageChange(pagination.currentPage + 1);
    }
  };

  return (
    <div className="space-y-4">
      {selectedProducts.length > 0 && (
        <div className="bg-muted/50 p-2 rounded-md flex items-center justify-between">
          <span className="text-sm">
            {selectedProducts.length} products selected
          </span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  selected products.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSelected}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-4">Loading products...</div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or add a new product
              </p>
              <Button asChild>
                <Link href="/admin/products/new">
                  <Plus className="mr-2 h-4 w-4" /> Add Product
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          selectedProducts.length === products.length &&
                          products.length > 0
                        }
                        onCheckedChange={(checked) =>
                          handleSelectAll(!!checked)
                        }
                        aria-label="Select all products"
                      />
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("name")}
                        className="flex items-center p-0 h-auto font-medium"
                      >
                        Product
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("category")}
                        className="flex items-center p-0 h-auto font-medium"
                      >
                        Category
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("price")}
                        className="flex items-center p-0 h-auto font-medium"
                      >
                        Price
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("stock")}
                        className="flex items-center p-0 h-auto font-medium"
                      >
                        Stock
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product._id)}
                          onCheckedChange={(checked) =>
                            handleSelectProduct(product._id, !!checked)
                          }
                          aria-label={`Select ${product.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>{getStatusBadge(product.isActive)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/products/${product._id}`}>
                                <Eye className="mr-2 h-4 w-4" /> View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/products/edit/${product._id}`}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(product._id)}
                            >
                              <Switch
                                checked={product.isActive}
                                className="mr-2"
                              />
                              {product.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you absolutely sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the product.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteProduct(product._id)
                                    }
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePreviousPage();
                    }}
                    aria-disabled={pagination.currentPage <= 1}
                  />
                </PaginationItem>
                {[...Array(pagination.totalPages)].map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange(index + 1);
                      }}
                      isActive={pagination.currentPage === index + 1}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNextPage();
                    }}
                    aria-disabled={
                      pagination.currentPage >= pagination.totalPages
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
