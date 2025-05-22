
"use client"; // Needs to be client component for useEffect and useState

import { useState, useEffect } from 'react';
import { ProductList } from '@/components/products/product-list';
import { fetchAllProducts } from '@/services/productService'; // Import RTDB service
import type { Product } from '@/types';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

interface ProductsPageProps {
  params: { [key: string]: string | string[] | undefined };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ProductsPage({ params, searchParams }: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const fetchedProducts = await fetchAllProducts();
      setProducts(fetchedProducts);
      setIsLoading(false);
    };
    loadProducts();
  }, []);

  return (
    <div className="space-y-8">
      <header className="text-center py-8 bg-card rounded-lg shadow-md">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Luxury Collection</h1>
        <p className="mt-2 text-lg text-muted-foreground">Explore curated high-end watches, sneakers, apparel, and more.</p>
      </header>

      <div className="p-4 bg-card rounded-md shadow-sm">
        <p className="text-sm text-muted-foreground">Filters (by Brand, Category, Price) and sorting options will be here.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <ProductList products={products} />
      ) : (
        <p className="text-center text-muted-foreground py-10">No products found in the collection.</p>
      )}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="flex flex-col space-y-3 p-4 border rounded-lg shadow-md bg-card">
      <Skeleton className="h-[180px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-1/4 mt-2" />
      </div>
      <Skeleton className="h-9 w-full mt-4" />
    </div>
  );
}
