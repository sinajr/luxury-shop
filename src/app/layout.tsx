
import type { Metadata } from 'next';
// Removed: import { GeistSans } from 'geist/font/sans';
// Removed: import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { CartProvider } from '@/contexts/cart-context'; // Add this
import { WishlistProvider } from '@/contexts/wishlist-context'; // Import WishlistProvider
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { FloatingActionButtons } from '@/components/layout/floating-action-buttons'; // Import FloatingActionButtons
import { Toaster } from '@/components/ui/toaster';
// Removed ParticlesBackground import, it's no longer global here

export const metadata: Metadata = {
  title: 'Elite Stuff Trade', // Updated Title to match logo
  description: 'Your premier destination for curated luxury goods, watches, and high-end fashion.', // Updated Description
  icons: {
    icon: '/logo.png', // Updated to use logo.png
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased flex flex-col min-h-screen bg-background">
        {/* <ParticlesBackground containerId="global-particles" optionsOverride={GLOBAL_PARTICLE_OPTIONS} /> */} {/* Removed global particles */}
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Navbar />
              <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </main>
              <Footer />
              <Toaster />
              <FloatingActionButtons />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
