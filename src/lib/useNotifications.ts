import { useEffect } from 'react';
import { requestPermission } from '@/services/notificationService';

export const useNotifications = () => {
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Request notification permission
        const token = await requestPermission();
        if (token) {
          console.log('FCM token received:', token);
        } else {
          console.log('Notification permission denied');
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();
  }, []);
};
