import { Suspense } from "react";
import ProductsGridServer from "@/components/products-grid-server";
import ProductsFilter from "@/components/products-filter";
import ProductsSkeleton from "@/components/products-skeleton";

export default async function ProductsPage({ searchParams }) {
  // Fix searchParams handling - they don't need to be awaited
  const category = searchParams?.category || "all";
  const sort = searchParams?.sort || "newest";
  const page = Number.parseInt(searchParams?.page || "1");
  const minPrice = searchParams?.minPrice
    ? Number.parseFloat(searchParams?.minPrice)
    : undefined;
  const maxPrice = searchParams?.maxPrice
    ? Number.parseFloat(searchParams?.maxPrice)
    : undefined;

  return (
    <div className="container px-4 py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-8">Products</h1>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
        <ProductsFilter
          activeCategory={category}
          activeSort={sort}
          minPrice={minPrice}
          maxPrice={maxPrice}
        />

        <div className="space-y-4">
          <Suspense fallback={<ProductsSkeleton />}>
            <ProductsGridServer
              category={category === "all" ? undefined : category}
              sort={sort}
              minPrice={minPrice}
              maxPrice={maxPrice}
              page={page}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
