import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Boxes,
  TrendingUp,
  Settings,
  Store,
  ExternalLink,
} from 'lucide-react';

export type ActiveTab = 'overview' | 'products' | 'orders' | 'inventory' | 'analytics' | 'api_settings';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingOrdersCount: number;
  expiringItemsCount: number;
}

export const DesktopSidebar: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pendingOrdersCount,
  expiringItemsCount,
}) => {
  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }> = [
    { id: 'overview', label: 'الرئيسية والنشاط الحي', icon: LayoutDashboard },
    { id: 'products', label: 'إدارة المنتجات', icon: Package },
    {
      id: 'orders',
      label: 'الطلبات المباشرة',
      icon: ShoppingBag,
      badge: pendingOrdersCount,
      badgeColor: 'bg-[#9e3d50] text-white',
    },
    {
      id: 'inventory',
      label: 'المخزون وتتبع الصلاحية',
      icon: Boxes,
      badge: expiringItemsCount,
      badgeColor: 'bg-[#ba1a1a] text-white',
    },
    { id: 'analytics', label: 'تحليلات المبيعات والنقر', icon: TrendingUp },
    { id: 'api_settings', label: 'ربط النظام والـ API', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#f8f2ef] border-l border-[#e7e1de] flex-col justify-between py-6 px-4 hidden lg:flex shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold text-[#82746e] px-3 mb-2 tracking-wider">
          قوائم التحكم الإدارية
        </span>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#43271a] text-[#fef8f4] shadow-sm'
                  : 'text-[#50443f] hover:bg-[#ede7e3] hover:text-[#1d1b19]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#ffdbcc]' : 'text-[#82746e]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums ${
                    isActive ? 'bg-[#ffdbcc] text-[#43271a]' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Footer Storefront Link card */}
      <div className="bg-[#f3ede9] p-3.5 rounded-2xl border border-[#d4c3bc]/40 flex flex-col gap-2 mt-auto">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-[#9e3d50]" />
          <span className="text-xs font-bold text-[#43271a]">المتجر الإلكتروني المباشر</span>
        </div>
        <p className="text-[11px] text-[#766e69] leading-relaxed">
          متجر الزبائن مربوط بالبيانات الحية لقوالب ومستلزمات الحلويات.
        </p>
        <a
          href="https://eljawhara-omega.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#43271a] text-[#ffdbcc] text-xs font-medium hover:bg-[#5c3d2e] transition-colors"
        >
          <span>زيارة المتجر الأول</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </aside>
  );
};

export const MobileBottomNav: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pendingOrdersCount,
  expiringItemsCount,
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#fef8f4]/95 backdrop-blur-xl border-t border-[#e7e1de] lg:hidden shadow-[0_-6px_24px_-2px_rgba(92,61,46,0.08)] pb-safe">
      <div className="flex justify-around items-center h-16 px-1 max-w-md mx-auto">
        {/* Storefront External link */}
        <a
          href="https://eljawhara-omega.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-0.5 min-w-[54px] py-1 text-[#82746e] hover:text-[#43271a] transition-colors"
        >
          <Store className="w-5 h-5" />
          <span className="text-[11px] font-medium">المتجر</span>
        </a>

        {/* Overview Tab */}
        <button
          onClick={() => onTabChange('overview')}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[54px] py-1 transition-colors ${
            activeTab === 'overview' ? 'text-[#9e3d50] font-semibold' : 'text-[#82746e]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[11px]">الرئيسية</span>
        </button>

        {/* Products Tab */}
        <button
          onClick={() => onTabChange('products')}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[54px] py-1 transition-colors ${
            activeTab === 'products' ? 'text-[#9e3d50] font-semibold' : 'text-[#82746e]'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[11px]">المنتجات</span>
        </button>

        {/* Orders Tab */}
        <button
          onClick={() => onTabChange('orders')}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[54px] py-1 relative transition-colors ${
            activeTab === 'orders' ? 'text-[#9e3d50] font-semibold' : 'text-[#82746e]'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[11px]">الطلبات</span>
          {pendingOrdersCount > 0 && (
            <span className="absolute top-1 left-2 w-4 h-4 bg-[#9e3d50] text-white rounded-full text-[9px] font-bold flex items-center justify-center tabular-nums">
              {pendingOrdersCount}
            </span>
          )}
        </button>

        {/* Inventory / Expiry Tab */}
        <button
          onClick={() => onTabChange('inventory')}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[54px] py-1 relative transition-colors ${
            activeTab === 'inventory' ? 'text-[#9e3d50] font-semibold' : 'text-[#82746e]'
          }`}
        >
          <Boxes className="w-5 h-5" />
          <span className="text-[11px]">المخزون</span>
          {expiringItemsCount > 0 && (
            <span className="absolute top-1 left-2 w-4 h-4 bg-[#ba1a1a] text-white rounded-full text-[9px] font-bold flex items-center justify-center tabular-nums">
              {expiringItemsCount}
            </span>
          )}
        </button>

        {/* API Settings */}
        <button
          onClick={() => onTabChange('api_settings')}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[54px] py-1 transition-colors ${
            activeTab === 'api_settings' ? 'text-[#9e3d50] font-semibold' : 'text-[#82746e]'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[11px]">الربط</span>
        </button>
      </div>
    </nav>
  );
};
