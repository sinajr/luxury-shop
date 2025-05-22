
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, QrCode } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  product: Product;
}

// Helper function to sanitize potentially malformed URL strings
function sanitizeImageUrlString(urlStr: string | undefined | null): string | null {
  if (!urlStr) return null;
  let processedUrl = urlStr.trim();
  // Check if the string itself is a JSON array representation like "[\"actual_url.jpg\"]"
  if (processedUrl.startsWith('["') && processedUrl.endsWith('"]')) {
    try {
      const parsedArray = JSON.parse(processedUrl);
      if (Array.isArray(parsedArray) && parsedArray.length > 0 && typeof parsedArray[0] === 'string') {
        processedUrl = parsedArray[0]; // Extract the actual URL
      } else {
        // Malformed JSON array string, treat as invalid
        console.warn('Malformed JSON array string for URL, could not extract valid URL:', urlStr);
        return null;
      }
    } catch (error) {
      // Invalid JSON string, treat as invalid
      console.error('Failed to parse potentially malformed URL string:', urlStr, error);
      return null;
    }
  }

  // Check if it's a valid absolute or root-relative URL after potential sanitization
  if (processedUrl.startsWith('http://') || processedUrl.startsWith('https://') || processedUrl.startsWith('/')) {
    return processedUrl;
  }

  console.warn('URL does not start with http(s):// or / :', processedUrl);
  return null; // Not a recognized valid URL format
}


export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, isWishlistLoaded } = useWishlist();
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && product?.id) {
      setQrCodeValue(`${window.location.origin}/add-to-cart/${product.id}`);
    }
  }, [product?.id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product) return;
    addToCart(product, 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product?.id || !product?.name || !isWishlistLoaded) return;
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id, product.name);
    } else {
      addToWishlist(product.id, product.name);
    }
  };

  if (!product) {
    return (
        <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full bg-card">
            <CardHeader className="p-0 relative">
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted animate-pulse"></div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                <div className="h-4 bg-muted rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-1 animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-full mb-2 animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-full animate-pulse"></div>
            </CardContent>
            <div className="px-4 pb-2 pt-0">
                <div className="h-6 bg-muted rounded w-1/4 animate-pulse"></div>
            </div>
            <CardFooter className="p-4 pt-2 border-t">
                <div className="h-9 bg-muted rounded w-full animate-pulse"></div>
            </CardFooter>
        </Card>
    );
  }

  const isWishlisted = isWishlistLoaded ? isInWishlist(product.id) : false;

  const displayPrice = typeof product.price === 'number'
    ? `$${product.price.toFixed(2)}`
    : 'Price not available';

  let rawPrimaryUrl: string | undefined | null = null;

  if (product.imageUrls && product.imageUrls.length > 0) {
    rawPrimaryUrl = product.imageUrls[0];
  // @ts-ignore - Fallback for legacy imageUrl (singular) if imageUrls (plural) is not present or empty
  } else if (product.imageUrl && Array.isArray(product.imageUrl) && product.imageUrl.length > 0 && typeof product.imageUrl[0] === 'string') {
  // @ts-ignore
    rawPrimaryUrl = product.imageUrl[0];
  // @ts-ignore
  } else if (typeof product.imageUrl === 'string') {
  // @ts-ignore
    rawPrimaryUrl = product.imageUrl;
  }
  
  const sanitizedPrimaryUrl = sanitizeImageUrlString(rawPrimaryUrl);
  
  const imageSrc = imageError || !sanitizedPrimaryUrl 
    ? 'https://placehold.co/600x400.png' 
    : sanitizedPrimaryUrl;

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full bg-card group">
      <Link href={`/products/${product.id}`} className="flex flex-col flex-grow">
        <CardHeader className="p-0 relative">
           <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleWishlist}
              className={cn(
                  "absolute top-2 right-2 z-10 rounded-full h-8 w-8 p-0",
                  "bg-black/30 text-white hover:bg-black/50",
                  "group-hover:opacity-100 md:opacity-0 transition-opacity",
                  isWishlisted && "text-red-500 hover:text-red-400 opacity-100"
              )}
              aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              disabled={!isWishlistLoaded}
            >
              <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
            </Button>

          <div className="relative w-full aspect-[4/3] overflow-hidden">
            <Image
              src={imageSrc}
              alt={product.name || "Product image"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
              data-ai-hint={`${product.category || 'item'} ${product.brand || ''}`}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          {product.brand && (
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {product.brand}
            </p>
          )}
          <CardTitle className="text-lg font-semibold text-card-foreground group-hover:text-accent transition-colors mb-1 truncate" title={product.name}>
            {product.name || "Product Name Unavailable"}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {product.description || "No description available."}
          </CardDescription>
        </CardContent>
      </Link>
      <div className="px-4 pb-2 pt-0">
        <p className="text-lg font-bold text-accent">
          {displayPrice}
        </p>
      </div>
      <CardFooter className="p-4 pt-2 border-t">
        <div className="flex w-full justify-between items-center gap-2">
          <Button
            size="sm"
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
            disabled={!product.id}
          >
             <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </Button>

          {qrCodeValue && product.id && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9" aria-label="Show QR Code" onClick={(e) => {e.preventDefault(); e.stopPropagation();}}>
                  <QrCode className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xs">
                <DialogHeader>
                  <DialogTitle className="text-center text-lg">Scan to Add to Cart</DialogTitle>
                  <DialogDescription className="text-center">
                    Scan this QR code with your mobile device to add {product.name || "this product"} to your shopping cart.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center py-4">
                  <QRCodeSVG value={qrCodeValue} size={200} includeMargin={true} />
                </div>
                 <p className="text-xs text-muted-foreground text-center break-all">
                    URL: {qrCodeValue}
                 </p>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
    
