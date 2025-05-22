
"use client";

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signOutUser } from '@/lib/firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Heart, Trash2, Loader2, Edit3, Save, X, Phone, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { useWishlist } from '@/contexts/wishlist-context';
import { fetchAllProducts } from '@/services/productService';
import { fetchOrdersByUserId } from '@/services/orderService';
import type { Product, Address, UserDocument, Order } from '@/types';
import { db } from '@/lib/firebase/config';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddressForm } from '@/components/profile/address-form';
import { format } from 'date-fns';

// Function to subscribe to real-time user data updates from Firestore
const subscribeToUserData = (userId: string, callback: (data: UserDocument | null) => void): Unsubscribe => {
  if (!userId) return () => {}; // Return a no-op unsubscribe function if no userId
  const userDocRef = doc(db, "users", userId);
  const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const userData = docSnap.data() as UserDocument;
      callback(userData);
    } else {
      console.log("User document not found for addresses or other details.");
      callback(null); // User document doesn't exist
    }
  }, (error) => {
    console.error("Error listening to user document changes from Firestore:", error);
    callback(null); // Error occurred
  });
  return unsubscribe; // Return the unsubscribe function
};

export default function ProfilePage() {
  useEffect(() => {
    async function runAdminCheck() {
      if (typeof window === 'undefined') return;
      try {
        await fetch('/api/admin-debug');
        console.log("✅ Called /api/admin-debug");
      } catch (err) {
        console.error("❌ Failed to call /api/admin-debug", err);
      }
    }
  
    runAdminCheck();
  }, []);
  const { user, loading: authLoading, isLoggedIn } = useAuth();
  const { items: wishlistItemIds, isWishlistLoaded, removeFromWishlist } = useWishlist();
  const router = useRouter();
  const { toast } = useToast();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  
  const [userData, setUserData] = useState<UserDocument | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  
  const [isEditAddressDialogOpen, setIsEditAddressDialogOpen] = useState(false);
  const [currentEditingAddress, setCurrentEditingAddress] = useState<Address | null>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editableCountryCode, setEditableCountryCode] = useState('');
  const [editablePhoneNumber, setEditablePhoneNumber] = useState('');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    let unsubscribeUserDoc: Unsubscribe = () => {};

    if (!authLoading && !isLoggedIn) {
      router.push('/auth');
    } else if (user) {
      setLoadingUserData(true);
      unsubscribeUserDoc = subscribeToUserData(user.uid, (fetchedUserData) => {
        setUserData(fetchedUserData);
        if (fetchedUserData) {
          setEditableCountryCode(fetchedUserData.countryCode || '');
          setEditablePhoneNumber(fetchedUserData.phoneNumber || '');
        }
        setLoadingUserData(false);
      });

      const loadWishlistProducts = async () => {
        if (isWishlistLoaded && wishlistItemIds.length > 0) {
            setIsLoadingProducts(true);
            try {
                const fetchedProducts = await fetchAllProducts();
                setAllProducts(fetchedProducts);
            } catch (err) {
                console.error("Failed to fetch products for wishlist", err);
            } finally {
                setIsLoadingProducts(false);
            }
        } else if (isWishlistLoaded && wishlistItemIds.length === 0) {
            setAllProducts([]);
            setIsLoadingProducts(false);
        }
      };
      loadWishlistProducts();

      setLoadingOrders(true);
      fetchOrdersByUserId(user.uid).then(fetchedOrders => {
        setOrders(fetchedOrders);
        setLoadingOrders(false);
      }).catch(err => {
        console.error("Failed to fetch orders", err);
        setOrders([]);
        setLoadingOrders(false);
        toast({ title: "Error", description: "Could not load your order history.", variant: "destructive" });
      });
    }

    return () => {
      unsubscribeUserDoc(); // Cleanup subscription on component unmount
    };
  }, [authLoading, isLoggedIn, router, user, isWishlistLoaded, wishlistItemIds, toast]);

  const addresses = userData?.shippingAddresses || [];

  const wishlistProducts: Product[] = (isWishlistLoaded && !isLoadingProducts && allProducts.length > 0)
    ? allProducts.filter(product => product && product.id && wishlistItemIds.includes(product.id))
    : [];

  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
      router.push('/');
    } catch (error) {
      toast({ title: 'Sign Out Error', description: 'Failed to sign out. Please try again.', variant: 'destructive' });
    }
  };

  const handleToggleEditProfile = () => {
    if (!user || !userData) return;
    if (isEditingProfile) { // When canceling edit
      setEditableCountryCode(userData.countryCode || '');
      setEditablePhoneNumber(userData.phoneNumber || '');
    }
    setIsEditingProfile(!isEditingProfile);
  };

  const handleSaveProfileChanges = async () => {
    // Placeholder for saving phone number changes
    // This would involve a new Server Action similar to updateShippingAddress
    console.log("Attempting to save profile changes:", { countryCode: editableCountryCode, phoneNumber: editablePhoneNumber });
    toast({ title: "Profile Update Coming Soon", description: "Saving phone number changes will be available soon." });
    setIsEditingProfile(false); 
  };
  
  const handleDeleteAddress = (addressId: string) => {
    // Placeholder for deleting an address
    // This would involve a new Server Action
    console.log("Attempting to delete address:", addressId);
    toast({ title: "Coming Soon", description: `Deleting address (ID: ${addressId}) will be available soon.`, variant: "destructive" });
  };

  const showOverallLoading = authLoading || (!isLoggedIn && !authLoading) ||
                             (isLoggedIn && isWishlistLoaded && wishlistItemIds.length > 0 && isLoadingProducts && allProducts.length === 0) ||
                             (isLoggedIn && loadingUserData && !userData) || 
                             (isLoggedIn && loadingOrders && orders.length === 0 && !authLoading && isLoggedIn);

  if (showOverallLoading) {
    return <ProfilePageSkeleton />;
  }

  if (!isLoggedIn || !user) {
    // This case should be covered by the useEffect redirect, but as a fallback
    return null; 
  }
  
  const handleEditAddressSuccess = (message?: string) => {
    setIsEditAddressDialogOpen(false);
    setCurrentEditingAddress(null);
    // Toast is handled by AddressForm/Server Action now
    // if (message) {
    //  toast({ title: "Success", description: message });
    // }
  };
  
  const openEditAddressDialog = (address: Address) => {
    setCurrentEditingAddress(address);
    setIsEditAddressDialogOpen(true);
  };


  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-primary">Your Profile</h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Account Details</CardTitle>
          <CardDescription>Manage your account information and settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.displayName && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Display Name</p>
              <p className="text-lg text-foreground">{user.displayName}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email Address</p>
            <p className="text-lg text-foreground">{user.email}</p>
          </div>
          
          {loadingUserData && !userData ? (
            <>
              <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                  <Skeleton className="h-6 w-1/2" />
              </div>
            </>
          ) : isEditingProfile ? (
            <>
              <div className="grid grid-cols-3 gap-4 items-end">
                <div className="space-y-2 col-span-1">
                  <Label htmlFor="countryCode">Country Code</Label>
                  <Input
                    id="countryCode"
                    value={editableCountryCode}
                    onChange={(e) => setEditableCountryCode(e.target.value)}
                    placeholder="+1"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={editablePhoneNumber}
                    onChange={(e) => setEditablePhoneNumber(e.target.value)}
                    placeholder="1234567890"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
               <div>
                <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                {(userData?.countryCode || userData?.phoneNumber) ? (
                    <p className="text-lg text-foreground">
                        {userData.countryCode && <span>{userData.countryCode} </span>}
                        {userData.phoneNumber}
                    </p>
                ) : (
                    <p className="text-sm text-muted-foreground italic">Not provided</p>
                )}
               </div>
            </>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">User ID</p>
            <p className="text-sm text-foreground break-all">{user.uid}</p>
          </div>
          <div className="flex space-x-2 pt-4">
            {isEditingProfile ? (
              <>
                <Button onClick={handleSaveProfileChanges}>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
                <Button variant="outline" onClick={handleToggleEditProfile}>
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={handleToggleEditProfile}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            )}
            <Button variant="destructive" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <ShoppingBag className="mr-3 h-6 w-6 text-accent" /> Order History
          </CardTitle>
          <CardDescription>Review your past purchases.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingOrders ? (
            <OrderHistorySkeleton />
          ) : orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="p-4 shadow-md">
                  <CardHeader className="p-0 pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Order ID: {order.id.substring(0, 8)}...</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {order.orderDate ? format(new Date(order.orderDate), 'PPP') : 'Date unavailable'}
                      </p>
                    </div>
                    <p className="text-md font-semibold text-accent">Total: ${order.totalAmount.toFixed(2)}</p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Items:</p>
                    <ul className="space-y-2">
                      {order.items.map((item, index) => (
                        <li key={`${order.id}-${item.productId}-${index}`} className="flex items-center space-x-3 text-sm p-2 border-b last:border-b-0">
                          <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0">
                            <Image
                              src={item.imageUrl || 'https://placehold.co/48x48.png'}
                              alt={item.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                              data-ai-hint="order item thumbnail"
                            />
                          </div>
                          <div className="flex-grow">
                            <p className="font-medium text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity} - Price: ${item.price.toFixed(2)} each</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {order.shippingAddress && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Shipped to:</p>
                        <p className="text-xs text-muted-foreground">
                          {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}, {order.shippingAddress.country}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-6">You have no past orders.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Heart className="mr-3 h-6 w-6 text-accent" /> Wishlist
          </CardTitle>
          <CardDescription>Items you've saved for later.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingProducts && wishlistItemIds.length > 0 ? (
            <WishlistSkeleton />
          ) : wishlistProducts.length > 0 ? (
            <ul className="space-y-4">
              {wishlistProducts.map((item) => {
                if (!item) return null;
                let primaryImageUrl: string | null = null;
                if (Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
                    primaryImageUrl = item.imageUrls[0];
                } else if (typeof (item as any).imageUrl === 'string') { 
                    primaryImageUrl = (item as any).imageUrl;
                }
                const imageSrcToDisplay = primaryImageUrl || 'https://placehold.co/64x64.png';

                return (
                   <li key={item.id} className="flex items-center space-x-4 p-3 rounded-md border bg-card">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0">
                        <Image
                          src={imageSrcToDisplay}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                          data-ai-hint={`${item.category} thumbnail`}
                        />
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-card-foreground">{item.name}</p>
                      <p className="text-sm text-accent font-medium">${item.price.toFixed(2)}</p>
                    </div>
                     <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromWishlist(item.id, item.name)}
                        className="text-destructive hover:text-destructive/80"
                        aria-label={`Remove ${item.name} from wishlist`}
                      >
                         <Trash2 className="h-5 w-5" />
                      </Button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">Your wishlist is empty. Start adding items!</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <MapPin className="mr-3 h-6 w-6 text-accent" /> Saved Shipping Addresses
          </CardTitle>
          <CardDescription>Your saved shipping addresses. You can edit or delete them.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingUserData && addresses.length === 0 ? ( 
            <AddressSkeleton />
          ) : addresses.length > 0 ? (
             <div className="space-y-6">
              {addresses.map((address) => (
                <div key={address.id} className="p-4 border rounded-md bg-card relative">
                   {address.isDefault && (
                    <span className="absolute top-2 right-2 text-xs font-semibold bg-accent text-accent-foreground px-2 py-0.5 rounded">Default</span>
                   )}
                   <p className="font-medium text-card-foreground">{address.street}</p>
                   {(address.city || address.state || address.zip) && (
                     <p className="text-sm text-muted-foreground">
                       {address.city && `${address.city}, `}
                       {address.state && `${address.state} `}
                       {address.zip}
                     </p>
                   )}
                   <p className="text-sm text-muted-foreground">{address.country}</p>
                   <div className="mt-3 space-x-2">
                     <Button variant="outline" size="sm" onClick={() => openEditAddressDialog(address)}>
                        <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit
                     </Button>
                     <Button variant="destructive" size="sm" onClick={() => handleDeleteAddress(address.id)}>
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                     </Button>
                   </div>
                 </div>
              ))}
             </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">You haven't saved any shipping addresses yet.</p>
          )}
          
          {/* Edit Address Dialog */}
          <Dialog open={isEditAddressDialogOpen} onOpenChange={(open) => {
            setIsEditAddressDialogOpen(open);
            if (!open) setCurrentEditingAddress(null); 
          }}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Shipping Address</DialogTitle>
                <DialogDescription>
                  Update the details for your shipping address.
                </DialogDescription>
              </DialogHeader>
              {currentEditingAddress && user && (
                <AddressForm
                  onSaveSuccess={handleEditAddressSuccess}
                  addressToEdit={currentEditingAddress}
                />
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfilePageSkeleton() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
       <Skeleton className="h-10 w-1/3 mb-4" /> {/* Title skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2 mb-2" /> {/* Card title skeleton */}
          <Skeleton className="h-4 w-3/4" /> {/* Card description skeleton */}
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/3" />
           {/* Phone number skeleton */}
          <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
              <Skeleton className="h-6 w-1/2" />
          </div>
          <Skeleton className="h-6 w-3/4" /> {/* User ID skeleton */}
          <div className="flex space-x-2 pt-4">
            <Skeleton className="h-10 w-28" /> {/* Button skeleton */}
            <Skeleton className="h-10 w-24" /> {/* Button skeleton */}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2 mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
           <OrderHistorySkeleton />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <WishlistSkeleton />
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <AddressSkeleton />
        </CardContent>
      </Card>
    </div>
  );
}

function WishlistSkeleton() {
    return (
        <div className="space-y-4">
           {[...Array(2)].map((_, i) => (
             <li key={i} className="flex items-center space-x-4 p-3 rounded-md border bg-card">
               <Skeleton className="w-16 h-16 rounded-md shrink-0" />
               <div className="flex-grow space-y-2">
                 <Skeleton className="h-5 w-3/4" />
                 <Skeleton className="h-4 w-1/4" />
               </div>
               <Skeleton className="h-8 w-10" />
             </li>
           ))}
        </div>
    );
}

function AddressSkeleton() {
    return (
       <div className="space-y-6">
           {[...Array(1)].map((_, i) => (
             <div key={i} className="p-4 border rounded-md space-y-2">
               <Skeleton className="h-5 w-3/4" /> 
               <Skeleton className="h-4 w-1/2" /> 
               <Skeleton className="h-4 w-1/3" /> 
               <div className="mt-3 space-x-2">
                 <Skeleton className="h-8 w-16 inline-block" />
                 <Skeleton className="h-8 w-20 inline-block" />
               </div>
             </div>
           ))}
       </div>
    );
}

function OrderHistorySkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(2)].map((_, i) => (
        <Card key={i} className="p-4 shadow-md">
          <CardHeader className="p-0 pb-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-1/2" /> 
              <Skeleton className="h-4 w-1/4" /> 
            </div>
            <Skeleton className="h-5 w-1/3 mt-1" /> 
          </CardHeader>
          <CardContent className="p-0">
            <Skeleton className="h-4 w-1/5 mb-2" /> 
            <ul className="space-y-3">
              {[...Array(1)].map((_, j) => (
                <li key={j} className="flex items-center space-x-3 p-2 border-b last:border-b-0">
                  <Skeleton className="w-12 h-12 rounded-md shrink-0" />
                  <div className="flex-grow space-y-1">
                    <Skeleton className="h-4 w-3/4" /> 
                    <Skeleton className="h-3 w-1/2" /> 
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t">
              <Skeleton className="h-4 w-1/4 mb-1" /> 
              <Skeleton className="h-3 w-full" /> 
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
