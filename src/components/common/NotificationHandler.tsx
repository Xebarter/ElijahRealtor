import React, { useEffect } from 'react';
import { onMessage } from 'firebase/messaging';
import { getFirebaseMessaging } from '@/lib/firebase';

export const NotificationHandler: React.FC = () => {
  useEffect(() => {
    try {
      // Wait for Firebase to be initialized
      const messaging = getFirebaseMessaging();
      
      // Set up message handler
      const messageHandler = (payload: any) => {
        const notification = payload.notification;
        if (notification) {
          new Notification(notification.title, {
            body: notification.body,
            icon: '/favicon.ico',
          });
        }
      };
      
      // Set up the message handler
      onMessage(messaging, messageHandler);
    } catch (error) {
      console.error('Error setting up notification handler:', error);
    }
  }, []);

  return null;
};

export default NotificationHandler;
