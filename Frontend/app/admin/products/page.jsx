"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AdminProductsTable from "@/components/admin/admin-products-table";
import AdminProductsFilter from "@/components/admin/admin-products-filter";

export default function AdminProductsPage() {
  // Shared state for filtering and pagination
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
    priceRange: [0, 500],
    stock: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  });
  const [sortBy, setSortBy] = useState({
    column: "",
    direction: "asc",
  });

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const updateSort = (column, direction) => {
    setSortBy({ column, direction });
  };

  const updatePage = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product inventory, prices, and details
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <AdminProductsFilter filters={filters} onApplyFilters={applyFilters} />

      <AdminProductsTable
        filters={filters}
        pagination={pagination}
        setPagination={setPagination}
        sortBy={sortBy}
        onSort={updateSort}
        onPageChange={updatePage}
      />
    </div>
  );
}
