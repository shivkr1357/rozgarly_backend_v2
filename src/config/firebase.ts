import admin from 'firebase-admin';
import { Initialize } from 'fireorm';
import { env } from './env.js';

let firebaseApp: admin.app.App;

export const initializeFirebase = (): admin.app.App => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Initialize Firebase Admin SDK
    if (env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use service account key file
      firebaseApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: env.FIREBASE_PROJECT_ID!,
      });
    } else if (env.FIREBASE_PROJECT_ID && env.FIREBASE_PRIVATE_KEY && env.FIREBASE_CLIENT_EMAIL) {
      // Use environment variables
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.FIREBASE_PROJECT_ID,
          privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
        }),
        projectId: env.FIREBASE_PROJECT_ID,
      });
    } else {
      throw new Error(
        'Firebase configuration not found. Please set GOOGLE_APPLICATION_CREDENTIALS or Firebase environment variables.'
      );
    }

    // Initialize FireORM with specific database ID
    const firestore = admin.firestore();
    firestore.settings({
      databaseId: 'rozgarly',
    });
    Initialize(firestore);

    console.log('Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
};

export const getFirebaseApp = (): admin.app.App => {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return firebaseApp;
};

export const getAuth = () => admin.auth();
export const getFirestore = () => admin.firestore();
