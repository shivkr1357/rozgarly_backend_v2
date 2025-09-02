#!/usr/bin/env tsx

import { initializeFirebase } from '../config/firebase.js';
import { logger } from '../middlewares/logger.js';
import admin from 'firebase-admin';

// Initialize Firebase FIRST
initializeFirebase();

async function testDirectFirestore() {
  try {
    logger.info('🔍 Testing direct Firestore operations...');

    const db = admin.firestore();

    // Test 1: Try to create a simple document without FireORM
    logger.info('📝 Test 1: Creating a test document directly...');
    const testDoc = await db.collection('test').add({
      message: 'Hello Firestore!',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    logger.info(`✅ Test document created with ID: ${testDoc.id}`);

    // Test 2: Try to read the document back
    logger.info('📖 Test 2: Reading the test document...');
    const doc = await testDoc.get();
    if (doc.exists) {
      logger.info(`✅ Document read successfully: ${JSON.stringify(doc.data())}`);
    } else {
      logger.error('❌ Document does not exist');
    }

    // Test 3: Try to query documents
    logger.info('🔍 Test 3: Querying test collection...');
    const snapshot = await db.collection('test').get();
    logger.info(`✅ Found ${snapshot.size} documents in test collection`);

    // Test 4: Clean up - delete the test document
    logger.info('🗑️ Test 4: Cleaning up test document...');
    await testDoc.delete();
    logger.info('✅ Test document deleted');

    logger.info('🎉 All direct Firestore tests passed!');
  } catch (error) {
    logger.error('❌ Direct Firestore test failed:', error);

    // Check if it's a database not found error
    if (error instanceof Error && error.message.includes('NOT_FOUND')) {
      logger.error('💡 This looks like a database not found error. Please check:');
      logger.error('   1. Is the Firestore database created in your Firebase project?');
      logger.error('   2. Is the project ID correct in your service account?');
      logger.error('   3. Are the Firestore API permissions enabled?');
      logger.error('   4. Does the service account have the right IAM roles?');
    }
  }
}

testDirectFirestore()
  .then(() => {
    logger.info('🏁 Direct Firestore test completed');
    process.exit(0);
  })
  .catch(error => {
    logger.error('💥 Direct Firestore test failed:', error);
    process.exit(1);
  });
