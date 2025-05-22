import 'dotenv/config'; // ✅ Explicitly load .env.local if needed
import * as admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

let adminAuth: Auth | undefined = undefined;
let adminDb: Firestore | undefined = undefined;
let adminApp: admin.app.App | undefined = undefined;

// 🔍 Debug log: Check if environment variable is loaded
console.log("DEBUG: FIREBASE_SERVICE_ACCOUNT_JSON (first 100 chars):", serviceAccountJson?.slice(0, 100) ?? 'undefined');

if (!admin.apps.length) {
  if (serviceAccountJson) {
    try {
      console.log("DEBUG: Parsing service account JSON...");
      const serviceAccount = JSON.parse(serviceAccountJson);
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      adminAuth = adminApp.auth();
      adminDb = adminApp.firestore();
      console.log("✅ Firebase Admin SDK initialized successfully.");
    } catch (error: any) {
      console.error("❌ CRITICAL ERROR: Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON.");
      console.error("Parse error:", error.message);
      console.error("Fix: Double-check your .env.local formatting (escaped JSON, wrapped in double quotes, with \\n in keys).");
    }
  } else {
    console.error("❌ CRITICAL: FIREBASE_SERVICE_ACCOUNT_JSON is not set.");
    console.error("Fix: Make sure .env.local exists and contains the correctly escaped service account JSON.");
  }
} else {
  adminApp = admin.apps[0]!;
  adminAuth = adminApp.auth();
  adminDb = adminApp.firestore();
  console.log("ℹ️ Firebase Admin SDK reused existing app instance.");
}

export { adminAuth, adminDb };
export default adminApp;
