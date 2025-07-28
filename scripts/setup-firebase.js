const { execSync } = require('child_process');

const setupFirebase = async () => {
  try {
    // Login to Firebase
    console.log('Logging into Firebase...');
    execSync('firebase login', { stdio: 'inherit' });

    // Initialize Firebase
    console.log('Initializing Firebase...');
    execSync('firebase init', { stdio: 'inherit' });

    // Install dependencies
    console.log('Installing dependencies...');
    execSync('npm install firebase @firebase/messaging @types/firebase', { stdio: 'inherit' });
    execSync('cd functions && npm install', { stdio: 'inherit' });

    // Deploy functions
    console.log('Deploying Firebase functions...');
    execSync('firebase deploy --only functions', { stdio: 'inherit' });

    console.log('Firebase setup complete!');
  } catch (error) {
    console.error('Error during Firebase setup:', error);
    process.exit(1);
  }
};

setupFirebase();
