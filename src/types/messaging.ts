import type { Property } from './index';

// Messaging system types
export interface Conversation {
  id: string;
  title?: string;
  type: 'direct' | 'group' | 'support';
  property_id?: string;
  created_by: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  property?: Property;
  participants?: MessageParticipant[];
  last_message?: Message;
  unread_count?: number;
}

export interface MessageParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'admin' | 'member' | 'owner';
  joined_at: string;
  last_read_at: string;
  is_active: boolean;
  user_name?: string;
  user_email?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id?: string;
  sender_name: string;
  sender_email: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  reply_to_id?: string;
  edited_at?: string;
  created_at: string;
  attachments?: MessageAttachment[];
  reply_to?: Message;
  read_by?: MessageReadStatus[];
  is_read?: boolean;
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
}

export interface MessageReadStatus {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
}

export interface TypingIndicator {
  id: string;
  conversation_id: string;
  user_id: string;
  user_name: string;
  is_typing: boolean;
  updated_at: string;
}

export interface MessageForm {
  content: string;
  message_type?: 'text' | 'image' | 'file';
  reply_to_id?: string;
  attachments?: File[];
}

export interface ConversationForm {
  title?: string;
  type: 'direct' | 'group' | 'support';
  property_id?: string;
  participant_emails: string[];
  initial_message?: string;
}

// Message filters and pagination
export interface MessageFilters {
  search?: string;
  message_type?: string;
  sender_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface ConversationFilters {
  type?: string;
  property_id?: string;
  has_unread?: boolean;
  participant_id?: string;
}

// Real-time events
export interface MessageEvent {
  type: 'message_sent' | 'message_read' | 'typing_start' | 'typing_stop' | 'participant_joined' | 'participant_left';
  conversation_id: string;
  user_id: string;
  data?: any;
}

// Notification types
export interface MessageNotification {
  id: string;
  conversation_id: string;
  message_id: string;
  sender_name: string;
  content: string;
  property_title?: string;
  created_at: string;
  is_read: boolean;
}