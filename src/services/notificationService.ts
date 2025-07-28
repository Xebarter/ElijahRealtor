import { getMessaging } from 'firebase/messaging';
import { getAuth } from 'firebase/auth';
import { messaging } from '@/lib/firebase';

interface NotificationPayload {
  notification: {
    title: string;
    body: string;
    icon?: string;
  };
  data?: Record<string, string>;
}

export const requestPermission = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
      });
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

export const listenForNotifications = () => {
  onMessage(messaging, (payload: NotificationPayload) => {
    console.log('Received notification:', payload);
    const notificationTitle = payload.notification?.title;
    const notificationBody = payload.notification?.body;

    if (notificationTitle && notificationBody) {
      new Notification(notificationTitle, {
        body: notificationBody,
        icon: payload.notification.icon || '/favicon.ico',
      });
    }
  });
};

interface ContactMessageData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const sendContactNotification = async (messageData: ContactMessageData) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.error('No user is currently logged in');
      return;
    }

    const notification: NotificationPayload = {
      notification: {
        title: 'New Contact Message',
        body: `New message from ${messageData.name}: ${messageData.subject}`,
        icon: '/favicon.ico',
      },
      data: {
        type: 'contact_message',
        ...messageData,
      },
    };

    // Send notification to user's device
    await messaging.sendToDevice(user.fcmToken, notification);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};
