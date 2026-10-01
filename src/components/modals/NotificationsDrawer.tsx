import React from 'react';
import { X, AlertTriangle, Clock, Package, Boxes, ExternalLink } from 'lucide-react';
import { ExpiryAlert, Order } from '../../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  expiryAlerts: ExpiryAlert[];
  pendingOrders: Order[];
  onSelectOrder: (order: Order) => void;
  onSelectExpiryProduct: (productId: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  expiryAlerts,
  pendingOrders,
  onSelectOrder,
  onSelectExpiryProduct,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-2 sm:p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-[#fef8f4] w-full max-w-md h-full max-h-[95vh] rounded-3xl p-5 shadow-2xl border border-[#e7e1de] flex flex-col gap-4 text-[#1d1b19] overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e7e1de] pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#ffd9dd] text-[#9e3d50] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#43271a]">مركز التنبيهات وإدارة الصلاحية</h3>
              <p className="text-[11px] text-[#82746e]">تنبيهات استباقية لمواد الخبز والطلبات الجديدة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f3ede9] flex items-center justify-center text-[#82746e] hover:text-[#43271a]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Tabs / Scrollable list */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1">
          {/* Section 1: Expiry Alerts */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#ba1a1a] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>تنبيهات قرب انتهاء الصلاحية ({expiryAlerts.length})</span>
              </span>
            </div>

            {expiryAlerts.length === 0 ? (
              <p className="text-xs text-[#82746e] bg-white p-3 rounded-xl border border-[#e7e1de]">
                لا توجد مواد تقترب صلاحيتها من الانتهاء حالياً، جميع مواد الخبز ممتازة.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {expiryAlerts.map((alert) => {
                  const isCritical = alert.status === 'critical' || alert.status === 'expired';
                  return (
                    <div
                      key={alert.productId}
                      className={`p-3 rounded-2xl border text-xs flex flex-col gap-1.5 transition-all ${
                        isCritical
                          ? 'bg-[#ffdad6]/40 border-[#ba1a1a]/30'
                          : 'bg-[#fff5ea] border-[#f5a623]/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-[#1d1b19]">{alert.productName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold tabular-nums text-[10px] shrink-0 ${
                            isCritical ? 'bg-[#ba1a1a] text-white' : 'bg-[#d97706] text-white'
                          }`}
                        >
                          {alert.daysRemaining <= 0
                            ? 'منتهي الصلاحية!'
                            : `متبقي ${alert.daysRemaining} يوم`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[#50443f] text-[11px] pt-1 border-t border-black/5">
                        <span>
                          تاريخ الانتهاء: <strong className="tabular-nums">{alert.expiryDate}</strong>
                        </span>
                        <span>
                          المخزون: <strong>{alert.stock} {alert.unit}</strong>
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          onSelectExpiryProduct(alert.productId);
                          onClose();
                        }}
                        className="mt-1 w-full py-1.5 rounded-xl bg-white hover:bg-[#ede7e3] text-[#43271a] font-medium text-[11px] border border-[#d4c3bc] transition-colors"
                      >
                        معاينة وتعديل المنتج أو عمل تخفيض
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Pending Orders */}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#e7e1de]">
            <span className="text-xs font-bold text-[#43271a] flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#9e3d50]" />
              <span>طلبات زبائن قيد المعالجة والتجهيز ({pendingOrders.length})</span>
            </span>

            {pendingOrders.length === 0 ? (
              <p className="text-xs text-[#82746e] bg-white p-3 rounded-xl border border-[#e7e1de]">
                تم تجهيز جميع الطلبات بنجاح.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => {
                      onSelectOrder(order);
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-white border border-[#e7e1de] hover:border-[#43271a] cursor-pointer flex flex-col gap-1 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#43271a] text-xs">#{order.id}</span>
                      <span className="font-bold text-[#9e3d50] text-xs tabular-nums">
                        {order.totalAmount} ر.س
                      </span>
                    </div>
                    <span className="text-xs text-[#1d1b19] font-medium">{order.customerName}</span>
                    <span className="text-[11px] text-[#82746e] truncate">{order.itemsSummary}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#e7e1de] shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#43271a] text-white text-xs font-medium hover:bg-[#5c3d2e]"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
