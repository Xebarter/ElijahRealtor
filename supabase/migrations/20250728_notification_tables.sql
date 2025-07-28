-- Create admin_notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    fcm_token TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notification_history table
CREATE TABLE IF NOT EXISTS notification_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES admin_notifications(user_id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    error_message TEXT
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_notifications_updated_at
    BEFORE UPDATE ON admin_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage their own notifications
CREATE POLICY "Admins can manage their notifications"
    ON admin_notifications
    FOR ALL
    USING (auth.uid() = user_id);

-- Allow admins to view their notification history
CREATE POLICY "Admins can view their notification history"
    ON notification_history
    FOR SELECT
    USING (auth.uid() = admin_id);

-- Function to send notifications through Supabase Edge Functions
CREATE OR REPLACE FUNCTION send_admin_notification(
    notification_type TEXT,
    payload JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    admin_record RECORD;
BEGIN
    -- Get all active admin FCM tokens
    FOR admin_record IN SELECT fcm_token FROM admin_notifications WHERE user_id IN (
        SELECT id FROM auth.users WHERE role = 'admin'
    ) LOOP
        -- Insert into notification history
        INSERT INTO notification_history (admin_id, notification_type, payload)
        VALUES (
            (SELECT user_id FROM admin_notifications WHERE fcm_token = admin_record.fcm_token),
            notification_type,
            payload
        )
        RETURNING id INTO result;
    END LOOP;

    RETURN jsonb_build_object('status', 'success', 'message', 'Notification sent to all admins');
END;
$$;
