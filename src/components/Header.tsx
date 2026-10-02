import React from 'react';
import {
  Store,
  Bell,
  Plus,
  ExternalLink,
  ChefHat,
  AlertTriangle,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { ExpiryAlert } from '../types';

interface HeaderProps {
  onOpenAddProduct: () => void;
  onOpenNotifications: () => void;
  expiryAlerts: ExpiryAlert[];
  unreadAlertsCount: number;
  onRefresh: () => void;
  isRefreshing: boolean;
  onSignOut: () => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddProduct,
  onOpenNotifications,
  expiryAlerts,
  unreadAlertsCount,
  onRefresh,
  isRefreshing,
  onSignOut,
}) => {
  const criticalCount = expiryAlerts.filter((a) => a.status === 'critical' || a.status === 'expired').length;

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-[#fef8f4]/90 backdrop-blur-xl border-b border-[#e7e1de] shadow-[0_4px_20px_-2px_rgba(92,61,46,0.06)]">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Brand Zone: Clean, authentic bakery admin title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[#43271a] flex items-center justify-center text-[#ffdbcc] shrink-0 shadow-sm">
            <ChefHat className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-[#43271a] truncate leading-tight">
                فنون الحلويات
              </h1>
              <span className="text-xs text-[#9e3d50] font-medium hidden sm:inline">
                · Baking & Pastry
              </span>
            </div>
            <span className="text-xs text-[#82746e] truncate font-normal">
              لوحة التحكم الإدارية (Admin Dashboard)
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => void onSignOut()}
            title="تسجيل الخروج"
            aria-label="تسجيل الخروج"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#43271a] hover:bg-[#ffdbcc]/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            title="تحديث البيانات"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#43271a] hover:bg-[#ffdbcc]/40 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Visit Storefront link */}
          <a
            href="https://eljawhara-omega.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#d4c3bc] text-xs font-medium text-[#43271a] hover:bg-[#f3ede9] transition-colors"
            title="فتح متجر الزبائن في نافذة جديدة"
          >
            <Store className="w-3.5 h-3.5 text-[#9e3d50]" />
            <span>عرض المتجر</span>
            <ExternalLink className="w-3 h-3 text-[#82746e]" />
          </a>

          {/* Quick Add Product Button */}
          <button
            onClick={onOpenAddProduct}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#43271a] text-[#fef8f4] text-xs sm:text-sm font-medium shadow-sm hover:bg-[#5c3d2e] active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة منتج</span>
            <span className="sm:hidden">إضافة</span>
          </button>

          {/* Expiry Alerts & Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            aria-label="تنبيهات الصلاحية والطلبات"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#43271a] relative hover:bg-[#ffd9dd]/60 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {criticalCount > 0 ? (
              <span className="absolute top-1 left-1 w-4 h-4 bg-[#ba1a1a] text-white rounded-full text-[10px] font-bold flex items-center justify-center tabular-nums shadow-sm animate-pulse">
                {criticalCount}
              </span>
            ) : unreadAlertsCount > 0 ? (
              <span className="absolute top-1 left-1 w-4 h-4 bg-[#9e3d50] text-white rounded-full text-[10px] font-bold flex items-center justify-center tabular-nums">
                {unreadAlertsCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
};
