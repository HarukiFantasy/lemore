import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Bell, MessageCircle, Heart, User, Settings } from "lucide-react";
import { Button } from "~/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { Badge } from "~/common/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { AnimatedList } from "../../../../components/magicui/animated-list";
import type { Notification } from "../schema";

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: '새로운 메시지',
    message: 'Sarah님이 당신에게 메시지를 보냈습니다.',
    timestamp: '2분 전',
    isRead: false,
    avatar: 'https://github.com/shadcn.png',
    username: 'Sarah'
  },
  {
    id: '2',
    type: 'like',
    title: '좋아요',
    message: 'Mike님이 당신의 게시물을 좋아합니다.',
    timestamp: '5분 전',
    isRead: false,
    avatar: 'https://github.com/mike.png',
    username: 'Mike'
  },
  {
    id: '3',
    type: 'follow',
    title: '새 팔로워',
    message: 'Emma님이 당신을 팔로우하기 시작했습니다.',
    timestamp: '10분 전',
    isRead: true,
    avatar: 'https://github.com/emma.png',
    username: 'Emma'
  },
  {
    id: '4',
    type: 'system',
    title: '시스템 알림',
    message: '새로운 기능이 추가되었습니다. 확인해보세요!',
    timestamp: '1시간 전',
    isRead: true
  },
  {
    id: '5',
    type: 'message',
    title: '새로운 메시지',
    message: 'John님이 당신에게 메시지를 보냈습니다.',
    timestamp: '2시간 전',
    isRead: true,
    avatar: 'https://github.com/john.png',
    username: 'John'
  }
];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'message':
      return <MessageCircle className="w-4 h-4 text-blue-500" />;
    case 'like':
      return <Heart className="w-4 h-4 text-red-500" />;
    case 'follow':
      return <User className="w-4 h-4 text-green-500" />;
    case 'system':
      return <Bell className="w-4 h-4 text-purple-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

interface NotificationsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPage({ isOpen, onClose }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadNotifications = notifications.filter(notification => !notification.isRead);
  const unreadCount = unreadNotifications.length;

  const markAsRead = (id: string) => {
    // 애니메이션을 위해 먼저 알림을 제거
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
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
                <h2 className="text-xl font-semibold">읽지 않은 알림</h2>
                <p className="text-sm text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount}개의 새 알림` : '모든 알림을 확인했습니다'}
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
                  모두 읽음으로 표시
                </Button>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {unreadNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <Bell className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    읽지 않은 알림이 없습니다
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    모든 알림을 확인했습니다.
                  </p>
                </div>
              ) : (
                <AnimatedList className="p-4 space-y-3" delay={200}>
                  {unreadNotifications.map((notification: Notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100, scale: 0.8 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      layout
                    >
                                             <Card 
                         className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${
                           'bg-blue-50 border-blue-200 hover:bg-blue-100'
                         }`}
                         onClick={() => markAsRead(notification.id)}
                       >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            {notification.avatar ? (
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={notification.avatar} />
                                <AvatarFallback>
                                  {notification.username?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                {getNotificationIcon(notification.type)}
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-foreground mb-1">
                                    {notification.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {notification.message}
                                  </p>
                                                                     <div className="flex items-center justify-between">
                                     <span className="text-xs text-muted-foreground">
                                       {notification.timestamp}
                                     </span>
                                     {!notification.isRead && (
                                       <div className="flex items-center space-x-2">
                                         <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                         <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                           새
                                         </Badge>
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
