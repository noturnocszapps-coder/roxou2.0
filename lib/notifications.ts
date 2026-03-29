import { createClient } from "./supabase/client";

export type NotificationType = 'INTEREST' | 'CHOSEN' | 'STATUS_CHANGE' | 'CHAT';

interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
}

export async function sendNotification({
  userId,
  type,
  title,
  body,
  data = {}
}: SendNotificationParams) {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        body,
        data,
        is_read: false,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error inserting notification:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error sending notification:', err);
    return { success: false, error: err };
  }
}

export async function markAsRead(notificationId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
  
  if (error) console.error('Error marking notification as read:', error);
}

export async function markAllAsRead(userId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  
  if (error) console.error('Error marking all notifications as read:', error);
}
