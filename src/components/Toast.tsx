import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastData {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const bgStyles =
    toast.type === 'error'
      ? 'bg-[#ba1a1a] text-white'
      : toast.type === 'info'
      ? 'bg-[#43271a] text-[#fef8f4]'
      : 'bg-[#1b322a] text-[#ffffff]';

  const icon =
    toast.type === 'error' ? (
      <AlertCircle className="w-5 h-5 text-[#ffdad6]" />
    ) : toast.type === 'info' ? (
      <Info className="w-5 h-5 text-[#ffdbcc]" />
    ) : (
      <CheckCircle2 className="w-5 h-5 text-[#cde9dc]" />
    );

  return (
    <div className="fixed top-20 inset-x-4 max-w-lg mx-auto z-50 pointer-events-auto transition-all duration-300">
      <div
        className={`flex items-center justify-between p-3.5 rounded-2xl shadow-xl ${bgStyles} border border-white/10`}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-sm font-medium leading-tight">{toast.message}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-75">الآن</span>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
