import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Function to send notifications
export const sendNotification = functions.https.onCall(async (data, context) => {
  // Validate data
  if (!data.title || !data.body || !data.tokens || !Array.isArray(data.tokens)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with title, body, and tokens specified'
    );
  }

  // Build the notification message
  const message = {
    notification: {
      title: data.title,
      body: data.body,
      icon: '/favicon.ico'
    },
    tokens: data.tokens
  };

  try {
    // Send the notification
    const response = await admin.messaging().sendMulticast(message);
    
    // Log success
    console.log(`Successfully sent notification to ${response.successCount} devices`);
    
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send notification: ' + error.message
    );
  }
});

// Function to get the FCM token from a user's device
export const requestPermission = functions.https.onCall(async (data, context) => {
  // Get the user's FCM token
  const token = data.token;
  
  if (!token) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Token is required'
    );
  }

  try {
    // Store the token in Firebase Realtime Database or Firestore
    await admin.database().ref(`users/${context.auth?.uid}/fcmToken`).set(token);
    
    return {
      success: true,
      message: 'Token stored successfully'
    };
  } catch (error) {
    console.error('Error storing token:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to store token: ' + error.message
    );
  }
});
