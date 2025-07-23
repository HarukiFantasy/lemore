import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Bell, MessageCircle, Heart, User, Check } from "lucide-react";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { AnimatedList } from "../../../../components/magicui/animated-list";
import { z } from "zod";
import { makeSSRClient } from '~/supa-client';
import type { LoaderFunction } from 'react-router';
import { useFetcher } from 'react-router';
import { getNotifications, getLoggedInUserId } from '~/features/users/queries';
import { DateTime } from 'luxon';

// Notification schemas for data validation
export const notificationFiltersSchema = z.object({
  type: z.enum(["all", "message", "sale", "review", "system"]).optional(),
  unreadOnly: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(20),
  page: z.number().min(1).default(1),
});

export const notificationSchema = z.object({
  notification_id: z.number(),
  type: z.enum(["message", "sale", "review", "system"]),
  title: z.string(),
  content: z.string(),
  timestamp: z.string(),
  isRead: z.boolean(),
  avatar: z.string().optional(),
  avatarFallback: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  actions: z.array(z.object({
    label: z.string(),
    action: z.string(),
    variant: z.enum(["default", "outline", "destructive"]),
  })).optional(),
});

export const notificationListSchema = z.object({
  notifications: z.array(notificationSchema),
  totalCount: z.number(),
  unreadCount: z.number(),
  hasMore: z.boolean(),
  filters: z.object({
    type: z.enum(["all", "message", "sale", "review", "system"]),
    unreadOnly: z.boolean(),
    limit: z.number(),
    page: z.number(),
  }).optional(),
});

export type Notification = z.infer<typeof notificationSchema>;

export interface NotificationsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'message':
      return <MessageCircle className="w-4 h-4 text-blue-500" />;
    case 'sale':
      return <Heart className="w-4 h-4 text-red-500" />;
    case 'review':
      return <User className="w-4 h-4 text-green-500" />;
    case 'system':
      return <Bell className="w-4 h-4 text-purple-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

export const loader: LoaderFunction = async ({ request }) => {
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  
  // 현재 인증된 사용자 정보도 확인
  const { data: { user } } = await client.auth.getUser();
  
  const notifications = (await getNotifications(client, { userId })) ?? [];
  
  // 데이터베이스에서 직접 확인
  const { data: allNotifications, error: dbError } = await client
    .from('user_notifications')
    .select('*')
    .eq('receiver_id', userId);
  
  return { notifications };
};



function NotificationCard({ notification, onMarkAsRead }: { notification: Notification; onMarkAsRead?: (id: number) => void }) {
  const fetcher = useFetcher();
  const optimisticSeen = fetcher.state === 'idle' ? notification.isRead : true;
  
  // Handle successful mark as read
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.ok && onMarkAsRead) {
      onMarkAsRead(notification.notification_id);
    }
  }, [fetcher.state, fetcher.data, notification.notification_id, onMarkAsRead]);
  
  // Luxon을 사용한 간단한 날짜 포맷팅
  const formatDate = (timestamp: string) => {
    // UTC 시간을 사용자의 로컬 시간대로 변환
    const notificationTime = DateTime.fromISO(timestamp, { zone: 'utc' }).toLocal();
    return notificationTime.toRelative();
  };
  
  return (
    <motion.div
      key={notification.notification_id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      layout
    >
      <Card
        className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${optimisticSeen ? '' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {notification.avatar ? (
              <Avatar className="w-10 h-10">
                <AvatarImage src={notification.avatar} />
                <AvatarFallback>{notification.avatarFallback}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                {getNotificationIcon(notification.type)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground mb-1">{notification.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{notification.content}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{formatDate(notification.timestamp)}</span>
                    {!optimisticSeen && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">New</Badge>
                        <fetcher.Form method="post" action={`/my/notifications/${notification.notification_id}/see`}>
                          <Button variant="outline" size="icon">
                            <Check className="w-4 h-4" />
                          </Button>
                        </fetcher.Form>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function NotificationsPage({ isOpen, onClose }: NotificationsPageProps) {
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 사이드바가 열릴 때 데이터 로드
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // 현재 페이지의 loader 데이터를 사용
      const response = await fetch('/my/notifications', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setLocalNotifications(data.notifications || []);
      } else {
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const unreadNotifications = localNotifications.filter((notification: Notification) => !notification.isRead);
  const unreadCount = unreadNotifications.length;

  const markAsRead = (id: number) => {
    setLocalNotifications((prev: Notification[]) =>
      prev.map((notification: Notification) =>
        notification.notification_id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setLocalNotifications((prev: Notification[]) =>
      prev.map((notification: Notification) => ({ ...notification, isRead: true }))
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 md:w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Bell className="w-6 h-6 text-primary" />
                    {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    )}
                </div>
              <div>
                <h2 className="text-xl font-semibold">Notifications</h2>
                <p className="text-sm text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} new notifications` : 'All notifications checked'}
                  <br />
                  <span className="text-xs text-muted-foreground">Recent 1 week</span>
                </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Actions */}
            {unreadCount > 0 && (
              <div className="p-4 border-b bg-gray-50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="w-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  Mark All as Read
                </Button>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading notifications...</p>
                </div>
              ) : unreadNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <Bell className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No unread notifications
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No unread notifications in the last week.
                  </p>
                </div>
              ) : (
                <AnimatedList className="p-4 space-y-3" delay={200}>
                  {unreadNotifications.map((notification: Notification) => (
                    <NotificationCard 
                      key={notification.notification_id} 
                      notification={notification} 
                      onMarkAsRead={markAsRead}
                    />
                  ))}
                </AnimatedList>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
