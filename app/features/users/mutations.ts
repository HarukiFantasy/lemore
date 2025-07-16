import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/supa-client';

export const seeNotification = async (
  client: SupabaseClient<Database>,
  { userId, notificationId }: { userId: string; notificationId: string | number }
) => {
  const id = typeof notificationId === 'string' ? parseInt(notificationId, 10) : notificationId;
  const { error } = await client
    .from('user_notifications')
    .update({ is_read: true })
    .eq('notification_id', id)
    .eq('receiver_id', userId);
  if (error) throw error;
}; 