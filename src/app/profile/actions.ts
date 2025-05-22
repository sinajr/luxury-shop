
"use server";

import { z } from 'zod';
import { adminDb, adminAuth } from '@/lib/firebase/admin'; // Admin SDK for server-side operations
import { doc, serverTimestamp, type FieldValue } from 'firebase/firestore';
import type { Address, UserDocument } from '@/types';
import { revalidatePath } from 'next/cache'; 
import { FirebaseError } from 'firebase-admin';

const AddressSchema = z.object({
  street: z.string().min(3, "Street address is required and must be at least 3 characters.").max(200),
  city: z.string().min(1, "City is required.").max(100),
  state: z.string().min(1, "State/Province is required.").max(100),
  zip: z.string().min(3, "ZIP/Postal code is required.").max(20),
  country: z.string().min(1, "Country is required.").max(100),
  isDefault: z.preprocess((val) => val === "on" || val === true, z.boolean()).optional(),
});

export type AddressFormState = {
  message?: string | null;
  errors?: { // General server/auth errors
    general?: string[];
    idToken?: string[];
  };
  fieldErrors?: z.ZodIssue[]; // For Zod field-specific errors from server validation
  status: 'idle' | 'loading' | 'success' | 'error';
  toastMessage?: string;
};

// Helper to return a server configuration error
function getServerConfigErrorState(): AddressFormState {
  const errorMessage = "Critical Server Error: The Firebase Admin SDK failed to initialize on the server. This is usually due to the FIREBASE_SERVICE_ACCOUNT_JSON environment variable not being set correctly. Please check your **SERVER CONSOLE LOGS** (where your Next.js app is running) for detailed error messages from `src/lib/firebase/admin.ts`. Ensure `FIREBASE_SERVICE_ACCOUNT_JSON` is correctly defined in your `.env.local` file (and for deployment, in your hosting environment). The value must be the complete JSON content of your service account key file. Restart your Next.js server after setting/fixing the environment variable.";
  console.error("Server Action Error: Admin SDK not initialized. Detailed error should be in server logs from 'src/lib/firebase/admin.ts'."); 
  return {
    status: 'error',
    message: errorMessage,
    errors: { general: [errorMessage] },
    fieldErrors: [],
  };
}

