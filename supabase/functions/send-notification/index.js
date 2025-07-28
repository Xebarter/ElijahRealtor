const { initializeApp } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

// Initialize Firebase Admin
initializeApp({
  credential: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  databaseURL: process.env.DATABASE_URL,
});

exports.handler = async (event) => {
  try {
    const { tokens, payload } = JSON.parse(event.body);

    if (!tokens || !payload) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' }),
      };
    }

    // Send notifications to all tokens
    const response = await getMessaging().sendMulticast({
      tokens,
      notification: payload.notification,
      data: payload.data,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: response.successCount,
        failure: response.failureCount,
        results: response.responses,
      }),
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
