
'use server';
/**
 * @fileOverview Service for fetching order data from Firestore.
 */
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import type { Order, OrderItem, Address as OrderAddress } from '@/types';

// Helper to convert Firestore timestamp to a Date object or keep as is
const convertTimestamp = (timestamp: any): Date | any => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp; // Or handle other cases like string dates if necessary
};


export async function fetchOrdersByUserId(userId: string): Promise<Order[]> {
  if (!userId) {
    console.warn("fetchOrdersByUserId: No userId provided.");
    return [];
  }

  const orders: Order[] = [];
  try {
    const ordersCollectionRef = collection(db, 'orders');
    // Query orders for the specific user, ordered by date descending
    const q = query(
      ordersCollectionRef,
      where('userId', '==', userId),
      orderBy('orderDate', 'desc')
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        userId: data.userId,
        orderDate: convertTimestamp(data.orderDate), // Convert Firestore Timestamp
        items: data.items as OrderItem[],
        totalAmount: data.totalAmount as number,
        shippingAddress: data.shippingAddress as OrderAddress,
        // Map other fields if necessary
      } as Order);
    });
    return orders;
  } catch (error) {
    console.error(`Error fetching orders for user ${userId}:`, error);
    return []; // Return empty array on error
  }
}

// Example structure for an order document in Firestore:
// Collection: "orders"
// Document ID: (auto-generated)
// Fields:
//   userId: "string" (UID of the user)
//   orderDate: Timestamp (Firebase Timestamp)
//   totalAmount: number
//   shippingAddress: { street: "...", city: "...", ... } (object)
//   items: [
//     { productId: "string", name: "string", quantity: number, price: number, imageUrl: "string" },
//     ...
//   ]
