import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/supa-client';

export const seeNotification = async (
  client: SupabaseClient<Database>,
  { userId, notificationId }: { userId: string; notificationId: string | number }
) => {
  const id = typeof notificationId === 'string' ? parseInt(notificationId, 10) : notificationId;
  const { error } = await client
    .from('user_notifications')
    .update({ 
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('notification_id', id)
    .eq('receiver_id', userId);
  if (error) throw error;
};

export const updateUserAvatar = async (
  client: SupabaseClient<Database>,
  {
    id,
    avatarUrl,
  }: {
    id: string;
    avatarUrl: string;
  }
) => {
  const { error } = await client
    .from("user_profiles")
    .update({ avatar_url: avatarUrl })
    .eq("profile_id", id);
  if (error) {
    throw error;
  }
}; 