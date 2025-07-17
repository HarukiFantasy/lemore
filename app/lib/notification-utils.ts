// 알림 메시지 다국어 지원 유틸리티

export type NotificationKey = 
  |'new_message'
  | 'product_liked'
  | 'new_review'
  | 'tip_liked'  | 'welcome';

// 다국어 메시지 정의
const notificationMessages = {
  ko: {
    new_message: {
      title: '새 메시지',
      content: '{sender}님이 메시지를 보냈습니다'
    },
    product_liked: {
      title: '상품 좋아요',
      content: '{liker}님이 회원님의 상품을 좋아합니다'
    },
    new_review: {
      title: '새 리뷰',
      content: '{giver}님이 리뷰를 작성했습니다'
    },
    tip_liked: {
      title: '팁 좋아요',
      content: '{liker}님이 회원님의 로컬 팁을 좋아합니다'
    },
    welcome: {
      title: '환영합니다!',
      content: '레모어에 오신 것을 환영합니다. 다양한 기능을 탐험해보세요!'
    }
  },
  en: {
    new_message: {
      title: 'New Message',
      content: '{sender} sent you a message'
    },
    product_liked: {
      title: 'Product Liked',
      content: '{liker} liked your product'
    },
    new_review: {
      title: 'New Review',
      content: '{giver} wrote a review'
    },
    tip_liked: {
      title: 'Tip Liked',
      content: '{liker} liked your local tip'
    },
    welcome: {
      title: 'Welcome!',
      content: 'Welcome to Lemore! Explore our various features.'
    }
  }
};

// 사용자 언어 설정 (기본값: 한국어)
export const getUserLanguage = (): 'ko' | 'en' => {
  if (typeof window !== 'undefined') {
    const savedLang = localStorage.getItem('user-language');
    if (savedLang && (savedLang === 'ko' || savedLang === 'en')) {
      return savedLang;
    }
    
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'ko' ? 'ko' : 'en';
  }
  return 'ko'; // SSR 기본값
};

// 알림 메시지 생성 함수
export const getNotificationMessage = (
  notificationKey: NotificationKey,
  data: Record<string, any> = {},
  language?: 'ko' | 'en'
): { title: string; content: string } => {
  const lang = language || getUserLanguage();
  const messages = notificationMessages[lang];
  
  if (!messages || !messages[notificationKey]) {
    // 기본 영어 메시지로 폴백
    const fallbackMessages = notificationMessages.en;
    const message = fallbackMessages[notificationKey] || {
      title: 'Notification',
      content: 'You have a new notification'
    };
    
    return {
      title: message.title,
      content: message.content.replace(/\{(\w+)\}/g, (match, key) => {
        return data[key] || match;
      })
    };
  }
  
  const message = messages[notificationKey];
  
  return {
    title: message.title,
    content: message.content.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] || match;
    })
  };
};

// 알림 데이터에서 메시지 추출
export const extractNotificationMessage = (notification: any) => {
  const notificationKey = notification.metadata?.notification_key as NotificationKey;
  const data = notification.metadata || {};
  
  if (notificationKey) {
    return getNotificationMessage(notificationKey, data);
  }
  
  // 기존 방식 (하드코딩된 메시지 사용)
  return {
    title: notification.title || 'Notification',
    content: notification.content || 'You have a new notification'
  };
};

// 알림 아이콘 매핑
export const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'Message':
      return 'message-circle';
    case 'Like':
      return 'heart';
    case 'Reply':
      return 'message-square';
    case 'Mention':
      return 'bell';
    default:
      return 'bell';
  }
};

// 알림 타입별 색상
export const getNotificationColor = (type: string) => {
  switch (type) {
    case 'Message':
      return 'blue';
    case 'Like':
      return 'red';
    case 'Reply':
      return 'green';
    case 'Mention':
      return 'purple';
    default:
      return 'gray';
  }
}; 