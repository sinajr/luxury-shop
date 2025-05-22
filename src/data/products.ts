import type { Product } from '@/types';

// Mock product data - Updated with luxury items and new image/video structure
export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Rolex Submariner Date',
    description: 'Iconic diver\'s watch in Oystersteel with a black Cerachrom bezel.',
    price: 14500.00,
    imageUrls: [
      'https://picsum.photos/seed/submariner1/800/600',
      'https://picsum.photos/seed/submariner2/800/600',
      'https://picsum.photos/seed/submariner3/800/600',
    ],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // Example video
    category: 'Watches',
    brand: 'Rolex',
  },
  {
    id: '2',
    name: 'Gucci Marmont Matelassé Bag',
    description: 'Signature GG Marmont shoulder bag in black matelassé chevron leather.',
    price: 2550.00,
    imageUrls: [
      'https://picsum.photos/seed/guccibag1/800/600',
      'https://picsum.photos/seed/guccibag2/800/600',
    ],
    category: 'Bags',
    brand: 'Gucci',
  },
  {
    id: '3',
    name: 'Nike Air Jordan 1 High OG "Chicago"',
    description: 'Legendary Air Jordan 1 silhouette in the classic Chicago colorway.',
    price: 1800.00, // Reflecting resale market value
    imageUrls: [
      'https://picsum.photos/seed/jordan1a/800/600',
      'https://picsum.photos/seed/jordan1b/800/600',
      'https://picsum.photos/seed/jordan1c/800/600',
    ],
    category: 'Sneakers',
    brand: 'Nike',
  },
  {
    id: '4',
    name: 'Adidas Yeezy Boost 350 V2 "Zebra"',
    description: 'Highly sought-after Yeezy Boost 350 V2 with distinctive Zebra pattern.',
    price: 450.00, // Reflecting resale market value
    imageUrls: [
      'https://picsum.photos/seed/yeezy350a/800/600',
      'https://picsum.photos/seed/yeezy350b/800/600',
    ],
    category: 'Sneakers',
    brand: 'Adidas',
  },
  {
    id: '5',
    name: 'Prada Re-Nylon Blouson Jacket',
    description: 'Sustainable luxury jacket made from regenerated nylon yarn.',
    price: 2100.00,
    imageUrls: [
      'https://picsum.photos/seed/pradajacket1/800/600',
    ],
    category: 'Apparel',
    brand: 'Prada',
  },
  {
    id: '6',
    name: 'Patek Philippe Nautilus 5711',
    description: 'An exquisite and highly coveted luxury sports watch in stainless steel.',
    price: 150000.00, // Reflecting market value
    imageUrls: [
      'https://picsum.photos/seed/nautilus1/800/600',
      'https://picsum.photos/seed/nautilus2/800/600',
    ],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // Example video
    category: 'Watches',
    brand: 'Patek Philippe',
  },
   {
    id: '7',
    name: 'Balenciaga Triple S Sneakers',
    description: 'The original oversized sneaker that defined a trend, in classic colorway.',
    price: 1150.00,
    imageUrls: [
      'https://picsum.photos/seed/triples1/800/600',
      'https://picsum.photos/seed/triples2/800/600',
    ],
    category: 'Sneakers',
    brand: 'Balenciaga',
  },
  {
    id: '8',
    name: 'Hermès Birkin 30 Togo Leather',
    description: 'An ultimate status symbol, the Birkin bag in durable Togo leather.',
    price: 25000.00, // Example market value
    imageUrls: [
      'https://picsum.photos/seed/birkin1/800/600',
      'https://picsum.photos/seed/birkin2/800/600',
      'https://picsum.photos/seed/birkin3/800/600',
    ],
    category: 'Bags',
    brand: 'Hermès',
  },
];
