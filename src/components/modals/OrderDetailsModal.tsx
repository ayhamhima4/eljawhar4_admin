import React, { useState } from 'react';
import {
  X,
  Printer,
  CheckCircle,
  Truck,
  Clock,
  XCircle,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  ChefHat,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
  onUpdateStatus,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !order) return null;

  const handleStatusChange = async (status: OrderStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(order.id, status);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'processing':
        return (
          <span className="px-2.5 py-1 rounded-full bg-[#ffdbcc] text-[#43271a] font-semibold text-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#43271a] animate-ping" />
            قيد التجهيز
          </span>
        );
      case 'shipped':
        return (
          <span className="px-2.5 py-1 rounded-full bg-[#e7e1de] text-[#43271a] font-semibold text-xs flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#5c3d2e]" />
            تم الشحن
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full bg-[#cde9dc] text-[#1b322a] font-semibold text-xs flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-[#1b322a]" />
            مكتمل وتم التسليم
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full bg-[#ffdad6] text-[#ba1a1a] font-semibold text-xs flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-[#ba1a1a]" />
            ملغي
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="bg-[#fef8f4] w-full max-w-xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#e7e1de] flex flex-col gap-5 text-[#1d1b19] max-h-[92vh] overflow-y-auto"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e7e1de] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#43271a] text-[#ffdbcc] flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#43271a]">
                  تفاصيل الطلب #{order.id}
                </h3>
                {getStatusBadge(order.status)}
              </div>
              <span className="text-xs text-[#82746e]">
                {new Date(order.createdAt).toLocaleString('ar-SA')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f3ede9] flex items-center justify-center text-[#82746e] hover:text-[#43271a]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Customer Information Box */}
        <div className="bg-[#f3ede9] p-4 rounded-2xl border border-[#d4c3bc]/40 flex flex-col gap-2">
          <span className="text-xs font-bold text-[#43271a] mb-1">بيانات العميل والشحن</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#50443f]">
              <span className="font-semibold text-[#1d1b19]">{order.customerName}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ffdbcc] text-[#43271a]">
                {order.customerType}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[#50443f]">
              <Phone className="w-3.5 h-3.5 text-[#82746e]" />
              <span dir="ltr" className="font-mono text-left">{order.customerPhone}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#50443f]">
              <MapPin className="w-3.5 h-3.5 text-[#82746e]" />
              <span>{order.customerCity} - {order.shippingAddress}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#50443f]">
              <CreditCard className="w-3.5 h-3.5 text-[#82746e]" />
              <span>طريقة الدفع: {order.paymentMethod} ({order.paymentStatus === 'paid' ? 'مدفوع' : 'معلق'})</span>
            </div>
          </div>
          {order.notes && (
            <div className="mt-1 pt-2 border-t border-[#d4c3bc]/40 text-xs text-[#9e3d50]">
              <span className="font-semibold">ملاحظات العميل: </span>
              <span>{order.notes}</span>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-[#43271a]">المستلزمات المطلوبة ({order.items.length})</span>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#e7e1de] text-xs"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-[#1d1b19]">{item.productName}</span>
                  <span className="text-[#82746e]">
                    الكمية: {item.quantity} {item.unit} × {item.price} ر.س
                  </span>
                </div>
                <span className="font-bold text-[#43271a] text-sm tabular-nums">
                  {item.quantity * item.price} ر.س
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total calculation */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#e7e1de] flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between text-[#82746e]">
            <span>المجموع الفرعي:</span>
            <span className="tabular-nums font-medium">{order.totalAmount} ر.س</span>
          </div>
          <div className="flex justify-between text-[#82746e]">
            <span>رسوم الشحن والتوصيل:</span>
            <span className="tabular-nums font-medium">
              {order.shippingFee > 0 ? `${order.shippingFee} ر.س` : 'شحن مجاني'}
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold text-[#43271a] pt-2 border-t border-[#e7e1de]">
            <span>إجمالي الفاتورة:</span>
            <span className="text-base tabular-nums">{order.totalAmount + order.shippingFee} ر.س</span>
          </div>
        </div>

        {/* Change status actions */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-[#50443f]">تغيير حالة الطلب الحية:</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => handleStatusChange('processing')}
              disabled={isUpdating || order.status === 'processing'}
              className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all ${
                order.status === 'processing'
                  ? 'bg-[#ffdbcc] text-[#43271a] font-bold border border-[#43271a]'
                  : 'bg-white border border-[#d4c3bc] text-[#50443f] hover:bg-[#ffdbcc]/40'
              }`}
            >
              قيد التجهيز
            </button>
            <button
              onClick={() => handleStatusChange('shipped')}
              disabled={isUpdating || order.status === 'shipped'}
              className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all ${
                order.status === 'shipped'
                  ? 'bg-[#5c3d2e] text-white font-bold'
                  : 'bg-white border border-[#d4c3bc] text-[#50443f] hover:bg-[#5c3d2e]/10'
              }`}
            >
              تم الشحن
            </button>
            <button
              onClick={() => handleStatusChange('delivered')}
              disabled={isUpdating || order.status === 'delivered'}
              className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all ${
                order.status === 'delivered'
                  ? 'bg-[#1b322a] text-[#ffffff] font-bold'
                  : 'bg-white border border-[#d4c3bc] text-[#50443f] hover:bg-[#1b322a]/10'
              }`}
            >
              تم التوصيل
            </button>
            <button
              onClick={() => handleStatusChange('cancelled')}
              disabled={isUpdating || order.status === 'cancelled'}
              className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all ${
                order.status === 'cancelled'
                  ? 'bg-[#ba1a1a] text-white font-bold'
                  : 'bg-white border border-[#d4c3bc] text-[#50443f] hover:bg-[#ba1a1a]/10'
              }`}
            >
              إلغاء الطلب
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#e7e1de]">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#d4c3bc] text-xs font-medium text-[#43271a] hover:bg-[#ede7e3] transition-colors"
          >
            <Printer className="w-4 h-4 text-[#82746e]" />
            <span>طباعة بوليصة الشحن</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#43271a] text-white text-xs font-semibold hover:bg-[#5c3d2e]"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
