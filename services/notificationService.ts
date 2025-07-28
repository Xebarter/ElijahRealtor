import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '@/lib/firebase';
import { getAuth, User } from 'firebase/auth';
import { supabase } from '@/lib/supabase';

const auth = getAuth(app);
const messaging = getMessaging(app);

// Check if user is an administrator
const isAdmin = async (user: User | null): Promise<boolean> => {
  if (!user) return false;
  
  const { data: { roles }, error } = await supabase
    .from('users')
    .select('roles')
    .eq('id', user.uid)
    .single();

  if (error) return false;
  return roles?.includes('admin') ?? false;
};

// Initialize Firebase Messaging for administrators
export const initializeAdminNotifications = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    // Only initialize for admins
    const isUserAdmin = await isAdmin(user);
    if (!isUserAdmin) return;

    // Request permission for notifications
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      if (token) {
        // Store token in Supabase for admin
        await supabase
          .from('admin_notifications')
          .upsert({
            user_id: user.uid,
            fcm_token: token,
            updated_at: new Date().toISOString(),
          });

        console.log('Admin notification token registered successfully');
      }
    }
  } catch (error) {
    console.error('Error initializing admin notifications:', error);
  }
};

// Handle incoming notifications
export const setupNotificationHandler = () => {
  onMessage(messaging, (payload) => {
    const notification = payload.notification;
    if (notification) {
      new Notification(notification.title, {
        body: notification.body,
        icon: '/favicon.ico',
      });

      // Handle click action
      if (notification.click_action) {
        window.location.href = notification.click_action;
      }
    }
  });
};

// Send notification to all admin devices
export const sendContactNotification = async (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  try {
    // Define the notification payload
    const payload = {
      notification: {
        title: 'New Contact Form Submission',
        body: `From: ${data.name}\nSubject: ${data.subject}`,
        click_action: `${window.location.origin}/contact`,
      },
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      },
    };

    // Insert into Supabase to trigger the Edge Function
    const { error } = await supabase
      .rpc('send_admin_notification', {
        notification_type: 'contact_form_submission',
        payload: payload,
      });

    if (error) throw error;

  } catch (error) {
    console.error('Error sending notification:', error);
  }
};
