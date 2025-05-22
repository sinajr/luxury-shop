
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import Image
import { usePathname, useRouter } from 'next/navigation'; // Updated for App Router
import { Home, ShoppingBag, Sparkles, UserCircle, LogIn, LogOut, ShoppingCart as CartIconLucide, Heart } from 'lucide-react'; // Corrected CartIcon to ShoppingCart
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';
import { signOutUser } from '@/lib/firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export function Navbar() {
  const { user, loading: authLoading } = useAuth();
  const { getCartItemCount, isCartLoaded } = useCart();
  const { getWishlistItemCount, isWishlistLoaded } = useWishlist();
  const router = useRouter();
  const { toast } = useToast();
  const pathname = usePathname();


  const handleSignOut = async () => {
     try {
      await signOutUser();
      toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
      router.push('/');
    } catch (error) {
      toast({ title: 'Sign Out Error', description: 'Failed to sign out. Please try again.', variant: 'destructive' });
    }
  };

  const cartItemCount = isCartLoaded ? getCartItemCount() : 0;
  const wishlistItemCount = isWishlistLoaded ? getWishlistItemCount() : 0;

  return (
    <nav className="bg-card/80 backdrop-blur-lg text-card-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-primary hover:text-accent transition-colors">
            <Image
              src="/logo.png"
              alt="Elite Stuff Trade Logo"
              width={309}
              height={299}
              className="h-14 w-auto" // Increased from h-10
              priority
            />
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <NavLink href="/" icon={<Home />}>Home</NavLink>
            <NavLink href="/products" icon={<ShoppingBag />}>Collection</NavLink>
            <NavLink href="/advisor" icon={<Sparkles />}>Advisor</NavLink>
          </div>
          <div className="flex items-center space-x-3">
             <Button variant="ghost" size="icon" onClick={() => router.push('/wishlist')} aria-label="Wishlist" className="relative">
                <Heart className="h-6 w-6" />
                {isWishlistLoaded && wishlistItemCount > 0 && (
                    <Badge variant="default" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full bg-primary text-primary-foreground">
                    {wishlistItemCount > 9 ? '9+' : wishlistItemCount}
                    </Badge>
                )}
            </Button>

            <Button variant="ghost" size="icon" onClick={() => router.push('/cart')} aria-label="Shopping Cart" className="relative">
              <CartIconLucide className="h-6 w-6" />
              {isCartLoaded && cartItemCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </Badge>
              )}
            </Button>

            {!authLoading && (
              <>
                {user ? (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => router.push('/profile')} aria-label="Profile">
                      <UserCircle className="h-6 w-6" />
                    </Button>
                    <Button variant="outline" onClick={handleSignOut} className="hover:bg-accent hover:text-accent-foreground transition-colors">
                      <LogOut className="mr-2 h-5 w-5" /> Logout
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => router.push('/auth')} className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    <LogIn className="mr-2 h-5 w-5" /> Login
                  </Button>
                )}
              </>
            )}
            {authLoading && <div className="h-10 w-28 bg-muted rounded animate-pulse"></div>}
          </div>
        </div>
      </div>
      <div className="md:hidden bg-card/80 backdrop-blur-lg border-t border-border">
        <div className="container mx-auto px-4 py-2 flex justify-around items-center">
            <NavLinkMobile href="/" icon={<Home />} label="Home" />
            <NavLinkMobile href="/products" icon={<ShoppingBag />} label="Collection" />
            <NavLinkMobile href="/advisor" icon={<Sparkles />} label="Advisor" />
            <Link href="/wishlist" className="relative flex flex-col items-center text-xs p-2 transition-colors
                data-[active=true]:text-accent text-foreground hover:text-accent"
                data-active={pathname === '/wishlist'}>
                <Heart className="h-5 w-5 mb-1" />
                <span>Wishlist</span>
                {isWishlistLoaded && wishlistItemCount > 0 && (
                    <Badge variant="default" className="absolute top-0 right-0 h-4 w-4 p-0 flex items-center justify-center text-xs rounded-full bg-primary text-primary-foreground">
                    {wishlistItemCount > 9 ? '9+' : wishlistItemCount}
                    </Badge>
                )}
            </Link>
             <Link href="/cart" className="relative flex flex-col items-center text-xs p-2 transition-colors
                data-[active=true]:text-accent text-foreground hover:text-accent"
                data-active={pathname === '/cart'}>
                <CartIconLucide className="h-5 w-5 mb-1" />
                <span>Cart</span>
                 {isCartLoaded && cartItemCount > 0 && (
                    <Badge variant="destructive" className="absolute top-0 right-0 h-4 w-4 p-0 flex items-center justify-center text-xs rounded-full">
                        {cartItemCount > 9 ? '9+' : cartItemCount}
                    </Badge>
                )}
            </Link>
        </div>
      </div>
    </nav>
  );
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactElement;
}

function NavLink({ href, children, icon }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
      ${isActive ? 'text-accent font-semibold' : 'text-foreground hover:text-accent hover:bg-accent/10'}`}>
      {icon && React.cloneElement(icon, { className: `h-5 w-5 ${isActive ? 'text-accent' : ''}` })}
      <span>{children}</span>
    </Link>
  );
}

interface NavLinkMobileProps {
  href: string;
  icon: React.ReactElement;
  label: string;
}

function NavLinkMobile({ href, icon, label }: NavLinkMobileProps) {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link href={href} className={`flex flex-col items-center text-xs p-2 transition-colors ${isActive ? 'text-accent' : 'text-foreground hover:text-accent'}`}>
            {React.cloneElement(icon, { className: `h-5 w-5 mb-1 ${isActive ? 'text-accent' : ''}` })}
            <span>{label}</span>
        </Link>
    );
}
