import { ref } from 'vue';

export type ToastType = 'error' | 'success' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

const toasts = ref<ToastItem[]>([]);
let counter = 0;

export function useToast() {
  function showToast(
    optionsOrMessage: string | (Omit<ToastItem, 'id'> & { id?: string }),
    fallbackType: ToastType = 'info'
  ): string {
    const id = `toast-${Date.now()}-${++counter}`;

    let item: ToastItem;
    if (typeof optionsOrMessage === 'string') {
      item = {
        id,
        message: optionsOrMessage,
        type: fallbackType,
        duration: 5000,
      };
    } else {
      item = {
        ...optionsOrMessage,
        id: optionsOrMessage.id || id,
        duration: optionsOrMessage.duration !== undefined ? optionsOrMessage.duration : 5000,
      };
    }

    toasts.value.push(item);

    if (item.duration && item.duration > 0) {
      setTimeout(() => {
        removeToast(item.id);
      }, item.duration);
    }

    return item.id;
  }

  function removeToast(id: string) {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  }

  function clearAllToasts() {
    toasts.value = [];
  }

  return {
    toasts,
    showToast,
    removeToast,
    clearAllToasts,
  };
}

// Global convenience helper
export const toast = {
  error(message: string, options?: Partial<ToastItem>) {
    return useToast().showToast({
      message,
      type: 'error',
      title: options?.title || 'Ошибка загрузки',
      ...options,
    });
  },
  success(message: string, options?: Partial<ToastItem>) {
    return useToast().showToast({
      message,
      type: 'success',
      title: options?.title || 'Успешно',
      ...options,
    });
  },
  warning(message: string, options?: Partial<ToastItem>) {
    return useToast().showToast({
      message,
      type: 'warning',
      title: options?.title || 'Внимание',
      ...options,
    });
  },
  info(message: string, options?: Partial<ToastItem>) {
    return useToast().showToast({
      message,
      type: 'info',
      title: options?.title || 'Информация',
      ...options,
    });
  },
};
