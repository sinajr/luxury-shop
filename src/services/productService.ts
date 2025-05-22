
import { db } from '@/lib/firebase/config'; // Import Firestore instance
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import type { Product } from '@/types';

/**
 * Fetches all products from the Firestore "products" collection.
 * @returns A promise that resolves to an array of products.
 */
export async function fetchAllProducts(): Promise<Product[]> {
  try {
    const productsCollectionRef = collection(db, 'products');
    const querySnapshot = await getDocs(productsCollectionRef);
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      let imageUrlsToUse: string[] = [];

      // Prioritize 'imageUrls' if it exists and is a valid array
      if (data.imageUrls && Array.isArray(data.imageUrls) && data.imageUrls.every((url: any) => typeof url === 'string')) {
        imageUrlsToUse = data.imageUrls;
      }
      // Fallback to 'imageUrl' if 'imageUrls' isn't suitable
      else if (data.imageUrl) {
        if (Array.isArray(data.imageUrl) && data.imageUrl.every((url: any) => typeof url === 'string')) {
          imageUrlsToUse = data.imageUrl; // If imageUrl itself is an array of strings
        } else if (typeof data.imageUrl === 'string') {
          imageUrlsToUse = [data.imageUrl]; // If imageUrl is a single string
        }
      }

      products.push({
        id: doc.id,
        name: data.name || 'Unknown Product',
        description: data.description || '',
        price: typeof data.price === 'number' ? data.price : 0,
        category: data.category || 'Uncategorized',
        brand: data.brand || undefined,
        videoUrl: data.videoUrl || undefined,
        imageUrls: imageUrlsToUse, // Use the processed imageUrls
      } as Product); // Assert as Product, knowing we've tried to align it
    });
    return products;
  } catch (error) {
    console.error("Error fetching all products from Firestore:", error);
    return []; // Return empty array on error
  }
}

/**
 * Fetches a single product by its ID from the Firestore "products" collection.
 * @param productId The ID of the product to fetch.
 * @returns A promise that resolves to the product, or null if not found or on error.
 */
export async function fetchProductById(productId: string): Promise<Product | null> {
  try {
    const productDocRef = doc(db, 'products', productId);
    const docSnap = await getDoc(productDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      let imageUrlsToUse: string[] = [];

      if (data.imageUrls && Array.isArray(data.imageUrls) && data.imageUrls.every((url: any) => typeof url === 'string')) {
        imageUrlsToUse = data.imageUrls;
      } else if (data.imageUrl) {
        if (Array.isArray(data.imageUrl) && data.imageUrl.every((url: any) => typeof url === 'string')) {
          imageUrlsToUse = data.imageUrl;
        } else if (typeof data.imageUrl === 'string') {
          imageUrlsToUse = [data.imageUrl];
        }
      }
      
      return {
        id: docSnap.id,
        name: data.name || 'Unknown Product',
        description: data.description || '',
        price: typeof data.price === 'number' ? data.price : 0,
        category: data.category || 'Uncategorized',
        brand: data.brand || undefined,
        videoUrl: data.videoUrl || undefined,
        imageUrls: imageUrlsToUse,
      } as Product;
    } else {
      console.log(`Product with ID ${productId} not found in Firestore.`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching product with ID ${productId} from Firestore:`, error);
    return null; // Return null on error
  }
}
