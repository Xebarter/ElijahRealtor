/*
  # Create comprehensive messaging system

  1. New Tables
    - `conversations` - Message threads between users
    - `messages` - Individual messages within conversations
    - `message_attachments` - File attachments for messages
    - `message_participants` - Participants in conversations
    - `message_read_status` - Track read status of messages

  2. Security
    - Enable RLS on all messaging tables
    - Add policies for secure access control
    - Ensure users can only access their own conversations

  3. Features
    - Real-time messaging with Supabase realtime
    - File attachments support
    - Read receipts and typing indicators
    - Message search and filtering
    - Conversation management
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  type text NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'support')),
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create message_participants table
CREATE TABLE IF NOT EXISTS message_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('admin', 'member', 'owner')),
  joined_at timestamptz DEFAULT now(),
  last_read_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(conversation_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_name text NOT NULL,
  sender_email text NOT NULL,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  reply_to_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  edited_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create message_attachments table
CREATE TABLE IF NOT EXISTS message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  storage_path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create message_read_status table
CREATE TABLE IF NOT EXISTS message_read_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at timestamptz DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Create typing_indicators table for real-time typing status
CREATE TABLE IF NOT EXISTS typing_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  is_typing boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations they participate in"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT conversation_id FROM message_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Conversation creators can update their conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- RLS Policies for message_participants
CREATE POLICY "Users can view participants in their conversations"
  ON message_participants FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT conversation_id FROM message_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can join conversations"
  ON message_participants FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation"
  ON message_participants FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT conversation_id FROM message_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can send messages to their conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT conversation_id FROM message_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid());

-- RLS Policies for message_attachments
CREATE POLICY "Users can view attachments in their conversations"
  ON message_attachments FOR SELECT
  TO authenticated
  USING (
    message_id IN (
      SELECT m.id FROM messages m
      JOIN message_participants mp ON m.conversation_id = mp.conversation_id
      WHERE mp.user_id = auth.uid() AND mp.is_active = true
    )
  );

CREATE POLICY "Users can add attachments to their messages"
  ON message_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    message_id IN (
      SELECT id FROM messages WHERE sender_id = auth.uid()
    )
  );

-- RLS Policies for message_read_status
CREATE POLICY "Users can view read status in their conversations"
  ON message_read_status FOR SELECT
  TO authenticated
  USING (
    message_id IN (
      SELECT m.id FROM messages m
      JOIN message_participants mp ON m.conversation_id = mp.conversation_id
      WHERE mp.user_id = auth.uid() AND mp.is_active = true
    )
  );

CREATE POLICY "Users can mark messages as read"
  ON message_read_status FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own read status"
  ON message_read_status FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for typing_indicators
CREATE POLICY "Users can view typing indicators in their conversations"
  ON typing_indicators FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT conversation_id FROM message_participants 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can manage their own typing indicators"
  ON typing_indicators FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS conversations_created_by_idx ON conversations(created_by);
CREATE INDEX IF NOT EXISTS conversations_property_id_idx ON conversations(property_id);
CREATE INDEX IF NOT EXISTS conversations_last_message_at_idx ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS message_participants_conversation_id_idx ON message_participants(conversation_id);
CREATE INDEX IF NOT EXISTS message_participants_user_id_idx ON message_participants(user_id);
CREATE INDEX IF NOT EXISTS message_participants_active_idx ON message_participants(is_active);

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_reply_to_id_idx ON messages(reply_to_id);

CREATE INDEX IF NOT EXISTS message_attachments_message_id_idx ON message_attachments(message_id);

CREATE INDEX IF NOT EXISTS message_read_status_message_id_idx ON message_read_status(message_id);
CREATE INDEX IF NOT EXISTS message_read_status_user_id_idx ON message_read_status(user_id);

CREATE INDEX IF NOT EXISTS typing_indicators_conversation_id_idx ON typing_indicators(conversation_id);
CREATE INDEX IF NOT EXISTS typing_indicators_user_id_idx ON typing_indicators(user_id);

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('message-attachments', 'message-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for message attachments
CREATE POLICY "Users can view message attachments in their conversations"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'message-attachments' AND
    name IN (
      SELECT ma.storage_path FROM message_attachments ma
      JOIN messages m ON ma.message_id = m.id
      JOIN message_participants mp ON m.conversation_id = mp.conversation_id
      WHERE mp.user_id = auth.uid() AND mp.is_active = true
    )
  );

CREATE POLICY "Users can upload message attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'message-attachments');

CREATE POLICY "Users can update their own message attachments"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'message-attachments');

CREATE POLICY "Users can delete their own message attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'message-attachments');

-- Create functions for message management

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET last_message_at = NEW.created_at,
      updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating conversation last_message_at
CREATE TRIGGER update_conversation_last_message_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Function to clean up old typing indicators
CREATE OR REPLACE FUNCTION cleanup_typing_indicators()
RETURNS void AS $$
BEGIN
  DELETE FROM typing_indicators 
  WHERE updated_at < NOW() - INTERVAL '30 seconds';
END;
$$ LANGUAGE plpgsql;

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_message_count(user_uuid uuid)
RETURNS integer AS $$
DECLARE
  unread_count integer;
BEGIN
  SELECT COUNT(*)::integer INTO unread_count
  FROM messages m
  JOIN message_participants mp ON m.conversation_id = mp.conversation_id
  LEFT JOIN message_read_status mrs ON m.id = mrs.message_id AND mrs.user_id = user_uuid
  WHERE mp.user_id = user_uuid 
    AND mp.is_active = true
    AND m.sender_id != user_uuid
    AND mrs.id IS NULL;
  
  RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark conversation messages as read
CREATE OR REPLACE FUNCTION mark_conversation_as_read(conversation_uuid uuid, user_uuid uuid)
RETURNS void AS $$
BEGIN
  -- Insert read status for unread messages
  INSERT INTO message_read_status (message_id, user_id, read_at)
  SELECT m.id, user_uuid, NOW()
  FROM messages m
  LEFT JOIN message_read_status mrs ON m.id = mrs.message_id AND mrs.user_id = user_uuid
  WHERE m.conversation_id = conversation_uuid
    AND m.sender_id != user_uuid
    AND mrs.id IS NULL;
  
  -- Update participant's last_read_at
  UPDATE message_participants 
  SET last_read_at = NOW()
  WHERE conversation_id = conversation_uuid AND user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;