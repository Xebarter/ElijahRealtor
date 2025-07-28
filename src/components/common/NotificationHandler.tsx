import React, { useEffect } from 'react';
import { initializeAdminNotifications, setupNotificationHandler } from '../../../services/notificationService';

export const NotificationHandler: React.FC = () => {
  useEffect(() => {
    // Initialize notifications when component mounts
    initializeAdminNotifications();
    setupNotificationHandler();

    // Cleanup on unmount
    return () => {
      // No cleanup needed for now
    };
  }, []);

  return null;
};

export default NotificationHandler;
