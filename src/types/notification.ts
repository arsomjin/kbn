export enum NotificationType {
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error'
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  read: boolean;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  } | string;
  imageUrl?: string;
  link?: string;
  data?: Record<string, any>;
} 