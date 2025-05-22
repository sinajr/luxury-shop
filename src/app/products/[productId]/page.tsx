
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { fetchProductById } from '@/services/productService';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';
import { Heart, ShoppingCart, ChevronLeft, Loader2, AlertTriangle, Film, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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


export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [mainImageError, setMainImageError] = useState(false);

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, isWishlistLoaded } = useWishlist();

  useEffect(() => {
    if (productId) {
      setIsLoading(true);
      setSelectedImageIndex(0); 
      setMainImageError(false);
      fetchProductById(productId)
        .then((data) => {
          setProduct(data);
        })
        .catch(error => {
          console.error("Error fetching product:", error);
          toast({
            title: "Error",
            description: "Could not load product details.",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [productId, toast]);

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
    setMainImageError(false); 
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
        <h1 className="text-2xl font-semibold text-primary">Loading Product Details...</h1>
        <p className="text-muted-foreground mt-2">Please wait a moment.</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-6" />
        <h1 className="text-3xl font-bold text-destructive">Product Not Found</h1>
        <p className="text-muted-foreground mt-3 max-w-md">
          Sorry, we couldn't find the product you're looking for. It might have been removed or the link is incorrect.
        </p>
        <Button onClick={() => router.push('/products')} className="mt-8">
          <ChevronLeft className="mr-2 h-5 w-5" /> Back to Products
        </Button>
      </div>
    );
  }

  const handleToggleWishlist = () => {
    if (!isWishlistLoaded) return;
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id, product.name);
    } else {
      addToWishlist(product.id, product.name);
    }
  };

  const isWishlisted = isWishlistLoaded ? isInWishlist(product.id) : false;
  
  let effectiveImageUrls: string[] = [];
  if (product.imageUrls && product.imageUrls.length > 0) {
    effectiveImageUrls = product.imageUrls;
  // @ts-ignore - Checking for legacy imageUrl (singular)
  } else if (product.imageUrl && Array.isArray(product.imageUrl) && product.imageUrl.length > 0) {
  // @ts-ignore
    effectiveImageUrls = product.imageUrl.filter((url: any) => typeof url === 'string');
  // @ts-ignore
  } else if (typeof product.imageUrl === 'string') {
  // @ts-ignore
    effectiveImageUrls = [product.imageUrl];
  }


  const rawCurrentImageSrc = effectiveImageUrls.length > selectedImageIndex
    ? effectiveImageUrls[selectedImageIndex]
    : null;
  const sanitizedCurrentImageSrc = sanitizeImageUrlString(rawCurrentImageSrc);

  const imageToDisplay = mainImageError || !sanitizedCurrentImageSrc 
    ? 'https://placehold.co/800x600.png' 
    : sanitizedCurrentImageSrc;


  return (
    <div className="container mx-auto py-8 lg:py-12">
      <Button variant="outline" onClick={() => router.back()} className="mb-8 group">
        <ChevronLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        Back
      </Button>

      <Card className="overflow-hidden shadow-2xl">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Media Section with Tabs */}
          <div>
            <Tabs defaultValue="gallery" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="gallery" disabled={effectiveImageUrls.length === 0}>
                  <ImageIcon className="mr-2 h-4 w-4" /> Image Gallery
                </TabsTrigger>
                <TabsTrigger value="video" disabled={!product.videoUrl}>
                  <Film className="mr-2 h-4 w-4" /> Video
                </TabsTrigger>
              </TabsList>
              <TabsContent value="gallery">
                <div className="p-1 md:p-2"> {/* Added small padding */}
                  <div className="relative aspect-[4/3] bg-muted/30 flex items-center justify-center rounded-md overflow-hidden">
                    <Image
                      src={imageToDisplay}
                      alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                      width={800}
                      height={600}
                      className="object-contain max-h-[60vh] md:max-h-full w-auto"
                      onError={() => setMainImageError(true)}
                      data-ai-hint={`${product.category} ${product.brand || ''} detail view`}
                      priority
                    />
                  </div>
                  {effectiveImageUrls.length > 1 && (
                    <div className="flex space-x-2 mt-3 p-2 overflow-x-auto justify-center">
                      {effectiveImageUrls.map((rawUrl, index) => {
                        const sanitizedThumbnailUrl = sanitizeImageUrlString(rawUrl);
                        if (!sanitizedThumbnailUrl) return null; // Skip if URL is invalid after sanitization
                        return (
                          <button
                            key={index}
                            onClick={() => handleThumbnailClick(index)}
                            className={cn(
                              "relative w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden border-2 shrink-0",
                              selectedImageIndex === index ? "border-primary ring-2 ring-primary" : "border-transparent hover:border-muted-foreground"
                            )}
                          >
                            <Image
                              src={sanitizedThumbnailUrl || 'https://placehold.co/100x100.png'}
                              alt={`Thumbnail ${index + 1}`}
                              fill
                              sizes="80px"
                              className="object-cover"
                              data-ai-hint={`${product.category} thumbnail`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="video">
                <div className="p-1 md:p-2"> {/* Added small padding */}
                  {product.videoUrl ? (
                    <div className="aspect-video bg-black rounded-md overflow-hidden">
                      <video
                        src={product.videoUrl}
                        controls
                        className="w-full h-full object-contain"
                        preload="metadata"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : (
                    <div className="aspect-video flex items-center justify-center bg-muted/30 rounded-md">
                      <p className="text-muted-foreground">No video available for this product.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Details Section */}
          <div className="p-6 md:p-10 flex flex-col">
            {product.brand && (
              <Badge variant="secondary" className="w-fit mb-3 text-sm">{product.brand}</Badge>
            )}
            <h1 className="text-3xl lg:text-4xl font-bold text-primary mb-3">{product.name}</h1>
            
            <p className="text-2xl font-semibold text-accent mb-6">
              {typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : 'Price unavailable'}
            </p>

            <Separator className="my-6" />

            <div className="space-y-3 mb-8 flex-grow">
              <h2 className="text-xl font-semibold text-foreground mb-2">Product Description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {product.description || "No description available."}
              </p>
              {product.category && (
                 <div className="pt-3">
                    <span className="font-medium text-foreground">Category: </span>
                    <Badge variant="outline">{product.category}</Badge>
                 </div>
              )}
            </div>
            
            <Separator className="my-6" />

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => addToCart(product, 1)}
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="flex-1"
                onClick={handleToggleWishlist}
                disabled={!isWishlistLoaded}
              >
                <Heart className={cn("mr-2 h-5 w-5", isWishlisted && "fill-current text-red-500")} />
                {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
    
