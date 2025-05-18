import ProductsGrid from "./products-grid";
import { getProducts } from "@/lib/products";

// This is a Server Component that fetches data
export default async function ProductsGridServer({
  category,
  sort = "newest",
  minPrice,
  maxPrice,
  page = 1
}) {
  const limit = 12;
  const { products, total } = await getProducts({
    category,
    sort,
    minPrice,
    maxPrice,
    page,
    limit
  });

  // Pass the fetched data to the client component
  return <ProductsGrid 
    products={products} 
    total={total} 
    category={category} 
    sort={sort} 
    minPrice={minPrice}
    maxPrice={maxPrice}
    page={page}
  />;
}