
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type UserCredential,
  type AuthError,
  type User
} from 'firebase/auth';
import { auth, db } from './config'; // db is Firestore
import { doc, setDoc as setFirestoreDoc, serverTimestamp, collection } from 'firebase/firestore';
import type { SignUpFormValues } from '@/components/auth/auth-form';
import type { Address } from '@/types';

export async function signUpWithEmail(values: SignUpFormValues): Promise<UserCredential> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
    const user = userCredential.user;

    if (user) {
      // Update Firebase Auth user profile
      await updateProfile(user, {
        displayName: `${values.firstName} ${values.lastName}`
      });

      // Create the default shipping address object from structured signup details
      // Generate a client-side unique ID for the new address
      const newAddressId = doc(collection(db, "users", user.uid, "dummyPathForId")).id; // Temporary ref to get an ID

      const defaultShippingAddress: Address = {
        id: newAddressId,
        street: values.street,
        city: values.city,
        state: values.state,
        zip: values.zip,
        country: values.country,
        isDefault: true,
      };

      // Data for Firestore
      const firestoreUserData = {
        uid: user.uid,
        firstName: values.firstName,
        lastName: values.lastName,
        displayName: `${values.firstName} ${values.lastName}`,
        email: values.email,
        countryCode: values.phoneCountryCode, // Use phoneCountryCode from form
        phoneNumber: values.phoneNumber,
        shippingAddresses: [defaultShippingAddress], // Initialize with the structured default address
        wishlistedProductIds: [], // Initialize empty wishlist
        createdAt: serverTimestamp(),
      };
      const userFirestoreDocRef = doc(db, "users", user.uid);
      await setFirestoreDoc(userFirestoreDocRef, firestoreUserData, { merge: true });

      // RTDB storage is currently removed in previous steps, but if re-added,
      // ensure its data structure also reflects the structured address.
    }
    
    return userCredential;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error as AuthError;
  }
}

export async function signInWithEmail(values: {email: string, password: string}): Promise<UserCredential> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
    return userCredential;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error as AuthError;
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error as AuthError;
  }
}