export async function updateShippingAddress(
  prevState: AddressFormState,
  // userId is no longer passed directly; it's derived from the idToken
  addressId: string | undefined, // Address ID is still needed to identify which address to update
  formData: FormData
): Promise<AddressFormState> {
  console.log("updateShippingAddress Server Action: Triggered.");

  if (!adminDb || !adminAuth) {
    return getServerConfigErrorState();
  }

  const idToken = formData.get('idToken') as string;
  if (!idToken) {
     console.error("updateShippingAddress: ID token is missing from form data.");
    return { status: 'error', message: 'Authentication token is missing. Please ensure you are logged in.', errors: { idToken: ['Authentication token is missing.'] } };
  }
  if (!addressId) {
    console.error("updateShippingAddress: Address ID is missing.");
    return { status: 'error', message: 'Address ID is missing. Cannot update.' };
  }

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
     console.log("updateShippingAddress: ID token verified successfully for UID:", decodedToken.uid);
  } catch (error) {
    console.error("updateShippingAddress: Invalid ID token:", error);
    return { status: 'error', message: 'Authentication failed. Invalid or expired session token.' };
  }

  const verifiedUserId = decodedToken.uid;
  console.log(`updateShippingAddress: Verified user ID: ${verifiedUserId}, Target address ID: ${addressId}`);

  const validatedFields = AddressSchema.safeParse({
    street: formData.get('street'),
    city: formData.get('city'),
    state: formData.get('state'),
    zip: formData.get('zip'),
    country: formData.get('country'),
    isDefault: formData.get('isDefault'),
  });

  if (!validatedFields.success) {
    console.error("updateShippingAddress: Server-side validation failed.", validatedFields.error.flatten().fieldErrors);
    return {
      fieldErrors: validatedFields.error.errors,
      message: "Validation failed on server. Please check your inputs.",
      status: 'error',
    };
  }

  const updatedAddressData = validatedFields.data;
  console.log("updateShippingAddress: Server-side validation passed. Validated data for update:", updatedAddressData);

  const userDocRef = doc(adminDb, "users", verifiedUserId);

  try {
    await adminDb.runTransaction(async (transaction) => {
      console.log("updateShippingAddress: Starting Firestore transaction.");
      const userDocSnapshot = await transaction.get(userDocRef);
      if (!userDocSnapshot.exists()) {
        console.error(`updateShippingAddress: User document not found for UID: ${verifiedUserId}.`);
        throw new Error(`User document not found for UID: ${verifiedUserId}. Cannot update address.`);
      }

      const userData = userDocSnapshot.data() as UserDocument | undefined;
      let currentAddresses: Address[] = userData?.shippingAddresses || [];
      console.log("updateShippingAddress: Current addresses from Firestore:", currentAddresses);

      const addressIndex = currentAddresses.findIndex(addr => addr.id === addressId);

      if (addressIndex === -1) {
        console.error(`updateShippingAddress: Address with ID ${addressId} not found for user ${verifiedUserId}.`);
        throw new Error(`Address with ID ${addressId} not found. Cannot update.`);
      }
      console.log(`updateShippingAddress: Found address at index ${addressIndex} to update.`);
      
      const addressToUpdate: Address = {
        ...currentAddresses[addressIndex]!, // Ensure it exists
        street: updatedAddressData.street,
        city: updatedAddressData.city,
        state: updatedAddressData.state,
        zip: updatedAddressData.zip,
        country: updatedAddressData.country,
        isDefault: updatedAddressData.isDefault || false,
      };
      
      console.log("updateShippingAddress: Address object prepared for update:", addressToUpdate);

      if (addressToUpdate.isDefault) {
        // Unset other defaults, then set the current one
        currentAddresses = currentAddresses.map((addr, idx) => ({ 
          ...addr, 
          isDefault: idx === addressIndex ? true : false 
        }));
      } else {
        currentAddresses[addressIndex] = addressToUpdate;
      }
      
      // If, after potential unsetting, no default address exists and there are addresses, make the first one default.
      const hasDefault = currentAddresses.some(addr => addr.isDefault);
      if (!hasDefault && currentAddresses.length > 0) {
        console.log("updateShippingAddress: No default address found after update, setting the first one as default.");
        currentAddresses[0].isDefault = true;
      } else if (currentAddresses.length > 0 && currentAddresses.filter(addr => addr.isDefault).length > 1) {
         // This should ideally be prevented by the mapping logic above, but as a safeguard
         console.warn("updateShippingAddress: Multiple default addresses found after logic. Ensuring only one (the one being edited if set to default).");
         const intendedDefaultIndex = currentAddresses.findIndex(addr => addr.id === addressId && addr.isDefault === true);
         currentAddresses = currentAddresses.map((addr, idx) => ({
           ...addr,
           isDefault: idx === (intendedDefaultIndex !== -1 ? intendedDefaultIndex : 0)
         }));
      }
      
      console.log("updateShippingAddress: Final addresses array before update in DB:", currentAddresses);
      transaction.update(userDocRef, {
        shippingAddresses: currentAddresses,
        updatedAt: serverTimestamp() as FieldValue
      });
      console.log("updateShippingAddress: Transaction update scheduled.");
    });
    console.log("updateShippingAddress: Firestore transaction committed successfully.");

    revalidatePath('/profile');
    console.log("updateShippingAddress: Path /profile revalidated.");
    return { status: 'success', message: 'Address updated successfully!', toastMessage: 'Address has been updated.' };

  } catch (error: any) {
    console.error("Error in updateShippingAddress transaction for user", verifiedUserId, "address", addressId, ":", error);
    let errorMessage = `Failed to update address. Please try again.`;
     if (error instanceof FirebaseError) { 
         errorMessage = `Firestore Admin SDK error (${error.code}) while updating address for user ${verifiedUserId}: ${error.message}. Check server logs.`;
    } else if (error.message?.includes("User document not found") || error.message?.includes("Address with ID") ) {
        errorMessage = error.message;
    }
    return {
      status: 'error',
      message: errorMessage,
      errors: { general: [errorMessage] },
    };
  }
}
