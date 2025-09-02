import createApp from '../src/app.js';
import { initializeFirebase } from '../src/config/firebase.js';

// Initialize Firebase
initializeFirebase();

// Create and export the Express app for Vercel
const app = await createApp();

export default app;
