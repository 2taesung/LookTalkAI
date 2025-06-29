import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Toast, ToastProps } from './ui/Toast';

interface ToastContextType {
  showToast: (props: Omit<ToastProps, 'onClose'>) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(ToastProps & { id: number }) | null>(null);

  const showToast = (props: Omit<ToastProps, 'onClose'>) => {
    setToast({ ...props, id: Date.now(), onClose: hideToast });
  };

  const hideToast = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && <Toast {...toast} onClose={hideToast} />}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}