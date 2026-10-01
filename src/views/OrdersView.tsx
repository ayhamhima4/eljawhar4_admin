import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  MapPin,
  Eye,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrdersViewProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onSelectOrder,
  onUpdateStatus,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchSearch =
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerPhone.includes(searchQuery) ||
        o.customerCity.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  const counts = {
    all: orders.length,
    processing: orders.filter((o) => o.status === 'processing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      {/* Top Header & Stats */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#43271a]">إدارة ومتابعة طلبات الزبائن</h2>
          <p className="text-xs text-[#82746e]">
            تدفق حي لكافة طلبات محلات الحلويات والشيفات المنزلية
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-[#e7e1de] shadow-xs">
          <span className="text-xs text-[#82746e]">إجمالي دخل الطلبات:</span>
          <span className="text-sm font-bold text-[#43271a] tabular-nums">
            {totalRevenue.toLocaleString('en-US')} ر.س
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="p-4 rounded-3xl bg-white border border-[#e7e1de] shadow-sm flex flex-col gap-3">
        {/* Search */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#82746e] absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم الطلب (BK-1082)، اسم العميل، المدينة، أو رقم الجوال..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[#f8f2ef] border border-[#d4c3bc]/60 text-xs sm:text-sm text-[#1d1b19] focus:outline-none focus:ring-2 focus:ring-[#43271a]"
          />
        </div>

        {/* Status segmented filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#43271a] text-white'
                : 'bg-[#f3ede9] text-[#50443f] hover:bg-[#ede7e3]'
            }`}
          >
            جميع الطلبات ({counts.all})
          </button>
          <button
            onClick={() => setStatusFilter('processing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === 'processing'
                ? 'bg-[#43271a] text-[#ffdbcc] font-bold'
                : 'bg-[#ffdbcc]/50 text-[#43271a] hover:bg-[#ffdbcc]'
            }`}
          >
            قيد التجهيز ({counts.processing})
          </button>
          <button
            onClick={() => setStatusFilter('shipped')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === 'shipped'
                ? 'bg-[#5c3d2e] text-white'
                : 'bg-[#f3ede9] text-[#5c3d2e] hover:bg-[#ede7e3]'
            }`}
          >
            تم الشحن ({counts.shipped})
          </button>
          <button
            onClick={() => setStatusFilter('delivered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === 'delivered'
                ? 'bg-[#1b322a] text-white'
                : 'bg-[#cde9dc] text-[#1b322a] hover:bg-[#b2ccc1]'
            }`}
          >
            تم التوصيل ({counts.delivered})
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === 'cancelled'
                ? 'bg-[#ba1a1a] text-white'
                : 'bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffdad6]/70'
            }`}
          >
            ملغية ({counts.cancelled})
          </button>
        </div>
      </div>

      {/* Orders List or Pure Empty State */}
      {orders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#e7e1de] flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#f8f2ef] flex items-center justify-center text-[#82746e]">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#43271a]">لا توجد طلبات شراء حتى الآن</h3>
          <p className="text-xs text-[#82746e] max-w-md leading-relaxed">
            لا توجد أي طلبات وهمية أو بيانات اصطناعية. ستظهر طلبات الزبائن وتفاصيل الفواتير وحالات التجهيز هنا فور تسجيل أي عملية شراء حقيقية من واجهة المتجر.
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#e7e1de] flex flex-col items-center gap-3">
          <ShoppingBag className="w-12 h-12 text-[#d4c3bc]" />
          <h3 className="text-base font-bold text-[#43271a]">لا توجد طلبات تطابق هذا التصنيف</h3>
          <p className="text-xs text-[#82746e]">جرّب تغيير حالة الفلتر أو البحث عن عميل آخر</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {filteredOrders.map((order) => {
            const isProcessing = order.status === 'processing';
            const isShipped = order.status === 'shipped';
            const isDelivered = order.status === 'delivered';
            const isCancelled = order.status === 'cancelled';

            return (
              <div
                key={order.id}
                className="p-4 sm:p-5 rounded-3xl bg-white border border-[#e7e1de] shadow-sm flex flex-col gap-3.5 hover:border-[#43271a]/50 transition-all"
              >
                {/* Top order summary header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#f8f2ef] flex items-center justify-center text-[#43271a]">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#43271a]">
                          الطلب #{order.id}
                        </span>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#f3ede9] text-[#50443f] font-medium">
                          {order.customerType}
                        </span>
                      </div>
                      <span className="text-xs text-[#82746e]">
                        {new Date(order.createdAt).toLocaleString('ar-SA')}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isProcessing && (
                      <span className="px-3 py-1 rounded-full bg-[#ffdbcc] text-[#43271a] text-xs font-bold flex items-center gap-1.5 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-[#43271a] animate-ping" />
                        قيد التجهيز
                      </span>
                    )}
                    {isShipped && (
                      <span className="px-3 py-1 rounded-full bg-[#e7e1de] text-[#43271a] text-xs font-semibold flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#5c3d2e]" />
                        تم الشحن
                      </span>
                    )}
                    {isDelivered && (
                      <span className="px-3 py-1 rounded-full bg-[#cde9dc] text-[#1b322a] text-xs font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1b322a]" />
                        مكتمل وتم التسليم
                      </span>
                    )}
                    {isCancelled && (
                      <span className="px-3 py-1 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-xs font-semibold flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-[#ba1a1a]" />
                        ملغي
                      </span>
                    )}
                  </div>
                </div>

                {/* Customer and address row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-2xl bg-[#fdfbf9] border border-[#f3ede9] text-xs text-[#50443f]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#82746e]">العميل:</span>
                    <strong className="text-[#1d1b19]">{order.customerName}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#82746e]" />
                    <span dir="ltr" className="font-mono">{order.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#82746e]" />
                    <span className="truncate">{order.customerCity} - {order.shippingAddress}</span>
                  </div>
                </div>

                {/* Items Description */}
                <div className="text-xs text-[#50443f] bg-[#f8f2ef] p-3 rounded-2xl">
                  <span className="text-[#82746e]">محتويات الطلب: </span>
                  <span className="font-medium text-[#1d1b19]">{order.itemsSummary}</span>
                </div>

                {/* Actions & Total Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#f3ede9]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#82746e]">المبلغ الإجمالي:</span>
                    <span className="text-lg font-bold text-[#43271a] tabular-nums">
                      {order.totalAmount} <span className="text-xs font-normal text-[#82746e]">ر.س</span>
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#cde9dc] text-[#1b322a] font-medium mr-2">
                      {order.paymentMethod}
                    </span>
                  </div>

                  {/* Status transitions */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isProcessing && (
                      <button
                        onClick={() => onUpdateStatus(order.id, 'shipped')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#5c3d2e] text-white text-xs font-semibold hover:bg-[#43271a] transition-all"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>شحن الطلب</span>
                      </button>
                    )}
                    {isShipped && (
                      <button
                        onClick={() => onUpdateStatus(order.id, 'delivered')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1b322a] text-white text-xs font-semibold hover:bg-[#314940] transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تأكيد التوصيل</span>
                      </button>
                    )}
                    <button
                      onClick={() => onSelectOrder(order)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#f3ede9] text-[#43271a] text-xs font-medium hover:bg-[#ede7e3] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>تفاصيل الفاتورة</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
