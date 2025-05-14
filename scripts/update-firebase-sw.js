/**
 * Script to update the Firebase messaging service worker with configuration.
 * This script runs after the build and injects Firebase config directly into
 * the service worker file to avoid having to pass it via messaging at runtime.
 */

const fs = require('fs');
const path = require('path');

// Path to environment variables
require('dotenv').config();

// Get Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Path to the service worker file
const swPath = path.join(__dirname, '../build/firebase-messaging-sw.js');

try {
  // Check if the service worker file exists
  if (!fs.existsSync(swPath)) {
    console.log('⚠️ Service worker file not found. Creating placeholder...');
    
    // Create the build directory if it doesn't exist
    const buildDir = path.dirname(swPath);
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }
    
    // Copy the original service worker from public directory
    const originalSwPath = path.join(__dirname, '../public/firebase-messaging-sw.js');
    fs.copyFileSync(originalSwPath, swPath);
    console.log('✅ Created service worker from template');
  }

  // Read the service worker file
  let swContent = fs.readFileSync(swPath, 'utf8');
  
  // Replace the placeholder with actual config
  const placeholder = 'const firebaseConfig = {\n  // Firebase config will be injected here at runtime from window.FIREBASE_CONFIG\n};';
  
  if (swContent.includes(placeholder)) {
    swContent = swContent.replace(
      placeholder,
      `const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};`
    );
    
    // Write the updated content back to the file
    fs.writeFileSync(swPath, swContent);
    console.log('✅ Successfully injected Firebase config into service worker');
  } else {
    console.log('⚠️ Firebase config placeholder not found in service worker.');
    console.log('   Attempting to replace any existing firebaseConfig declaration...');
    
    // Try to find and replace the firebaseConfig variable using regex
    const configRegex = /const\s+firebaseConfig\s*=\s*\{[\s\S]*?\};/;
    if (configRegex.test(swContent)) {
      swContent = swContent.replace(
        configRegex,
        `const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};`
      );
      
      // Write the updated content back to the file
      fs.writeFileSync(swPath, swContent);
      console.log('✅ Successfully replaced Firebase config in service worker');
    } else {
      console.error('❌ Could not locate firebaseConfig in service worker.');
      process.exit(1);
    }
  }
} catch (error) {
  console.error('❌ Error updating service worker:', error);
  process.exit(1);
}