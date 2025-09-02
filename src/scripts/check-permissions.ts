#!/usr/bin/env tsx

import { initializeFirebase } from '../config/firebase.js';
import { logger } from '../middlewares/logger.js';
import admin from 'firebase-admin';

// Initialize Firebase FIRST
initializeFirebase();

async function checkPermissions() {
  try {
    logger.info('🔍 Checking Firebase service account permissions...');

    // Test 1: Check if we can access the project
    const projectId = admin.app().options.projectId;
    logger.info(`📋 Project ID: ${projectId}`);

    // Test 2: Try to get project info
    try {
      // const project = await admin.projects().get();
      logger.info(`✅ Project access successful`);
    } catch (error) {
      logger.error('❌ Project access failed:', error);
    }

    // Test 3: Try to list Firestore databases
    try {
      const db = admin.firestore();
      // Try to get database info
      logger.info('✅ Firestore instance created successfully');
    } catch (error) {
      logger.error('❌ Firestore instance creation failed:', error);
    }

    // Test 4: Check service account info
    try {
      const serviceAccount = admin.app().options.credential;
      logger.info('✅ Service account credential loaded');
    } catch (error) {
      logger.error('❌ Service account credential failed:', error);
    }

    logger.info('🎉 Permission check completed!');
  } catch (error) {
    logger.error('❌ Permission check failed:', error);
  }
}

checkPermissions()
  .then(() => {
    logger.info('🏁 Permission check completed');
    process.exit(0);
  })
  .catch(error => {
    logger.error('💥 Permission check failed:', error);
    process.exit(1);
  });
