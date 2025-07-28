import { getAuth, User } from '@/lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';

// Check if user is an administrator
const isAdmin = async (user: User | null): Promise<boolean> => {
  if (!user) return false;
  
  const { data, error } = await supabase
    .from('users')
    .select('roles')
    .eq('id', user.uid)
    .single();

  if (error || !data) return false;
  return data.roles?.includes('admin') ?? false;
};

// Initialize Firebase Messaging for administrators
export const initializeAdminNotifications = () => {
  try {
    const auth = getAuth();
    const messaging = getFirebaseMessaging();
    
    const user = auth.currentUser;
    if (!user) return;

    // Only initialize for admins
    const isUserAdmin = isAdmin(user);
    if (!isUserAdmin) return;

    // Request permission to send notifications
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        // Get registration token
        getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        }).then((currentToken) => {
          if (currentToken) {
            // Save token to Supabase
            supabase
              .from('notification_tokens')
              .upsert({
                user_id: user.uid,
                token: currentToken,
              });
          }
        });
      }
    });

    // Set up message handler
    onMessage(messaging, (payload) => {
      const notification = payload.notification;
      if (notification) {
        new Notification(notification.title, {
          body: notification.body,
          icon: '/favicon.ico',
        });
      }
    });
  } catch (error) {
    console.error('Error initializing admin notifications:', error);
  }
};

// Handle incoming notifications
export const setupNotificationHandler = () => {
  try {
    const messaging = getFirebaseMessaging();
    
    // Set up message handler
    onMessage(messaging, (payload) => {
      const notification = payload.notification;
      if (notification) {
        new Notification(notification.title, {
          body: notification.body,
          icon: '/favicon.ico',
        });
      }
    });
  } catch (error) {
    console.error('Error setting up notification handler:', error);
  }
};

// Send notification to all admin devices
export const sendContactNotification = async (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  try {
    // Get all admin notification tokens
    const { data: tokens, error } = await supabase
      .from('notification_tokens')
      .select('token')
      .eq('user_id', supabase.auth.user()?.id)
      .eq('roles', 'admin');

    if (error) throw error;

    if (tokens && tokens.length > 0) {
      // Send notification to each token
      tokens.forEach((token) => {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification('New Contact Form Submission', {
            body: `${data.name} (${data.email}) has submitted a contact form`,
            icon: '/favicon.ico',
            data: {
              type: 'contact_form',
              ...data,
            },
          });
        });
      });
    }
  } catch (error) {
    console.error('Error sending contact notification:', error);
  }
};
