import type { ActionFunction } from 'react-router';
import { makeSSRClient } from '~/supa-client';
import { getLoggedInUserId } from '~/features/users/queries';
import { seeNotification } from '~/features/users/mutations';

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { notificationId } = params;
  if (!notificationId) {
    return new Response('Notification ID is required', { status: 400 });
  }

  try {
    const { client } = makeSSRClient(request);
    const userId = await getLoggedInUserId(client);
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    await seeNotification(client, { userId, notificationId });
    
    return { ok: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return new Response('Internal server error', { status: 500 });
  }
}; 