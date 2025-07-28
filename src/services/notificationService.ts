import { getMessaging } from 'firebase/messaging';
import { getToken } from '@/lib/firebase';

interface NotificationPayload {
  notification: {
    title: string;
    body: string;
    icon?: string;
  };
  data?: Record<string, string>;
}

interface ContactMessageData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const requestPermission = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken({
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
      });
      
      // Store the token in Firebase using Cloud Functions
      if (token) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL}/requestPermission`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          }
        );

        if (!response.ok) {
          console.error('Failed to store token');
        }
      }
      
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

export const listenForNotifications = () => {
  // This will be handled by the Firebase SDK automatically
  // No need to implement onMessage here since we're using the Firebase SDK
};

export const sendContactNotification = async (messageData: ContactMessageData) => {
  try {
    // Get the FCM token from Firebase Functions
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL}/sendNotification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Contact Message',
          body: `New message from ${messageData.name}: ${messageData.subject}`,
          tokens: [process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!]
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    const result = await response.json();
    console.log('Notification sent successfully:', result);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};
