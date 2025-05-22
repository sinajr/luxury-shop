
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  videoUrl?: string;
  category: string;
  brand?: string;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault?: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number; // Price at the time of purchase
  imageUrl: string; // Primary image URL for display in order history
}

export interface Order {
  id: string; // Firestore document ID
  userId: string;
  orderDate: any; // Firebase Timestamp, store as any for now, format on display
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: Address; // A copy of the shipping address for this order
  // You might add other fields like orderStatus, paymentId, etc.
}
