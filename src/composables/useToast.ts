// src/composables/useToast.ts
import { toastController } from '@ionic/vue';

interface ToastOptions {
  message: string;
  color?: 'success' | 'warning' | 'danger' | 'primary';
  duration?: number;
  position?: 'top' | 'bottom' | 'middle';
}

export function useToast() {
  const showToast = async (
    message: string,
    color: ToastOptions['color'] = 'primary',
    duration: number = 2000,
    position: ToastOptions['position'] = 'bottom'
  ) => {
    const toast = await toastController.create({
      message,
      duration,
      color,
      position,
    });

    await toast.present();
  };

  return {
    showToast,
  };
}
